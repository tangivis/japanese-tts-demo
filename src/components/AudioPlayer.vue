<template>
  <el-card class="audio-player-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon"><VideoPlay /></el-icon>
        <span>音声プレイヤー</span>
      </div>
    </template>

    <div class="player-content">
      <!-- 播放控制按钮 -->
      <div class="player-controls">
        <el-button
          :type="isPlaying ? 'warning' : 'primary'"
          size="large"
          circle
          @click="togglePlay"
          class="play-btn"
        >
          <el-icon size="24">
            <VideoPause v-if="isPlaying" />
            <VideoPlay v-else />
          </el-icon>
        </el-button>

        <el-button
          size="large"
          circle
          @click="stop"
          :disabled="!isPlaying && currentTime === 0"
        >
          <el-icon size="20"><RefreshLeft /></el-icon>
        </el-button>
      </div>

      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time-display">{{ formatTime(currentTime) }}</span>
        <el-slider
          v-model="progress"
          :max="100"
          class="progress-slider"
          @change="handleSeek"
          :disabled="!audioData || audioData?.isWebSpeech"
        />
        <span class="time-display">{{ formatTime(duration) }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          @click="$emit('clear')"
          :disabled="!audioData"
        >
          <el-icon><Delete /></el-icon>
          クリア
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, defineEmits } from 'vue'
import { VideoPlay, VideoPause, RefreshLeft, Delete } from '@element-plus/icons-vue'
import { useTTS } from '../composables/useTTS'

const emit = defineEmits(['clear'])
const { createControlledSpeech } = useTTS()

const props = defineProps({
  audioData: {
    type: Object,
    default: null
  },
  textInputRef: {
    type: Object,
    default: null
  }
})

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const audioPlayer = ref(null)
const currentUtterance = ref(null)

let timeUpdateInterval = null

const createAudioPlayer = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }

  if (props.audioData?.blob) {
    audioPlayer.value = new Audio(URL.createObjectURL(props.audioData.blob))
    
    audioPlayer.value.addEventListener('loadedmetadata', () => {
      duration.value = audioPlayer.value.duration || 0
    })
    
    audioPlayer.value.addEventListener('ended', () => {
      isPlaying.value = false
      currentTime.value = 0
      progress.value = 0
      stopTimeTracking()
    })
  } else if (props.audioData?.isWebSpeech) {
    // 为Web Speech API设置估算时长
    duration.value = props.audioData.duration || 0
    currentTime.value = 0
    progress.value = 0
  }
}

const togglePlay = async () => {
  // 处理Web Speech API - 只支持播放/停止，不支持暂停
  if (props.audioData?.isWebSpeech) {
    if (isPlaying.value) {
      // 停止：取消当前语音并重置
      speechSynthesis.cancel()
      isPlaying.value = false
      currentTime.value = 0
      progress.value = 0
      stopTimeTracking()
      currentUtterance.value = null
    } else {
      // 播放：从输入框获取最新文字
      try {
        let textToSpeak = props.audioData.text
        
        // 如果有输入框引用，从输入框获取最新文字
        if (props.textInputRef && props.textInputRef.getText) {
          const currentText = props.textInputRef.getText().trim()
          if (currentText) {
            textToSpeak = currentText
          }
        }
        
        const utterance = createControlledSpeech(textToSpeak)
        
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
          currentUtterance.value = null
        }
        
        utterance.onerror = () => {
          isPlaying.value = false
          currentTime.value = 0
          progress.value = 0
          stopTimeTracking()
          currentUtterance.value = null
        }
        
        currentUtterance.value = utterance
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Speech synthesis error:', error)
      }
    }
    return
  }

  // 处理普通音频文件
  if (!audioPlayer.value) return

  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
    stopTimeTracking()
  } else {
    try {
      await audioPlayer.value.play()
      isPlaying.value = true
      startTimeTracking()
    } catch (error) {
      console.error('Play error:', error)
    }
  }
}

const stop = () => {
  // 处理Web Speech API
  if (props.audioData?.isWebSpeech) {
    speechSynthesis.cancel()
    currentTime.value = 0
    progress.value = 0
    isPlaying.value = false
    stopTimeTracking()
    currentUtterance.value = null
    return
  }

  // 处理普通音频文件
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    currentTime.value = 0
    progress.value = 0
    isPlaying.value = false
    stopTimeTracking()
  }
}

const handleSeek = (value) => {
  // Web Speech API不支持拖动，禁用
  if (props.audioData?.isWebSpeech) {
    return
  }
  
  if (audioPlayer.value && duration.value > 0) {
    const newTime = (value / 100) * duration.value
    audioPlayer.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const startTimeTracking = () => {
  stopTimeTracking()
  timeUpdateInterval = setInterval(() => {
    if (props.audioData?.isWebSpeech && isPlaying.value) {
      // 为Web Speech API模拟进度
      currentTime.value += 0.1
      if (duration.value > 0) {
        progress.value = Math.min(100, (currentTime.value / duration.value) * 100)
      }
      // 检查是否应该结束
      if (currentTime.value >= duration.value) {
        isPlaying.value = false
        currentTime.value = duration.value
        progress.value = 100
        stopTimeTracking()
      }
    } else if (audioPlayer.value && isPlaying.value) {
      currentTime.value = audioPlayer.value.currentTime
      if (duration.value > 0) {
        progress.value = (currentTime.value / duration.value) * 100
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

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

watch(() => props.audioData, (newData) => {
  createAudioPlayer()
  
  // 如果是新的Web Speech API数据，自动播放
  if (newData?.isWebSpeech) {
    setTimeout(() => {
      togglePlay()
    }, 100)
  }
}, { immediate: true })

onMounted(() => {
  // 监听全局语音合成状态变化
  const handleSpeechEnd = () => {
    if (props.audioData?.isWebSpeech && isPlaying.value) {
      isPlaying.value = false
      currentTime.value = 0
      progress.value = 0
      stopTimeTracking()
      currentUtterance.value = null
    }
  }
  
  // 监听语音合成结束事件
  speechSynthesis.addEventListener('voiceschanged', handleSpeechEnd)
  
  return () => {
    speechSynthesis.removeEventListener('voiceschanged', handleSpeechEnd)
  }
})

onUnmounted(() => {
  stopTimeTracking()
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
  // 清理语音合成
  if (currentUtterance.value) {
    speechSynthesis.cancel()
  }
})
</script>

<style scoped>
.audio-player-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.header-icon {
  color: #67c23a;
}

.player-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-btn {
  width: 64px;
  height: 64px;
  background: linear-gradient(45deg, #67c23a, #85ce61);
  border: none;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.play-btn:hover {
  background: linear-gradient(45deg, #529b2e, #67c23a);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.time-display {
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  color: #606266;
  min-width: 45px;
  text-align: center;
}

.progress-slider {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .progress-section {
    max-width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 200px;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
  }
}
</style>