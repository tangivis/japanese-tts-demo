<template>
  <div class="info-dropdown" :class="{ 'is-open': isOpen }">
    <button
      class="dropdown-trigger"
      :class="{ 'is-active': isOpen }"
      title="DEMO説明"
      @click="toggleDropdown"
    >
      <el-icon><InfoFilled /></el-icon>
      <span class="button-text">DEMO説明</span>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-content">
        <div class="dropdown-section">
          <h3 class="section-title">🎯 実装機能</h3>
          <ul class="feature-list">
            <li>日本語TTS音声合成</li>
            <li>テキスト/ファイル入力対応</li>
            <li>リアルタイム音声再生</li>
            <li>音声履歴管理</li>
            <li>簡単操作インターフェース</li>
          </ul>
        </div>

        <div class="dropdown-section">
          <h3 class="section-title">⚡ 使用技術</h3>
          <ul class="tech-list">
            <li>フロントエンド: Vue.js 3 + Composition API</li>
            <li>TTS: Web Speech API</li>
            <li>UI: Element Plus</li>
            <li>フロントエンドアプリ（バックエンドなし）</li>
            <li>デプロイ: Cloudflare Pages</li>
          </ul>
        </div>

        <div class="dropdown-section">
          <h3 class="section-title">📋 操作手順</h3>
          <ol class="instruction-list">
            <li>テキストを入力またはファイルアップロード</li>
            <li>「音声を生成」ボタンをクリック</li>
            <li>自動再生開始、制御ボタンで操作</li>
            <li>履歴から過去のテキストを再選択可能</li>
          </ol>
        </div>

        <div class="dropdown-section">
          <h3 class="section-title">⚠️ 現在の制限</h3>
          <ul class="todo-list">
            <li>TTS制限: 音声は実時間生成で正確な時間取得不可</li>
            <li>音声ダウンロード機能なし</li>
            <li>純粋フロントエンド: 履歴はページ更新で消失</li>
          </ul>
        </div>

        <div class="dropdown-section">
          <h3 class="section-title">🔧 今後のTODO</h3>
          <ul class="todo-list">
            <li>より高品質なTTS API調査</li>
            <li>バックエンド開発（API呼び出し用）</li>
            <li>より多くのファイル形式サポート</li>
            <li>LLMによる職場対話形式変換</li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (event) => {
  if (!event.target.closest('.info-dropdown')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.info-dropdown {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.dropdown-trigger {
  width: auto;
  min-width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
}

.button-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.dropdown-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.dropdown-trigger.is-active {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.dropdown-content {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform-origin: bottom right;
}

.dropdown-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.feature-list,
.tech-list,
.instruction-list,
.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-list li,
.tech-list li,
.todo-list li {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 4px;
  padding-left: 12px;
  position: relative;
}

.feature-list li:before,
.tech-list li:before,
.todo-list li:before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
  font-weight: bold;
}

.instruction-list {
  counter-reset: step-counter;
}

.instruction-list li {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 4px;
  padding-left: 20px;
  position: relative;
  counter-increment: step-counter;
}

.instruction-list li:before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .info-dropdown {
    bottom: 20px;
    right: 20px;
  }

  .dropdown-trigger {
    min-width: 48px;
    height: 48px;
    border-radius: 24px;
    font-size: 20px;
    padding: 0 12px;
  }

  .button-text {
    font-size: 11px;
  }

  .dropdown-content {
    width: 280px;
    bottom: 60px;
  }

  .dropdown-section {
    padding: 12px 16px;
  }

  .section-title {
    font-size: 13px;
  }

  .feature-list li,
  .tech-list li,
  .instruction-list li,
  .todo-list li {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .info-dropdown {
    bottom: 16px;
    right: 16px;
  }

  .dropdown-content {
    width: 260px;
    right: -40px;
  }
}
</style>
