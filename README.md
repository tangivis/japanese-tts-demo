# Japanese TTS Demo - 日本語技術文書対話学習

日本語の技術文書を自然な対話形式のTTS音声に変換するWebアプリケーションのデモです。

## 🎯 プロジェクト概要

技術文書を読むだけでなく、先輩と新人の自然な会話として聞くことで、より理解しやすく、職場での実際のコミュニケーションスタイルを学習できます。

## 🚀 開発手順

### 1. 環境セットアップ

```bash
# プロジェクトディレクトリ作成
mkdir japanese-tts-demo
cd japanese-tts-demo

# Git リポジトリ初期化
git init

# mise でNode.js管理設定
echo '[tools]
node = "20"' > .mise.toml

# mise設定を信頼して適用
mise trust
mise install

# Node.js バージョン確認
node --version  # v20.19.3
npm --version   # 10.8.2
```

### 2. プロジェクト初期化

```bash
# package.json 作成
npm init -y

# 開発用依存関係インストール
npm install --save-dev http-server

# プロジェクト構造作成
mkdir -p src assets docs functions
```

### 3. ファイル構成

```
japanese-tts-demo/
├── .mise.toml              # mise設定（Node.js v20）
├── .gitignore              # Git除外ファイル
├── package.json            # NPM設定
├── index.html              # メインHTML
├── src/
│   ├── style.css          # スタイルシート
│   └── app.js             # JavaScript アプリケーション
├── assets/                # 静的ファイル
├── docs/                  # ドキュメント
└── functions/             # Cloudflare Workers（将来実装）
```

### 4. アプリケーション機能

#### 現在実装済み
- ✅ ファイルアップロード（ドラッグ&ドロップ対応）
- ✅ テキスト直接入力
- ✅ 日本語対話スクリプト生成（モック）
- ✅ Web Speech API による音声再生
- ✅ 対話スクリプト表示
- ✅ レスポンシブデザイン

#### 今後実装予定
- 🔄 実際のTTS API連携（Google Cloud / OpenAI）
- 🔄 AIによる自然な対話生成
- 🔄 複数の音声キャラクター
- 🔄 音声ファイルのダウンロード
- 🔄 Cloudflare Pages デプロイ設定

## 🛠 技術スタック

- **フロントエンド**: Vanilla HTML/CSS/JavaScript
- **音声合成**: Web Speech API（現在）→ Google Cloud TTS（予定）
- **スタイル**: 日本語最適化CSS
- **デプロイ**: Cloudflare Pages（予定）
- **パッケージ管理**: npm + mise

## 🎨 デザイン特徴

- 日本語フォント最適化
- モバイルファーストデザイン
- 音声中心のミニマルUI
- アクセシビリティ配慮

## 🌐 デモ実行

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

## 📝 使い方

1. **文書準備**: 技術文書ファイルをアップロードまたはテキストエリアに貼り付け
2. **対話生成**: 「対話を生成」ボタンをクリック
3. **音声再生**: 生成された対話を音声で再生
4. **スクリプト確認**: 「スクリプト表示」で会話内容を文字で確認

## 🔧 設定

### mise設定 (.mise.toml)
```toml
[tools]
node = "20"
```

### NPMスクリプト
```json
{
  "scripts": {
    "dev": "http-server -p 3000 -c-1",
    "build": "echo 'Building static files...'",
    "deploy": "echo 'Deploy to Cloudflare Pages...'"
  }
}
```

## 🚀 デプロイ計画

### Cloudflare Pages 設定
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `./`
- **Node.js バージョン**: 20

### 環境変数（予定）
```
OPENAI_API_KEY=your_openai_key
GOOGLE_CLOUD_KEY=your_google_key
```

## 📊 コスト見積もり

### 開発・ホスティング
- Cloudflare Pages: **無料**
- GitHub リポジトリ: **無料**

### API使用料（月間1000回利用想定）
- Google Cloud TTS: **約$0.64**
- OpenAI GPT-4 + TTS: **約$2.50**

## 🔄 更新履歴

### v1.0.0 (2025-07-09)
- ✅ 基本的なWeb UI実装
- ✅ モック対話生成機能
- ✅ Web Speech API 音声再生
- ✅ ファイルアップロード機能
- ✅ レスポンシブデザイン

### v1.1.0 (予定)
- 🔄 Google Cloud TTS API 連携
- 🔄 GPT-4 対話生成
- 🔄 音声品質向上

### v1.2.0 (予定)
- 🔄 Cloudflare Pages デプロイ
- 🔄 音声キャッシュ機能
- 🔄 ユーザー設定保存

## 📞 サポート

- **GitHub Issues**: [プロジェクトページ](の課題トラッカー)
- **ドキュメント**: このREADMEファイル
- **デモサイト**: 近日公開予定

---

*最終更新: 2025年7月9日*