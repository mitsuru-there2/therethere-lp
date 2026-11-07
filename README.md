# There There Studio

既存のThere There StudioとAIアプリ診療所を統合した日本語サイト。Astro、EmDash、Cloudflare Workers / D1 / R2を使用する。公開は別途行う。

## ローカル開発

Node.js 24で確認済み。

```sh
npm ci
npm run types
npm run dev
```

プレビューは `http://127.0.0.1:4325`。必要な場合だけ `.dev.vars.example` を `.dev.vars` にコピーしてローカル用通知先を設定する。実際の問い合わせ通知を送るため、本番のWebhookをテストに流用しない。

```sh
npm run check
npm test
npm run build
npx emdash seed seed/seed.json --validate
```

`npm run deploy` は本番向け。公開準備は [EmDash 公開前ToDo](docs/emdash-launch-todo.md) にまとめている。

## ページ構成

| URL | 内容 |
| --- | --- |
| `/` | アプリ開発スタジオとWorks |
| `/recorder`、`/checklist` | 既存アプリの紹介 |
| `/app-clinic` | AIアプリ診療所のLP・相談フォーム |
| `/about` | 共通の運営情報・仮の特商法表記。noindex |
| `/site-privacy` | サイトのプライバシーポリシー |
| `/recorder/privacy`、`/checklist/privacy` | アプリのプライバシーポリシー |
| `/app-clinic/terms` | 診療所のサービス提供条件 |
| `/blog` | EmDashの全公開記事 |
| `/app-clinic/blog` | `app-clinic` タグの公開記事 |
| `/blog/{slug}` | 共通の記事本文 |
| `/_emdash/admin` | EmDash管理画面 |

プライバシーポリシーは同じページで日本語の後に英語を掲載。旧 `/ja/*` と `/privacy` は元のページの意味を保ってリダイレクトする。診断結果・レポート・ダッシュボード機能は含めない。

ブログの定義は `seed/seed.json`、タグの抽出条件とページ分割は `src/lib/blog.ts`、旧URLの対応は `src/lib/redirects.ts` にある。

## 問い合わせ

スタジオは `/api/contact`、診療所は `/api/app-clinic/contact` を利用する。診療所の受付には `migrations/0001_inquiries.sql` のD1テーブルが必要。通知用secretは `GOOGLE_CHAT_CONTACT_WEBHOOK_URL` で共通化している。診療所は `CONTACT_ENABLED=false` または通知先が未設定の場合、フォームを停止してメール窓口を案内する。
