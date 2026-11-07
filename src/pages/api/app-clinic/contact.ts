import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { validateContact, notificationText, isGoogleChatWebhook } from '../../../lib/contact.mjs';

const json = (message: string, status: number) =>
  Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, url }) => {
  if (String(env.CONTACT_ENABLED) === 'false')
    return json('フォーム受付は準備中です。info@therethere.studio へメールでご相談ください。', 503);
  if (!isGoogleChatWebhook(env.GOOGLE_CHAT_CONTACT_WEBHOOK_URL))
    return json('現在フォームを利用できません。メールでご相談ください。', 503);
  if (request.headers.get('Origin') !== url.origin)
    return json('送信元を確認できませんでした。', 403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json'))
    return json('送信形式が正しくありません。', 415);
  // Bound the stream as well as Content-Length (which clients can omit or forge).
  const reader = request.body?.getReader();
  if (!reader) return json('入力内容がありません。', 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 20000) {
      await reader.cancel();
      return json('入力内容が長すぎます。', 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let input: unknown;
  try {
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json('入力内容を確認してください。', 400);
  }
  const { value, error } = validateContact(input);
  if (error || !value) return json(error || '入力内容を確認してください。', 400);
  const key = request.headers.get('Idempotency-Key');
  if (!key || !/^[a-f0-9-]{36}$/.test(key))
    return json('ページを再読み込みしてお試しください。', 400);
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const hash = async (text: string) =>
    Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))),
    )
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
  // Daily hash avoids retaining raw IP addresses in the rate-limit table.
  const ipHash = await hash(`${new Date().toISOString().slice(0, 10)}:${ip}`);
  const payloadHash = await hash(JSON.stringify(value));
  try {
    const existing = await env.DB.prepare(
      'SELECT id, payload_hash FROM clinic_inquiries WHERE request_key = ?',
    )
      .bind(key)
      .first<{ id: string; payload_hash: string }>();
    if (existing) {
      if (existing.payload_hash !== payloadHash)
        return json('再送内容が変更されています。ページを再読み込みしてください。', 409);
      return Response.json(
        { reference: existing.id },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const cutoff = Date.now() - 3600000;
    // Atomic limiter: concurrent requests cannot exceed this window's allowance.
    const limiter = await env.DB.prepare(
      'INSERT INTO clinic_rate_limits (ip_hash, window_start, hits) VALUES (?, ?, 1) ON CONFLICT(ip_hash) DO UPDATE SET hits = CASE WHEN window_start < ? THEN 1 ELSE hits + 1 END, window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END RETURNING hits',
    )
      .bind(ipHash, Date.now(), cutoff, cutoff)
      .first<{ hits: number }>();
    if (!limiter || limiter.hits > 5)
      return json('送信回数が多いため、時間をおいてお試しください。', 429);
    const id = crypto.randomUUID();
    const receivedAt = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO clinic_inquiries (id, request_key, payload_hash, name, email, stage, message, support, tools, consent_at, notification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        id,
        key,
        payloadHash,
        value.name,
        value.email,
        value.stage,
        value.message,
        value.support,
        value.tools,
        receivedAt,
        'pending',
      )
      .run();
    // The durable inquiry is the source of truth. Notification failure never loses the request.
    let notified = false;
    try {
      const response = await fetch(env.GOOGLE_CHAT_CONTACT_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notificationText(id, value, receivedAt) }),
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
      });
      notified = response.ok;
      if (!notified)
        console.warn(
          JSON.stringify({
            event: 'inquiry_notification_rejected',
            reference: id,
            status: response.status,
          }),
        );
      await response.body?.cancel();
    } catch (error) {
      // Never log fetch errors: they can contain the secret webhook URL.
      const reason =
        error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'connection';
      console.warn(
        JSON.stringify({ event: 'inquiry_notification_unreachable', reference: id, reason }),
      );
    }
    await env.DB.prepare('UPDATE clinic_inquiries SET notification_status = ? WHERE id = ?')
      .bind(notified ? 'sent' : 'failed', id)
      .run();
    console.info(
      JSON.stringify({
        event: 'inquiry_received',
        reference: id,
        notification: notified ? 'sent' : 'failed',
      }),
    );
    return Response.json(
      { reference: id },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    console.error(JSON.stringify({ event: 'inquiry_storage_error' }));
    return json(
      '受付を確認できませんでした。入力は保持されています。同じ内容で再送できます。',
      503,
    );
  }
};
