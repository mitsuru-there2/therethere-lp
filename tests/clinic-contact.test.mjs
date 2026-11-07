import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, notificationText, isGoogleChatWebhook } from '../src/lib/contact.mjs';
const good = {
  name: 'テスト',
  email: 'test@example.com',
  stage: 'before',
  message: '社内で使う予約アプリの公開設定を相談したいです。',
  support: 'diagnosis',
  tools: '',
  consent: 'yes',
  website: '',
};
test('unknown tools and unpublished app are accepted', () => {
  assert.ok(validateContact(good).value);
});
test('rejects malformed input, missing consent and invalid enums', () => {
  for (const value of [
    null,
    [],
    { ...good, email: 'bad' },
    { ...good, consent: '' },
    { ...good, stage: 'invalid' },
    { ...good, support: 'invalid' },
    { ...good, website: 'bot.example' },
    { ...good, message: 'x'.repeat(4001) },
    { ...good, name: 42 },
  ])
    assert.ok(validateContact(value).error);
});
test('Chat includes all inquiry fields, receipt metadata and consent', () => {
  const inquiry = { ...good, tools: 'Astro\nhttps://example.com' };
  const text = notificationText('test-id', inquiry, '2026-11-03T09:00:00.000Z');
  for (const value of [
    inquiry.name,
    inquiry.email,
    inquiry.message,
    inquiry.tools,
    'test-id',
    '2026-11-03T09:00:00.000Z',
    '公開前',
    '診断とアドバイス',
    '同意：あり',
  ])
    assert.ok(text.includes(value), value);
  assert.match(notificationText('test-id', good, 'test-time'), /記載なし/);
});
test('user input cannot inject Chat mentions or formatting', () => {
  const inquiry = { ...good, message: '<users/all> *urgent* `code` ~deleted~' };
  const text = notificationText('test-id', inquiry, 'test-time');
  assert.doesNotMatch(text, /<users\/all>|\*urgent\*|`code`|~deleted~/);
  assert.match(text, /＜users\/all＞ ＊urgent＊ ｀code｀ ～deleted～/);
  assert.equal(inquiry.message, '<users/all> *urgent* `code` ~deleted~');
});
test('maximum accepted input fits in one Google Chat message', () => {
  const inquiry = {
    ...good,
    name: '界'.repeat(100),
    message: '界'.repeat(4000),
    tools: '界'.repeat(1000),
    email: 'a'.repeat(242) + '@example.com',
  };
  assert.ok(validateContact(inquiry).value);
  const text = notificationText(crypto.randomUUID(), inquiry, new Date().toISOString());
  assert.ok(Buffer.byteLength(JSON.stringify({ text })) < 32000);
});
test('only exact Google Chat HTTPS webhook endpoints are accepted', () => {
  assert.ok(
    isGoogleChatWebhook('https://chat.googleapis.com/v1/spaces/abc/messages?key=test&token=test'),
  );
  for (const url of [
    'https://evil.com/v1/spaces/abc/messages?key=x&token=x',
    'http://chat.googleapis.com/v1/spaces/abc/messages?key=x&token=x',
    'https://chat.googleapis.com.evil.com/v1/spaces/abc/messages?key=x&token=x',
    'https://chat.googleapis.com/v1/spaces/abc/messages',
    '',
  ])
    assert.equal(isGoogleChatWebhook(url), false);
});
