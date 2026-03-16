# TPI Assessment Manager
## Disport World フィジカルスクリーニング管理ツール

### Vercelへのデプロイ手順

#### 1. GitHubにリポジトリを作成
1. [github.com](https://github.com) にログイン
2. 右上の「+」→「New repository」
3. リポジトリ名: `tpi-assessment` など
4. 「Private」を選択（クライアントデータを扱うため）
5. 「Create repository」

#### 2. コードをアップロード
このフォルダの中身をすべてリポジトリにアップロード。
GitHub画面の「Upload files」からドラッグ＆ドロップでもOK。

#### 3. Vercelでデプロイ
1. [vercel.com](https://vercel.com) にアクセス
2. 「Sign up」→ GitHubアカウントで登録
3. 「New Project」→ 先ほど作ったリポジトリを選択
4. 設定はそのまま（自動でViteを検知）→「Deploy」
5. 数分でデプロイ完了 → URLが発行される

#### 4. カスタムドメイン設定（任意）
Vercelのプロジェクト設定 → Domains → `tpi.disport-world.com` などを追加可能。

#### 5. iPadでホーム画面に追加
1. iPadのSafariでデプロイされたURLを開く
2. 共有ボタン（□↑）→「ホーム画面に追加」
3. 「TPI評価」として追加
4. フルスクリーンのネイティブアプリのように起動可能

### 技術情報
- Vite + React 18
- データ保存: localStorage（ブラウザ内に保存）
- PWA対応: ホーム画面追加でフルスクリーン起動
