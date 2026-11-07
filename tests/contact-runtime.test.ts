import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

test('contact delivery runs in workerd and never follows upstream redirects', async (t) => {
  const source = await readFile(new URL('../worker/index.ts', import.meta.url), 'utf8');
  const inquiries = await readFile(new URL('../worker/inquiries.ts', import.meta.url), 'utf8');
  let upstreamStatus = 200;
  const requests: { url: string; text: string }[] = [];
  const mf = new Miniflare(convertV4MiniflareOptions({
    compatibilityDate: '2026-09-18',
    modulesRoot: '/',
    modules: [
      {
        type: 'ESModule', path: '/entry.mjs', contents: `
          import { handleContact } from './worker.mjs';
          export default { fetch(request, env) {
            return handleContact(request, {
              ...env,
              CONTACT_RATE_LIMITER: { async limit() { return { success: true }; } },
            });
          }};
        `,
      },
      {
        type: 'ESModule',
        path: '/worker.mjs',
        contents: stripTypeScriptTypes(source)
          .replaceAll("from './inquiries'", "from './inquiries.mjs'")
,
      },
      { type: 'ESModule', path: '/inquiries.mjs', contents: stripTypeScriptTypes(inquiries) },
    ],
    bindings: {
      GOOGLE_CHAT_CONTACT_WEBHOOK_URL: 'https://chat.googleapis.com/v1/spaces/test/messages?key=fake&token=fake',
    },
    // All outbound traffic terminates here. No Google Chat messages are sent.
    outboundService: async (request) => {
      assert.equal(new URL(request.url).hostname, 'chat.googleapis.com');
      assert.equal(request.method, 'POST');
      const body = await request.json() as { text: string };
      requests.push({ url: request.url, text: body.text });
      return new Response('{}', {
        status: upstreamStatus,
        headers: upstreamStatus === 302 ? { Location: 'https://example.invalid/never-follow' } : {},
      });
    },
  }));
  t.after(() => mf.dispose());

  const submit = () => mf.dispatchFetch('https://therethere.studio/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://therethere.studio', Accept: 'application/json' },
    body: new URLSearchParams({ name: 'Runtime test', email: 'test_user@example.com', inquiry: 'その他', message: 'Runtime test only', consent: 'yes' }),
  });

  await t.test('successful Google Chat response produces a successful form response', async () => {
    const response = await submit();
    assert.equal(response.status, 200);
    assert.equal((await response.json() as { ok: boolean }).ok, true);
    assert.equal(requests.length, 1);
    assert.match(requests[0].text, /test_user@example.com/);
  });

  await t.test('a redirect is rejected without forwarding the inquiry', async () => {
    upstreamStatus = 302;
    const response = await submit();
    assert.equal(response.status, 502);
    assert.equal((await response.json() as { ok: boolean }).ok, false);
    assert.equal(requests.length, 2);
  });

  await t.test('provider errors do not report successful delivery', async () => {
    upstreamStatus = 503;
    assert.equal((await submit()).status, 502);
    assert.equal(requests.length, 3);
  });
});
