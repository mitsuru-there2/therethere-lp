export const inquiryOptions = [
  { value: 'app-development', en: 'App development', ja: 'アプリ開発のご相談' },
  { value: 'kaiju-stamps', en: 'Kaiju Stamps', ja: '怪獣スタンプについて' },
  { value: 'recorder', en: 'Recorder Ishin', ja: 'レコーダー維新について' },
  { value: 'checklist', en: 'Checklist Ishin', ja: 'チェックリスト維新について' },
  { value: 'app-clinic', en: 'AI App Clinic', ja: 'AIアプリ診療所について' },
  { value: 'other', en: 'Something else', ja: 'その他' },
] as const;

/** Option labels published before stable values. Still accepted so an open form can submit. */
export const legacyInquiryLabels: Record<string, string> = {
  'アプリ開発のご相談': 'App development',
  '怪獣スタンプについて': 'Kaiju Stamps',
  'レコーダー維新について': 'Recorder Ishin',
  'チェックリスト維新について': 'Checklist Ishin',
  'その他': 'Something else',
};

export function inquiryLabel(value: string): string | undefined {
  return inquiryOptions.find((item) => item.value === value)?.en ?? legacyInquiryLabels[value];
}
