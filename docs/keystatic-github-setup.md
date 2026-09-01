# Keystatic GitHub モードのセットアップ(エンジニア向け)

デプロイ済みサイトの `/keystatic` からブラウザだけでコンテンツを編集できるようにする
手順。保存 = このリポジトリのデフォルトブランチへのコミット → ホスティングの自動
ビルドで公開反映、という動作になる。

コードは環境変数の有無でモードを自動で切り替える(`keystatic.config.ts` と
`src/lib/keystatic-mode.ts`):

| 状態 | 動作 |
| --- | --- |
| 4つの環境変数がそろっている | GitHub モード。本番の `/keystatic` が有効(GitHub ログイン) |
| そろっていない(未設定・一部欠け) | 本番の `/keystatic` と `/api/keystatic/*` は 404。ローカル開発は従来どおりローカルモード |

## 1. GitHub App を作る

### スクリプトで作る(推奨)

自分のPCでリポジトリのルートから:

```bash
node scripts/setup-keystatic-github.mjs
```

質問(本番ドメイン・App名など)に答えるとブラウザが開くので、GitHub に
ログインして確認ボタンを押すだけ。権限(Contents: Read & Write)や
Callback URL が設定済みの App が作られ、**必要な環境変数一式と Vercel 用の
コマンドがターミナルに表示される**。リポジトリは git remote から自動検出する
ので、プロジェクトを引き継いだ人もそのまま実行できる。

あとはスクリプトの案内どおり、App のインストール(1クリック)と
環境変数の設定(下記 2.)をすれば完了。

### 手動で作る場合

GitHub の Settings → Developer settings → GitHub Apps → **New GitHub App**:

- **GitHub App name / slug**: 例 `mei-portfolio-admin`(slug は後で環境変数に使う)
- **Callback URL**: `https://<本番ドメイン>/api/keystatic/github/oauth/callback`
  (ローカル検証も行うなら `http://127.0.0.1:3000/api/keystatic/github/oauth/callback` も追加)
- **Webhook**: 無効でよい
- **Repository permissions**: Contents — Read & Write のみ
- 作成後、**Generate a new client secret** で secret を発行して控え、
  App をこのリポジトリ1つだけにインストールする

## 2. 環境変数を設定する

ホスティング(Vercel)の Production 環境に以下の4つを設定する:

| 変数 | 中身 |
| --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App の Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App の Client secret(発行して控える) |
| `KEYSTATIC_SECRET` | セッション署名用のランダム文字列。**32文字以上必須**(`openssl rand -hex 32` で生成)。短いと未構成扱いになり `/keystatic` は 404 のまま |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App の slug(App の URL 末尾の名前) |

注意:

- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` は**ビルド時にクライアントへ
  インライン化される**。設定・変更後は再デプロイ(再ビルド)が必要
- プレビュー環境に設定しなければ、プレビューの `/keystatic` は 404 のまま(推奨)

## 3. 動作確認

1. 再デプロイ後、`https://<本番ドメイン>/keystatic` を開く → GitHub ログインが出る
2. リポジトリに**書き込み権限のあるアカウント**でログイン → 既存作品を編集して保存
3. デフォルトブランチにコミットが積まれ、自動ビルドが走って数分で公開に反映される
4. 書き込み権限のないアカウントでは編集できないことを確認する

認証は GitHub 任せで、独自のユーザー管理はない。リポジトリに書き込める人 =
Admin で編集できる人。

## 運用の決めごと

- **デフォルトブランチへの直コミット運用**とする。Keystatic のブランチ切り替え
  機能(下書きブランチ)は使わない(非エンジニアのオーナーにブランチ概念を
  持ち込まないため)。必要になったら Admin 右上のブランチ UI をそのまま使えばよい
- Admin から保存した内容がジェネレーターの検証に落ちると**ビルドが失敗し、公開は
  前の状態のまま**になる。ビルドログに日本語のエラーが出るので、それに従って
  Admin で修正して保存し直す(オーナー向けの説明は content-guide にある)

## プロジェクトを移譲(引き継ぎ)するとき

GitHub App は作成者のアカウントに紐づくため、リポジトリと一緒には移らない。
新しいオーナーは次の手順で自分の App に切り替える:

1. リポジトリの移譲後、新しいオーナーが
   `node scripts/setup-keystatic-github.mjs` を実行して**自分のアカウント
   (または Organization)に新しい App を作る**。リポジトリ名は git remote
   から自動検出される
2. 表示された環境変数をホスティングに設定し直して再デプロイする。
   リポジトリの owner/name が変わった場合はスクリプトが
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` も出力するので、それも設定する
   (`keystatic.config.ts` のフォールバック値を書き換える必要はない)
3. 旧オーナーの App は GitHub の設定画面から削除してよい

## シークレットのローテーション

漏えい時・定期更新時:

1. GitHub App の設定画面で **Generate a new client secret** → 新しい値を
   `KEYSTATIC_GITHUB_CLIENT_SECRET` に設定 → 古い secret を削除
2. `KEYSTATIC_SECRET` は新しいランダム値に差し替えるだけ(全員が再ログインになる)
3. どちらも設定後に再デプロイして反映する
