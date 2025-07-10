<template>
  <div class="mini-player" :class="{ 'playing': isPlaying, 'no-audio': !hasAudio }">
    <div class="player-content">
      <!-- 优化的播放控制 -->
      <div class="player-controls">
        <!-- 主要播放/暂停按钮 -->
        <button
          :disabled="!hasAudio || textChanged"
          @click="handlePrimaryAction"
          class="primary-btn"
          :class="{ 'playing': isPlaying, 'disabled-state': textChanged }"
          :title="getPrimaryButtonTitle()"
        >
          <div class="primary-icon">
            <div v-if="isPlaying" class="pause-bars">
              <span></span>
              <span></span>
            </div>
            <div v-else-if="textChanged" class="sync-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div v-else class="play-triangle"></div>
          </div>
          <div v-if="isPlaying" class="ripple-effect"></div>
        </button>

        <!-- 编辑按钮（仅在非播放时显示） -->
      </div>

      <!-- 状态信息 -->
      <div class="status-info">
        <div class="status-text">
          <span v-if="!hasAudio" class="hint-text">音声を作ってください</span>
          <span v-else-if="textChanged" class="changed-text">テキストが変わりました</span>
          <span v-else-if="isPlaying" class="playing-text">再生中</span>
          <span v-else-if="hasAudio && isPaused" class="paused-text">一時停止中</span>
          <span v-else class="ready-text">再生できます</span>
        </div>
        
        <!-- 简化的进度指示器 -->
        <div v-if="hasAudio" class="activity-indicator">
          <div class="dots" :class="{ 'animating': isPlaying }">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['togglePlay', 'stopPlay'])

const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  hasAudio: {
    type: Boolean,
    default: false
  },
  canPause: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  textChanged: {
    type: Boolean,
    default: false
  }
})

const getPrimaryButtonTitle = () => {
  if (!props.hasAudio) return '音声を作ってください'
  if (props.textChanged) return 'テキストが変わりました。新しい音声を作ってください。'
  if (props.isPlaying) return '一時停止'
  if (props.isPaused) return '再開'
  return '再生'
}

const handlePrimaryAction = () => {
  if (props.textChanged || !props.hasAudio) {
    return
  }
  
  if (props.isPlaying) {
    emit('stopPlay')
  } else {
    emit('togglePlay')
  }
}
</script>

<style scoped>
.mini-player {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.mini-player.playing {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
}

.mini-player.no-audio {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(203, 213, 224, 0.5);
}

.player-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.primary-btn {
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.primary-btn.stop-mode {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.primary-btn:disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  cursor: not-allowed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.primary-btn.disabled-state {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  cursor: not-allowed;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
}

.primary-btn:not(:disabled):hover {
  box-shadow: 0 8px 28px rgba(102, 126, 234, 0.4);
}

.primary-btn:not(:disabled):hover:not(.stop-mode) {
  box-shadow: 0 8px 28px rgba(102, 126, 234, 0.4);
}

.primary-btn:not(:disabled):hover.stop-mode {
  box-shadow: 0 8px 28px rgba(239, 68, 68, 0.4);
}

.primary-btn:not(:disabled):active {
  transform: scale(0.95);
}

.primary-icon {
  position: relative;
  z-index: 2;
}

.play-triangle {
  width: 0;
  height: 0;
  border-left: 12px solid white;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  margin-left: 3px;
}

.pause-bars {
  display: flex;
  gap: 4px;
}

.pause-bars span {
  width: 4px;
  height: 16px;
  background: white;
  border-radius: 2px;
}

.sync-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 1.5s infinite;
}

@keyframes ripple {
  0% {
    width: 32px;
    height: 32px;
    opacity: 0.8;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
  }
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-text {
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.hint-text {
  color: #94a3b8;
  font-weight: 400;
}

.playing-text {
  color: #667eea;
  animation: pulse 2s infinite;
}

.ready-text {
  color: #1e293b;
}

.paused-text {
  color: #f59e0b;
  animation: fade 2s infinite;
}

.changed-text {
  color: #d97706;
  animation: pulse 2s infinite;
}

@keyframes fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.activity-indicator {
  display: flex;
  align-items: center;
}

.dots {
  display: flex;
  gap: 4px;
}

.dots span {
  width: 6px;
  height: 6px;
  background: #cbd5e1;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dots.animating span {
  background: #667eea;
  animation: dotPulse 1.4s infinite;
}

.dots.animating span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots.animating span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  30% {
    transform: scale(1.3);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .mini-player {
    padding: 20px;
    border-radius: 16px;
  }
  
  .player-content {
    gap: 16px;
  }
  
  .primary-btn {
    width: 56px;
    height: 56px;
  }
  
  .play-triangle {
    border-left: 10px solid white;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
  
  .pause-bars span {
    width: 3px;
    height: 14px;
  }
  
  .status-text {
    font-size: 14px;
  }
}
</style>