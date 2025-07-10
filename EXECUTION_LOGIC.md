# 日本語TTS アプリケーション実行ロジック

## 概要
このドキュメントは、日本語TTS（Text-to-Speech）アプリケーションの完全な実行ロジック、状態変化、コンポーネント間の相互作用を詳細に説明します。

## システムアーキテクチャ

### 主要コンポーネント
1. **App.vue** - メインアプリケーションコンテナ
2. **TextInput.vue** - テキスト入力とファイルアップロード
3. **MiniPlayer.vue** - 音声再生コントロール
4. **AudioHistory.vue** - 音声履歴管理
5. **useTTS.js** - TTS機能提供（Web Speech API）

## 状態管理

### グローバル状態 (App.vue)
```javascript
// 音声再生状態
const isPlaying = ref(false)        // 現在再生中かどうか
const hasAudio = ref(false)         // 音声データが存在するかどうか
const processing = ref(false)       // 音声生成処理中かどうか
const isPaused = ref(false)         // 一時停止状態（使用されていない）
const canPause = ref(false)         // 一時停止可能かどうか（常にfalse）

// 音声データ
const duration = ref(0)             // 音声の推定時間
const currentTime = ref(0)          // 現在の再生位置
const progress = ref(0)             // 再生進捗（0-100%）

// 履歴管理
const audioHistory = ref([])        // 音声履歴配列
const currentPlayingId = ref(null)  // 現在再生中のアイテムID
const currentPlayingText = ref('')  // 現在再生中のテキスト

// 内部状態
let currentUtterance = null         // 現在のSpeechSynthesisUtterance
let timeUpdateInterval = null       // 時間更新用インターバル
```

### コンポーネント状態

#### TextInput.vue
```javascript
const text = ref('')                // 入力テキスト
const textChanged = ref(false)      // テキストが変更されたかどうか
const originalText = ref('')        // 元のテキスト
const focused = ref(false)          // フォーカス状態
```

#### MiniPlayer.vue
```javascript
// プロパティのみ（内部状態なし）
props: {
  isPlaying: Boolean,
  hasAudio: Boolean,
  canPause: Boolean,
  isPaused: Boolean
}
```

#### AudioHistory.vue
```javascript
// プロパティのみ（内部状態なし）
props: {
  history: Array,
  currentItemId: String
}
```

## 実行フロー

### 1. アプリケーション初期化
```
1. Vue アプリケーション開始
2. useTTS composable 初期化
3. 各コンポーネントのマウント
4. 初期状態設定（すべてfalse/null）
```

### 2. テキスト入力・音声生成フロー
```
TextInput.vue でテキスト入力
  ↓
"音声を生成"ボタンクリック
  ↓
App.vue handleTextSubmit() 実行
  ↓
processing.value = true （生成中状態）
  ↓
generateAudio() 実行（useTTS.js）
  ↓
Web Speech API で音声生成
  ↓
成功時：
  - hasAudio.value = true
  - duration.value = 推定時間
  - 履歴に追加
  - 自動再生開始
  ↓
processing.value = false （生成完了）
```

### 3. 音声再生フロー
```
startPlaying() 実行
  ↓
既存utterance をキャンセル
  ↓
新しい SpeechSynthesisUtterance 作成
  ↓
イベントリスナー設定：
  - onstart: isPlaying = true, 時間追跡開始
  - onend: isPlaying = false, 時間追跡停止
  - onerror: エラー処理
  ↓
speechSynthesis.speak() 実行
  ↓
音声再生開始
```

### 4. 再生コントロールフロー

#### 再生/停止ボタン（MiniPlayer）
```
MiniPlayer "再生/停止"ボタンクリック
  ↓
emit('togglePlay') 発火
  ↓
App.vue handleTogglePlay() 実行
  ↓
isPlaying.value の状態チェック
  ↓
再生中の場合：
  - handleStopPlay() 実行
  - speechSynthesis.cancel()
  - isPlaying = false
  ↓
停止中の場合：
  - 現在のテキスト取得
  - startPlaying() 実行
```

#### 停止ボタン（MiniPlayer）
```
MiniPlayer "停止"ボタンクリック
  ↓
emit('stopPlay') 発火
  ↓
App.vue handleStopPlay() 実行
  ↓
speechSynthesis.cancel()
  ↓
状態リセット：
  - isPlaying = false
  - currentTime = 0
  - progress = 0
  - 時間追跡停止
```

### 5. 履歴選択フロー
```
AudioHistory でアイテムクリック
  ↓
emit('selectItem', item) 発火
  ↓
App.vue handleSelectItem() 実行
  ↓
テキストを入力欄に設定
  ↓
nextTick() 待機
  ↓
音声状態設定：
  - duration = 推定時間
  - hasAudio = true
  - currentPlayingId = item.id
  ↓
直接再生開始
```

### 6. 停止編集フロー（TextInput）
```
TextInput 再生中オーバーレイの"停止して編集"ボタンクリック
  ↓
emit('stop-playing') 発火
  ↓
App.vue handleStopFromInput() 実行
  ↓
handleStopPlay() 実行（同じ処理）
  ↓
再生停止 + 編集可能状態に戻る
```

## 状態変化マトリックス

### 再生状態の変化
| 現在の状態 | アクション | 結果状態 | 副作用 |
|-----------|-----------|----------|--------|
| 停止中 | テキスト生成 | 自動再生 | hasAudio=true, 履歴追加 |
| 停止中 | 再生ボタン | 再生中 | 時間追跡開始 |
| 再生中 | 停止ボタン | 停止中 | 時間リセット |
| 再生中 | 再生ボタン | 停止中 | 時間リセット |
| 再生中 | 履歴選択 | 新しい音声再生 | 現在の再生停止 |
| 再生中 | 停止して編集 | 停止中 | 編集可能状態 |

### UI表示の変化
| 条件 | TextInput表示 | MiniPlayer表示 | AudioHistory表示 |
|------|---------------|----------------|------------------|
| 初期状態 | 通常入力 | 非表示 | 非表示 |
| 生成中 | 生成中オーバーレイ | 非表示 | 履歴のみ |
| 再生中 | 再生中オーバーレイ | 再生コントロール | 現在項目ハイライト |
| 停止中（音声あり） | 通常入力 | 停止状態コントロール | 通常履歴 |

## 時間推定ロジック

### 日本語テキスト解析
```javascript
calculateAccurateDuration(text) {
  // 文字種別カウント
  const kanjiCount = (text.match(/[\u4e00-\u9faf]/g) || []).length;
  const hiraganaCount = (text.match(/[\u3040-\u309f]/g) || []).length;
  const katakanaCount = (text.match(/[\u30a0-\u30ff]/g) || []).length;
  
  // 複雑度による時間調整
  const complexity = (kanjiCount * 1.3 + hiraganaCount + katakanaCount * 1.1) / cleanText.length;
  
  // 基本時間計算
  const baseTime = cleanText.length * 0.1;
  
  // 最終調整
  return Math.max(2, baseTime * (1 + complexity * 0.5));
}
```

## イベントフロー図

```
[ユーザー入力] 
    ↓
[TextInput コンポーネント]
    ↓ text-submit
[App.vue メインロジック]
    ↓ 
[useTTS.js 音声生成]
    ↓
[MiniPlayer 再生コントロール]
    ↓ toggle-play/stop-play
[App.vue 再生管理]
    ↓
[AudioHistory 履歴管理]
    ↓ select-item
[App.vue 履歴再生]
```

## エラーハンドリング

### TTS生成エラー
```javascript
try {
  const audioData = await generateAudio(text);
  // 成功処理
} catch (error) {
  console.error('TTS Error:', error);
  ElMessage.error('音声生成に失敗しました');
  processing.value = false;
}
```

### 再生エラー
```javascript
utterance.onerror = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  progress.value = 0;
  stopTimeTracking();
  currentUtterance = null;
}
```

## パフォーマンス最適化

### 時間追跡最適化
- 100ms間隔でのインターバル更新
- 再生停止時の即座なクリーンアップ
- 重複インターバルの防止

### メモリ管理
- 履歴上限10件
- 古い音声データの自動削除
- コンポーネント破棄時のクリーンアップ

## セキュリティ考慮事項

### 入力検証
- ファイルサイズ制限（テキスト入力のみ）
- 文字数制限（2000文字）
- 不正な音声データの検証

### XSS対策
- テキスト表示時のHTMLエスケープ
- 動的DOM操作の制限

## 今後の改善点

1. **一時停止機能の実装**
   - Web Speech API の制限により現在未実装
   - 将来的にはブラウザ対応状況に応じて実装

2. **音声品質の向上**
   - より詳細な日本語解析
   - ユーザー設定による速度・音程調整

3. **履歴機能の拡張**
   - 永続化ストレージ
   - 音声ファイルの保存機能

4. **アクセシビリティの向上**
   - キーボードナビゲーション
   - スクリーンリーダー対応

## 技術仕様

### 使用技術
- Vue 3 Composition API
- Web Speech API
- Element Plus UI
- JavaScript ES6+

### ブラウザ対応
- Chrome 33+
- Firefox 49+
- Safari 14.1+
- Edge 14+

### 制限事項
- Web Speech API の制限により一時停止不可
- ブラウザ依存の音声品質
- オフライン動作不可

---

*このドキュメントは2025年1月10日時点の実装に基づいています。*