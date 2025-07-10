<template>
  <div class="text-input-container" :class="{ 'playing': isPlaying, 'generating': loading }">
    <div class="input-header">
      <div class="header-content">
        <div class="header-icon">✏️</div>
        <span class="header-title">テキスト入力</span>
        <div v-if="isPlaying" class="status-badge playing">再生中</div>
        <div v-else-if="loading" class="status-badge generating">生成中</div>
      </div>
    </div>

    <div class="input-content">
      <!-- 智能文件上传区域 -->
      <div 
        class="upload-section"
        :class="{ 'compact': text.trim() }"
        v-show="!isPlaying"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".txt,.md"
          @change="handleFileChange"
          style="display: none"
        />
        <div class="upload-area" @click="triggerFileSelect">
          <div class="upload-icon">📄</div>
          <div class="upload-text">
            <span>ファイルを選択</span>
          </div>
        </div>
      </div>

      <!-- 智能文本输入区域 -->
      <div class="textarea-section">
        <div class="textarea-wrapper" :class="{ 'disabled': isPlaying }">
          <textarea
            ref="textareaRef"
            v-model="text"
            :disabled="isPlaying"
            :placeholder="getPlaceholder()"
            class="smart-textarea"
            @input="onTextChange"
            @focus="onFocus"
            @blur="onBlur"
            rows="6"
          ></textarea>
          
          <!-- 播放时的覆盖层 -->
          <div v-if="isPlaying" class="playing-overlay">
            <div class="playing-content">
              <div class="playing-icon">
                <div class="sound-waves">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <p class="playing-message">音声再生中...</p>
              <button @click="$emit('stop-playing')" class="stop-btn">
                停止して編集
              </button>
            </div>
          </div>
        </div>

        <!-- 字符计数和提示 -->
        <div class="textarea-footer" v-show="!isPlaying">
          <div class="char-count" :class="{ 'warning': text.length > 1000 }">
            {{ text.length }} / 2000文字
          </div>
          <div class="input-hints">
            <span v-if="text.length === 0" class="hint">日本語のテキストを入力してください</span>
            <span v-else-if="text.length < 10" class="hint">もう少し長いテキストをお試しください</span>
            <span v-else-if="text.length > 1000" class="warning-hint">長いテキストは生成に時間がかかります</span>
            <span v-else class="ready-hint">音声生成の準備完了</span>
          </div>
        </div>
      </div>

      <!-- 智能操作按钮 -->
      <div class="action-section" v-show="!isPlaying">
        <button
          :disabled="!canGenerate"
          class="generate-btn"
          @click="handleGenerate"
        >
          <div class="btn-content">
            <div v-if="loading" class="loading-spinner"></div>
            <div v-else class="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <span>{{ getButtonText() }}</span>
          </div>
        </button>

        <button
          v-if="text.trim()"
          @click="clearText"
          class="clear-btn"
          :disabled="loading"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          クリア
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const emit = defineEmits(['textSubmit', 'stop-playing', 'textChange'])

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  hasAudio: {
    type: Boolean,
    default: false
  }
})

const text = ref('')
const textChanged = ref(false)
const originalText = ref('')
const focused = ref(false)
const fileInput = ref(null)
const textareaRef = ref(null)

const canGenerate = computed(() => {
  return text.value.trim().length >= 1 && text.value.length <= 2000 && !props.loading
})

const getPlaceholder = () => {
  if (props.isPlaying) return ''
  if (props.loading) return '音声を生成しています...'
  return 'ここに日本語のテキストを入力してください...'
}

const getButtonText = () => {
  if (props.loading) return '生成中...'
  return '音声を生成'
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    setText(e.target.result)
  }
  reader.onerror = () => {
    console.error('ファイル読み込みに失敗しました')
  }
  reader.readAsText(file, 'UTF-8')
}

const triggerFileSelect = () => {
  if (!props.isPlaying) {
    fileInput.value?.click()
  }
}

const onTextChange = () => {
  if (text.value !== originalText.value) {
    textChanged.value = true
  }
  emit('textChange', text.value)
}

const onFocus = () => {
  focused.value = true
}

const onBlur = () => {
  focused.value = false
}

const handleGenerate = () => {
  if (canGenerate.value) {
    originalText.value = text.value
    textChanged.value = false
    emit('textSubmit', text.value.trim())
  }
}

const clearText = () => {
  text.value = ''
  textChanged.value = false
  originalText.value = ''
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const setText = (newText) => {
  text.value = newText
  textChanged.value = true
  emit('textChange', newText)
}

const getText = () => {
  return text.value
}

const resetChangeState = () => {
  originalText.value = text.value
  textChanged.value = false
}

// 暴露方法给父组件
defineExpose({
  clearText,
  setText,
  getText,
  resetChangeState
})
</script>

<style scoped>
.text-input-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.text-input-container.playing {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
}

.text-input-container.generating {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.15);
}

.input-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.playing {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  animation: pulse 2s infinite;
}

.status-badge.generating {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.input-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section {
  transition: all 0.3s ease;
}

.upload-section.compact {
  opacity: 0.6;
  transform: scale(0.95);
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 24px;
  opacity: 0.8;
}

.upload-text span {
  color: #667eea;
  font-weight: 500;
  font-size: 14px;
}

.textarea-section {
  position: relative;
}

.textarea-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.textarea-wrapper.disabled {
  pointer-events: none;
}

.smart-textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  resize: vertical;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.smart-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.smart-textarea:disabled {
  opacity: 0.6;
  background: rgba(248, 250, 252, 0.8);
  color: #94a3b8;
}

.playing-overlay {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.playing-content {
  text-align: center;
  padding: 20px;
}

.playing-icon {
  margin-bottom: 16px;
}

.sound-waves {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 3px;
  height: 40px;
}

.sound-waves span {
  width: 4px;
  background: #667eea;
  border-radius: 2px;
  animation: soundWave 1.5s infinite;
}

.sound-waves span:nth-child(2) { animation-delay: 0.1s; }
.sound-waves span:nth-child(3) { animation-delay: 0.2s; }
.sound-waves span:nth-child(4) { animation-delay: 0.3s; }

@keyframes soundWave {
  0%, 100% { height: 8px; opacity: 0.4; }
  50% { height: 32px; opacity: 1; }
}

.playing-message {
  color: #667eea;
  font-weight: 500;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.stop-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.02);
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 0 4px;
}

.char-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.char-count.warning {
  color: #dc2626;
}

.input-hints {
  font-size: 12px;
}

.hint, .ready-hint {
  color: #64748b;
}

.warning-hint {
  color: #d97706;
}

.ready-hint {
  color: #059669;
  font-weight: 500;
}

.action-section {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.generate-btn {
  flex: 1;
  max-width: 240px;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(102, 126, 234, 0.4);
}

.generate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.clear-btn {
  padding: 12px;
  border: 1px solid rgba(107, 114, 128, 0.2);
  border-radius: 12px;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: translateY(-1px);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .input-content {
    padding: 20px;
    gap: 16px;
  }

  .upload-area {
    padding: 14px 16px;
  }

  .smart-textarea {
    padding: 16px;
    font-size: 14px;
  }

  .action-section {
    flex-direction: column;
    gap: 10px;
  }

  .generate-btn {
    max-width: none;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .input-header {
    padding: 16px 20px 12px;
  }

  .header-title {
    font-size: 15px;
  }

  .input-content {
    padding: 16px;
  }

  .smart-textarea {
    min-height: 100px;
    padding: 14px;
  }

  .textarea-footer {
    flex-direction: column;
    align-items: start;
    gap: 8px;
  }
}
</style>