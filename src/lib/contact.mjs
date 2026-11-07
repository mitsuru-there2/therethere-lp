/** Validate before any persistence; never log user-provided values. */
export function validateContact(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return { error: '入力内容を確認してください。' };
  const read = (key) => (typeof input[key] === 'string' ? input[key].trim() : '');
  const value = {
    name: read('name'),
    email: read('email'),
    stage: read('stage'),
    message: read('message'),
    support: read('support'),
    tools: read('tools'),
  };
  if (read('website')) return { error: '入力内容を確認してください。' };
  if (!value.name || value.name.length > 100)
    return { error: 'お名前を100文字以内で入力してください。' };
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
    return { error: 'メールアドレスを確認してください。' };
  if (!['before', 'live', 'changed'].includes(value.stage))
    return { error: 'アプリの状況を選択してください。' };
  if (value.message.length < 10 || value.message.length > 4000)
    return { error: '相談内容を10〜4,000文字で入力してください。' };
  if (!['diagnosis', 'repair', 'maintenance', 'unsure'].includes(value.support))
    return { error: '希望する支援を選択してください。' };
  if (value.tools.length > 1000)
    return { error: 'URLや使用ツールは1,000文字以内で入力してください。' };
  if (read('consent') !== 'yes') return { error: '情報の取り扱いへの同意を確認してください。' };
  return { value };
}

export function notificationText(reference, inquiry, receivedAt) {
  const stages = { before: '公開前', live: '運用中', changed: '変更後' };
  const supports = {
    diagnosis: '診断とアドバイス',
    repair: '修正や公開も相談したい',
    maintenance: '保守も相談したい',
    unsure: 'まだ分からない',
  };
  // Keep user text from injecting Chat mentions, links or formatting.
  // The original input remains unchanged in D1.
  const plain = (value) =>
    String(value).replace(
      /[<>*`~]/g,
      (character) => ({ '<': '＜', '>': '＞', '*': '＊', '`': '｀', '~': '～' })[character],
    );
  return [
    'AIアプリ診療所に新しい相談が届きました。',
    `受付番号：${reference}`,
    `受付日時：${receivedAt}（UTC）`,
    '',
    `お名前・活動名：${plain(inquiry.name)}`,
    `メールアドレス：${plain(inquiry.email)}`,
    `アプリの状況：${stages[inquiry.stage]}`,
    `希望する支援：${supports[inquiry.support]}`,
    '',
    '【相談したいこと】',
    plain(inquiry.message),
    '',
    '【URLや使用ツール】',
    inquiry.tools ? plain(inquiry.tools) : '記載なし',
    '',
    '情報の取り扱いへの同意：あり',
  ].join('\n');
}

export function isGoogleChatWebhook(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'chat.googleapis.com' &&
      /^\/v1\/spaces\/[^/]+\/messages$/.test(url.pathname) &&
      url.searchParams.has('key') &&
      url.searchParams.has('token')
    );
  } catch {
    return false;
  }
}
