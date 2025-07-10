<template>
  <div class="app">
    <div class="background-overlay"></div>
    <div class="main-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="title">
            <el-icon class="title-icon"><Microphone /></el-icon>
            日本語 TTS
          </h1>
          <p class="subtitle">テキストを自然な音声に変換</p>
        </div>
      </header>

      <main class="main-content">
        <div class="content-wrapper">
          <!-- 文本输入区域 -->
          <TextInput 
            ref="textInputRef"
            @text-submit="handleTextSubmit"
            :loading="processing"
          />
          
          <!-- 简化的播放控制器 -->
          <div v-if="hasAudio" class="player-container">
            <MiniPlayer 
              :is-playing="isPlaying"
              :current-time="currentTime"
              :duration="duration"
              :progress="progress"
              @toggle-play="handleTogglePlay"
              @stop="handleStop"
            />
          </div>
          
          <!-- 历史记录 -->
          <AudioHistory 
            v-if="audioHistory.length > 0"
            :history="audioHistory"
            @replay="handleReplay"
            @delete="handleDeleteHistory"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Microphone } from '@element-plus/icons-vue'
import TextInput from './components/TextInput.vue'
import MiniPlayer from './components/MiniPlayer.vue'
import AudioHistory from './components/AudioHistory.vue'
import { useTTS } from './composables/useTTS'

const { generateAudio, isGenerating, createControlledSpeech } = useTTS()

const processing = ref(false)
const hasAudio = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const audioHistory = ref([])
const textInputRef = ref(null)

let currentUtterance = null
let timeUpdateInterval = null

const handleTextSubmit = async (text) => {
  if (!text.trim()) {
    ElMessage.warning('テキストを入力してください')
    return
  }

  processing.value = true
  
  try {
    const audioData = await generateAudio(text)
    duration.value = audioData.duration || 0
    hasAudio.value = true
    
    // 添加到历史记录
    addToHistory(text)
    
    // 自动开始播放
    await nextTick()
    startPlaying(text)
    
    ElMessage.success('音声生成完了')
  } catch (error) {
    console.error('TTS Error:', error)
    ElMessage.error('音声生成に失敗しました')
  } finally {
    processing.value = false
  }
}

const startPlaying = (text) => {
  try {
    if (currentUtterance) {
      speechSynthesis.cancel()
    }

    const utterance = createControlledSpeech(text)
    
    utterance.onstart = () => {
      isPlaying.value = true
      currentTime.value = 0
      progress.value = 0
      startTimeTracking()
    }
    
    utterance.onend = () => {
      isPlaying.value = false
      currentTime.value = 0
      progress.value = 0
      stopTimeTracking()
      currentUtterance = null
    }
    
    utterance.onerror = () => {
      isPlaying.value = false
      currentTime.value = 0
      progress.value = 0
      stopTimeTracking()
      currentUtterance = null
    }
    
    currentUtterance = utterance
    speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('Speech synthesis error:', error)
  }
}

const handleTogglePlay = () => {
  if (isPlaying.value) {
    // 停止播放
    speechSynthesis.cancel()
    isPlaying.value = false
    currentTime.value = 0
    progress.value = 0
    stopTimeTracking()
    currentUtterance = null
  } else {
    // 从输入框获取当前文字并播放
    const currentText = textInputRef.value?.getText()?.trim()
    if (currentText) {
      startPlaying(currentText)
    }
  }
}

const handleStop = () => {
  speechSynthesis.cancel()
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
  stopTimeTracking()
  currentUtterance = null
  hasAudio.value = false
}

const startTimeTracking = () => {
  stopTimeTracking()
  timeUpdateInterval = setInterval(() => {
    if (isPlaying.value && duration.value > 0) {
      currentTime.value += 0.1
      progress.value = Math.min(100, (currentTime.value / duration.value) * 100)
      
      if (currentTime.value >= duration.value) {
        isPlaying.value = false
        currentTime.value = duration.value
        progress.value = 100
        stopTimeTracking()
      }
    }
  }, 100)
}

const stopTimeTracking = () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
}

const addToHistory = (text) => {
  const historyItem = {
    id: Date.now().toString(),
    text: text.length > 50 ? text.substring(0, 50) + '...' : text,
    fullText: text,
    timestamp: new Date().toLocaleString('ja-JP')
  }
  
  audioHistory.value.unshift(historyItem)
  
  if (audioHistory.value.length > 10) {
    audioHistory.value = audioHistory.value.slice(0, 10)
  }
}

const handleReplay = async (item) => {
  // 设置文字到输入框
  if (textInputRef.value) {
    textInputRef.value.setText(item.fullText)
  }
  
  // 等待下一个tick确保文字已设置
  await nextTick()
  
  // 直接播放
  duration.value = estimateDuration(item.fullText)
  hasAudio.value = true
  startPlaying(item.fullText)
  
  ElMessage.success('音声再生開始')
}

const handleDeleteHistory = (id) => {
  const index = audioHistory.value.findIndex(item => item.id === id)
  if (index !== -1) {
    audioHistory.value.splice(index, 1)
  }
}

const estimateDuration = (text) => {
  const charactersPerSecond = 8
  return Math.max(2, text.length / charactersPerSecond)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  position: relative;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 40px 20px 20px;
  text-align: center;
  z-index: 10;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  letter-spacing: -0.025em;
}

.title-icon {
  font-size: 2.2rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 12px 0 0 0;
  font-weight: 400;
  letter-spacing: 0.025em;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  max-width: 700px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.player-container {
  transform: translateY(0);
  transition: all 0.3s ease;
}

.player-container:hover {
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 30px 20px 15px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .main-content {
    padding: 15px;
  }
  
  .content-wrapper {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.8rem;
  }
  
  .title-icon {
    font-size: 1.8rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
}

/* 优雅的进入动画 */
.main-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 为组件添加进入动画 */
.content-wrapper > * {
  animation: slideInUp 0.5s ease-out;
  animation-fill-mode: both;
}

.content-wrapper > *:nth-child(1) {
  animation-delay: 0.1s;
}

.content-wrapper > *:nth-child(2) {
  animation-delay: 0.2s;
}

.content-wrapper > *:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>