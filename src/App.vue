<template>
  <div class="app">
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-content">
          <h1 class="title">
            <el-icon class="title-icon"><Microphone /></el-icon>
            日本語 TTS
          </h1>
          <p class="subtitle">テキストを自然な音声に変換</p>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="content-wrapper">
          <!-- 文本输入区域 -->
          <TextInput 
            ref="textInputRef"
            @text-submit="handleTextSubmit"
            :loading="processing"
          />
          
          <!-- 音频播放器 -->
          <AudioPlayer 
            v-if="hasAudio"
            :audio-data="currentAudio"
            @clear="handleClear"
          />
          
          <!-- 历史记录 -->
          <AudioHistory 
            :history="audioHistory"
            @replay="handleReplay"
            @delete="handleDeleteHistory"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Microphone } from '@element-plus/icons-vue'
import TextInput from './components/TextInput.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import AudioHistory from './components/AudioHistory.vue'
import { useTTS } from './composables/useTTS'

const { generateAudio, isGenerating } = useTTS()

const processing = ref(false)
const hasAudio = ref(false)
const currentAudio = ref(null)
const audioHistory = ref([])
const textInputRef = ref(null)

const handleTextSubmit = async (text) => {
  if (!text.trim()) {
    ElMessage.warning('テキストを入力してください')
    return
  }

  processing.value = true
  
  try {
    const audioData = await generateAudio(text)
    currentAudio.value = audioData
    hasAudio.value = true
    
    // 添加到历史记录
    addToHistory(text, audioData)
    
    ElMessage.success('音声生成完了')
  } catch (error) {
    console.error('TTS Error:', error)
    ElMessage.error('音声生成に失敗しました')
  } finally {
    processing.value = false
  }
}

const addToHistory = (text, audioData) => {
  const historyItem = {
    id: Date.now().toString(),
    text: text.length > 50 ? text.substring(0, 50) + '...' : text,
    fullText: text,
    timestamp: new Date().toLocaleString('ja-JP')
  }
  
  audioHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (audioHistory.value.length > 10) {
    audioHistory.value = audioHistory.value.slice(0, 10)
  }
}

const handleReplay = async (item) => {
  processing.value = true
  
  try {
    // 重新生成音频
    const audioData = await generateAudio(item.fullText)
    
    // 先清除当前音频，确保组件重新渲染
    currentAudio.value = null
    hasAudio.value = false
    
    // 等待清除完成
    await nextTick()
    
    // 设置新音频数据
    currentAudio.value = audioData
    hasAudio.value = true
    
    ElMessage.success('音声再生開始')
  } catch (error) {
    console.error('Replay Error:', error)
    ElMessage.error('音声再生に失敗しました')
  } finally {
    processing.value = false
  }
}

const handleDeleteHistory = (id) => {
  const index = audioHistory.value.findIndex(item => item.id === id)
  if (index !== -1) {
    audioHistory.value.splice(index, 1)
  }
}

const handleDownload = () => {
  if (currentAudio.value?.blob) {
    const url = URL.createObjectURL(currentAudio.value.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tts-${Date.now()}.mp3`
    a.click()
    URL.revokeObjectURL(url)
  }
}

const handleClear = () => {
  currentAudio.value = null
  hasAudio.value = false
  // 清除TextInput组件中的文字
  if (textInputRef.value) {
    textInputRef.value.clearText()
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.main-container {
  min-height: 100vh;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
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
}

.title-icon {
  font-size: 2.2rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 8px 0 0 0;
  font-weight: 400;
}

.main-content {
  padding: 40px 20px;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .main-content {
    padding: 20px 15px;
  }
  
  .content-wrapper {
    gap: 20px;
  }
}
</style>