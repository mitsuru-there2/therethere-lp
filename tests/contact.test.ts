import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker, { handleContact, type Env } from '../worker/index';

const values = { name: 'テスト', email: 'test@example.com', company: '', inquiry: 'レコーダー維新について', message: '動作についての質問です。', consent: 'yes' };
function request(changes: Record<string, string> = {}, headers: Record<string, string> = {}) {
  return new Request('https://therethere.studio/api/contact', {
    method: 'POST', headers: { Origin: 'https://therethere.studio', Accept: 'application/json', ...headers }, body: new URLSearchParams({ ...values, ...changes }),
  });
}
function env(overrides: Partial<Env> = {}): Env {
  return { GOOGLE_CHAT_CONTACT_WEBHOOK_URL: 'https://chat.googleapis.com/v1/spaces/test/messages?key=fake&token=fake', CONTACT_RATE_LIMITER: { async limit() { return { success: true }; } }, ASSETS: { async fetch() { return new Response('asset'); } }, ...overrides };
}

test('valid inquiry reaches Google Chat; mentions are neutralized and response is private', async (t) => {
  let sent: { text: string } | undefined;
  t.mock.method(globalThis, 'fetch', async (url: URL, init: RequestInit) => {
    assert.equal(url.hostname, 'chat.googleapis.com');
    sent = JSON.parse(init.body as string);
    return new Response('{}');
  });
  const result = await handleContact(request({ email: 'test_user@example.com', message: 'Hello <users/all> *test*' }), env());
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.match(sent!.text, /New There There Studio inquiry/);
  assert.match(sent!.text, /Locale: ja/);
  assert.match(sent!.text, /Inquiry type: Recorder Ishin/);
  assert.ok(!sent!.text.includes('<users/all>'));
  assert.ok(sent!.text.includes('test_user@example.com'));
  assert.ok((await result.json()).ok);
});

test('validation, origin and consent failures never send a notification', async (t) => {
  const mocked = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not send'); });
  for (const invalid of [{ email: 'bad' }, { name: '  ' }, { consent: '' }, { inquiry: 'unknown' }, { message: 'a'.repeat(5001) }, { name: 'name\nInjected' }]) {
    assert.equal((await handleContact(request(invalid), env())).status, 400);
  }
  assert.equal((await handleContact(request({}, { Origin: 'https://evil.example' }), env())).status, 403);
  assert.equal((await handleContact(request({}, { Origin: 'null' }), env())).status, 403);
  assert.equal(mocked.mock.callCount(), 0);
});

test('honeypot, excessive body and rate limiting prevent sending', async (t) => {
  const mocked = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not send'); });
  assert.equal((await handleContact(request({ website: 'spam.example' }), env())).status, 200);
  assert.equal((await handleContact(request({ message: 'a'.repeat(65000) }), env())).status, 413);
  const limited = await handleContact(request(), env({ CONTACT_RATE_LIMITER: { async limit() { return { success: false }; } } }));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '60');
  assert.equal(mocked.mock.callCount(), 0);
});

test('unconfigured webhook, provider errors, timeouts and limiter failure fail honestly', async (t) => {
  assert.equal((await handleContact(request(), env({ GOOGLE_CHAT_CONTACT_WEBHOOK_URL: undefined }))).status, 503);
  assert.equal((await handleContact(request(), env({ GOOGLE_CHAT_CONTACT_WEBHOOK_URL: 'https://evil.example' }))).status, 503);
  t.mock.method(globalThis, 'fetch', async () => new Response('upstream secret', { status: 500 }));
  const result = await handleContact(request(), env());
  assert.equal(result.status, 502);
  assert.ok(!(await result.text()).includes('upstream secret'));
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('secret-url'); });
  assert.equal((await handleContact(request(), env())).status, 502);
  assert.equal((await handleContact(request(), env({ CONTACT_RATE_LIMITER: { async limit() { throw new Error('down'); } } }))).status, 503);
});

test('native HTML form fallback and static route delegation work', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{}'));
  const result = await handleContact(request({}, { Accept: 'text/html' }), env());
  assert.match(result.headers.get('content-type')!, /text\/html/);
  assert.match(await result.text(), /お問い合わせを受け付けました/);
  assert.equal((await handleContact(new Request('https://therethere.studio/api/contact'), env())).status, 405);
  assert.equal(await (await worker.fetch(new Request('https://therethere.studio/recorder/privacy'), env())).text(), 'asset');
  assert.equal((await worker.fetch(new Request('https://therethere.studio/api/other'), env())).status, 404);
});

test('confirmation stays Japanese even with a legacy English locale', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{}'));
  const english = await handleContact(request({ inquiry: 'other', locale: 'en' }, { Accept: 'text/html' }), env());
  const englishPage = await english.text();
  assert.match(englishPage, /lang="ja"/);
  assert.match(englishPage, /お問い合わせを受け付けました/);
  assert.match(englishPage, /href="\/#contact"/);
  const japanese = await handleContact(request({ inquiry: 'other', locale: 'ja' }), env());
  assert.match((await japanese.json() as { message: string }).message, /受け付けました/);
});
