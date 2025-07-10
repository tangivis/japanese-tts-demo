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
          :disabled="!audioData"
        />
        <span class="time-display">{{ formatTime(duration) }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="success"
          @click="$emit('download')"
          :disabled="!audioData"
        >
          <el-icon><Download /></el-icon>
          ダウンロード
        </el-button>
        
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
import { VideoPlay, VideoPause, RefreshLeft, Download, Delete } from '@element-plus/icons-vue'

const emit = defineEmits(['download', 'clear'])

const props = defineProps({
  audioData: {
    type: Object,
    default: null
  }
})

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const audioPlayer = ref(null)

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
  }
}

const togglePlay = async () => {
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
  if (audioPlayer.value && duration.value > 0) {
    const newTime = (value / 100) * duration.value
    audioPlayer.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const startTimeTracking = () => {
  stopTimeTracking()
  timeUpdateInterval = setInterval(() => {
    if (audioPlayer.value && isPlaying.value) {
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
  if (isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

watch(() => props.audioData, () => {
  createAudioPlayer()
}, { immediate: true })

onUnmounted(() => {
  stopTimeTracking()
  if (audioPlayer.value) {
    audioPlayer.value.pause()
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