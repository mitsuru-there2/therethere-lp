import { inquiryLabel } from './inquiries';

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  GOOGLE_CHAT_CONTACT_WEBHOOK_URL?: string;
  CONTACT_RATE_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

type Locale = 'en' | 'ja';
type MessageKey = 'method' | 'origin' | 'contentType' | 'tooLong' | 'rate' | 'unavailable' | 'shorten' | 'honeypot' | 'invalid' | 'upstream' | 'unconfirmed' | 'success' | 'notFound';

const messages: Record<Locale, Record<MessageKey, string> & { title: string; accepted: string; failed: string; back: string }> = {
  en: {
    title: 'Contact | There There Studio',
    accepted: 'Message received.',
    failed: 'Could not send.',
    back: 'Back to the form',
    method: 'Send this form with POST.',
    origin: 'Send the message from this site’s contact form.',
    contentType: 'Check the form submission format.',
    tooLong: 'That message is too long.',
    rate: 'Too many messages. Wait about a minute, then try again.',
    unavailable: 'The form is unavailable right now. Email info@therethere.studio.',
    shorten: 'Shorten the message and try again.',
    honeypot: 'Message received.',
    invalid: 'Check the fields and your agreement to the privacy notice.',
    upstream: 'Could not send. Wait a moment and try again, or email info@therethere.studio.',
    unconfirmed: 'Could not confirm delivery. Wait a moment and try again, or email info@therethere.studio.',
    success: 'Thank you. We received your message and will reply by email.',
    notFound: 'Page not found.',
  },
  ja: {
    title: 'お問い合わせ | There There Studio',
    accepted: 'お問い合わせを受け付けました。',
    failed: '送信できませんでした。',
    back: 'お問い合わせに戻る',
    method: 'POSTで送信してください。',
    origin: 'このサイトのお問い合わせフォームから送信してください。',
    contentType: 'フォームの送信形式を確認してください。',
    tooLong: 'お問い合わせ内容が長すぎます。',
    rate: '送信回数が多くなっています。1分ほど待ってから再度お試しください。',
    unavailable: '現在フォームをご利用いただけません。info@therethere.studio へご連絡ください。',
    shorten: 'お問い合わせ内容を短くして、もう一度お試しください。',
    honeypot: 'お問い合わせを受け付けました。',
    invalid: '入力内容と、個人情報の取り扱いへの同意をご確認ください。',
    upstream: '送信できませんでした。時間をおいて再度お試しいただくか、info@therethere.studio へご連絡ください。',
    unconfirmed: '送信を確認できませんでした。時間をおいて再度お試しいただくか、info@therethere.studio へご連絡ください。',
    success: 'ありがとうございます。お問い合わせを受け付けました。メールでご返信します。',
    notFound: 'ページが見つかりません。',
  },
};

const MAX_BYTES = 64_000;
const securityHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
};

function responseLocale(_request: Request, _form?: URLSearchParams): Locale { return 'ja'; }

// Responses contain fixed strings only; never reflect submitted personal information.
function reply(request: Request, status: number, key: MessageKey, form?: URLSearchParams): Response {
  const locale = responseLocale(request, form);
  const copy = messages[locale];
  const message = copy[key];
  const headers = new Headers(securityHeaders);
  if (status === 429) headers.set('Retry-After', '60');
  if (status === 405) headers.set('Allow', 'POST');
  if (request.headers.get('accept')?.includes('application/json')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ ok: status === 200, message }), { status, headers });
  }
  headers.set('Content-Type', 'text/html; charset=utf-8');
  const back = '/#contact';
  return new Response(`<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${copy.title}</title><style>body{background:#f7f0d4;color:#141210;font-family:system-ui,sans-serif;max-width:650px;margin:12vh auto;padding:24px;line-height:2}h1{font-size:28px}a{color:#b8354f}</style><main><h1>${status === 200 ? copy.accepted : copy.failed}</h1><p>${message}</p><p><a href="${back}">${copy.back}</a></p><p><a href="mailto:info@therethere.studio">info@therethere.studio</a></p></main></html>`, { status, headers });
}

async function readLimitedBody(request: Request): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error('body_too_large'); }
      body += decoder.decode(value, { stream: true });
    }
    return body + decoder.decode();
  } finally { reader.releaseLock(); }
}

// Neutralize Chat mention/link syntax, preserving email addresses verbatim.
function plainChat(value: string): string {
  return value.replace(/[<>]/g, (char) => char === '<' ? '＜' : '＞');
}

export async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return reply(request, 405, 'method');
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin !== url.origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return reply(request, 403, 'origin');
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    return reply(request, 415, 'contentType');
  }
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return reply(request, 413, 'tooLong');

  // Cloudflare supplies this header. Prefix isolates this site's limiter counters.
  try {
    const limit = await env.CONTACT_RATE_LIMITER.limit({ key: `therethere-contact:${request.headers.get('cf-connecting-ip') || 'local'}` });
    if (!limit.success) return reply(request, 429, 'rate');
  } catch {
    return reply(request, 503, 'unavailable');
  }

  let body: string;
  try { body = await readLimitedBody(request); }
  catch { return reply(request, 413, 'shorten'); }
  const form = new URLSearchParams(body);
  const field = (key: string) => (form.get(key) || '').trim();
  if (field('website')) return reply(request, 200, 'honeypot', form);
  const name = field('name');
  const email = field('email');
  const company = field('company');
  const inquiry = field('inquiry');
  const label = inquiryLabel(inquiry);
  const message = field('message');
  const hasControl = (value: string) => /[\u0000-\u001f\u007f]/.test(value);
  if (!name || name.length > 100 || hasControl(name) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
    || email.length > 254 || company.length > 150 || hasControl(company)
    || !label || !message || message.length > 5000
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message) || field('consent') !== 'yes') {
    return reply(request, 400, 'invalid', form);
  }

  let webhook: URL;
  try {
    webhook = new URL(env.GOOGLE_CHAT_CONTACT_WEBHOOK_URL || '');
    if (webhook.protocol !== 'https:' || webhook.hostname !== 'chat.googleapis.com' || !/^\/v1\/spaces\/[^/]+\/messages$/.test(webhook.pathname)) throw new Error('invalid_webhook');
  } catch {
    return reply(request, 503, 'unavailable', form);
  }
  const locale = responseLocale(request, form);
  const text = [
    '*New There There Studio inquiry*',
    'Source: https://therethere.studio',
    `Locale: ${locale}`,
    `Name: ${plainChat(name)}`,
    `Email: ${plainChat(email)}`,
    ...(company ? [`Company: ${plainChat(company)}`] : []),
    `Inquiry type: ${label}`, '', plainChat(message),
  ].join('\n');
  try {
    const response = await fetch(webhook, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      // workerd supports follow/manual only. Reject 3xx via response.ok below.
      body: JSON.stringify({ text }), signal: AbortSignal.timeout(8000), redirect: 'manual',
    });
    if (!response.ok) return reply(request, 502, 'upstream', form);
  } catch {
    // Do not log errors containing the webhook URL, token, or submitted data.
    return reply(request, 502, 'unconfirmed', form);
  }
  return reply(request, 200, 'success', form);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/api/contact') return handleContact(request, env);
    if (path.startsWith('/api/')) return reply(request, 404, 'notFound');
    return env.ASSETS.fetch(request);
  },
};
