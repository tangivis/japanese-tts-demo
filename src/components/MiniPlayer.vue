<template>
  <div class="mini-player" :class="{ 'playing': isPlaying, 'no-audio': !hasAudio }">
    <div class="player-content">
      <!-- 播放控制 -->
      <div class="player-controls">
        <button
          :disabled="!hasAudio"
          @click="$emit('togglePlay')"
          class="play-btn"
          :class="{ 'playing': isPlaying }"
          :title="getPlayButtonTitle()"
        >
          <div class="play-icon">
            <div v-if="isPlaying" class="pause-bars">
              <span></span>
              <span></span>
            </div>
            <div v-else class="play-triangle"></div>
          </div>
          <div v-if="isPlaying" class="ripple-effect"></div>
        </button>

        <!-- 停止按钮（仅在播放时显示） -->
        <button
          v-if="isPlaying"
          @click="$emit('stopPlay')"
          class="stop-btn"
          title="停止播放"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"/>
          </svg>
        </button>
      </div>

      <!-- 状态信息 -->
      <div class="status-info">
        <div class="status-text">
          <span v-if="!hasAudio" class="hint-text">音声を生成してください</span>
          <span v-else-if="isPlaying && canPause" class="playing-text">再生中（クリックで一時停止）</span>
          <span v-else-if="isPlaying && !canPause" class="playing-text">再生中（停止ボタンで停止）</span>
          <span v-else-if="hasAudio && isPaused" class="paused-text">一時停止中（クリックで再開）</span>
          <span v-else class="ready-text">再生準備完了</span>
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
defineEmits(['togglePlay', 'stopPlay'])

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
  }
})

const getPlayButtonTitle = () => {
  if (!props.hasAudio) return '音声を生成してください'
  if (props.isPlaying) {
    return props.canPause ? 'クリックで一時停止' : '停止ボタンで停止'
  }
  if (props.isPaused) return 'クリックで再開'
  return 'クリックで再生'
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
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.2);
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

.play-btn {
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

.stop-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.play-btn:disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  cursor: not-allowed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.play-btn:not(:disabled):hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(102, 126, 234, 0.4);
}

.play-btn:not(:disabled):active {
  transform: scale(0.95);
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #b91c1c;
  transform: scale(1.05);
}

.stop-btn:active {
  transform: scale(0.95);
}

.play-icon {
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
  
  .play-btn {
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