<template>
  <div class="mini-player">
    <div class="player-content">
      <!-- 播放控制 -->
      <div class="player-controls">
        <el-button
          :type="isPlaying ? 'warning' : 'primary'"
          size="large"
          circle
          @click="$emit('togglePlay')"
          class="play-btn"
        >
          <el-icon size="20">
            <VideoPause v-if="isPlaying" />
            <VideoPlay v-else />
          </el-icon>
        </el-button>

      </div>

      <!-- 时间和进度 -->
      <div class="progress-info">
        <div class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

defineEmits(['togglePlay'])

defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  }
})

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mini-player {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.mini-player:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.player-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.play-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}


.progress-info {
  flex: 1;
  min-width: 0;
}

.time-display {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(107, 114, 128, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .mini-player {
    padding: 16px;
  }
  
  .player-content {
    gap: 16px;
  }
  
  .play-btn {
    width: 48px;
    height: 48px;
  }
  
  .stop-btn {
    width: 38px;
    height: 38px;
  }
  
  .time-display {
    font-size: 12px;
  }
}
</style>