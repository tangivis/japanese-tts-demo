<template>
  <div class="history-container">
    <div class="history-header">
      <div class="header-content">
        <div class="header-icon">📚</div>
        <span class="header-title">履歴</span>
        <div v-if="history.length > 0" class="history-count">{{ history.length }}</div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div v-if="history.length > 0" class="history-list">
      <div 
        v-for="item in history" 
        :key="item.id"
        class="history-item"
        :class="{ 'disabled': isPlaying }"
      >
        <div class="item-main" @click="!isPlaying && handleItemClick(item)">
          <div class="item-text">{{ item.text }}</div>
          <div class="item-meta">
            <span class="item-hint">{{ isPlaying ? '再生中は使えません' : 'クリックで使用' }}</span>
          </div>
        </div>
        
        <div class="item-actions">
          <button 
            class="delete-btn"
            @click="handleDelete(item.id)"
            title="削除"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态占位符 -->
    <div v-else class="empty-state">
      <div class="skeleton-list">
        <!-- 拟物历史条目 1 -->
        <div class="skeleton-item">
          <div class="skeleton-content">
            <div class="skeleton-text skeleton-title"></div>
            <div class="skeleton-text skeleton-subtitle"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
          </div>
        </div>
        
        <!-- 拟物历史条目 2 -->
        <div class="skeleton-item skeleton-delay-1">
          <div class="skeleton-content">
            <div class="skeleton-text skeleton-title"></div>
            <div class="skeleton-text skeleton-subtitle"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
          </div>
        </div>
        
        <!-- 拟物历史条目 3 -->
        <div class="skeleton-item skeleton-delay-2">
          <div class="skeleton-content">
            <div class="skeleton-text skeleton-title"></div>
            <div class="skeleton-text skeleton-subtitle"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
          </div>
        </div>
        
        <!-- 微妙的提示 -->
        <div class="gentle-hint">
          <div class="hint-icon">✨</div>
          <span>音声履歴がここに表示されます</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['selectItem', 'delete'])

defineProps({
  history: {
    type: Array,
    default: () => []
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

const handleItemClick = (item) => {
  emit('selectItem', item)
}

const handleDelete = (itemId) => {
  emit('delete', itemId)
}
</script>

<style scoped>
.history-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-container:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.history-header {
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

.history-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* 拟物列表骨架屏样式 */
.empty-state {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.skeleton-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
}

.skeleton-delay-1::before {
  animation-delay: 0.5s;
}

.skeleton-delay-2::before {
  animation-delay: 1s;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-text {
  background: rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.skeleton-title {
  height: 16px;
  width: 80%;
}

.skeleton-subtitle {
  height: 12px;
  width: 60%;
  background: rgba(102, 126, 234, 0.15);
}

.skeleton-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-button {
  width: 32px;
  height: 32px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.skeleton-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

.gentle-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px;
  color: rgba(102, 126, 234, 0.7);
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  animation: fadeIn 1s ease-in-out 2s forwards;
}

.hint-icon {
  font-size: 16px;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 4px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
}

.history-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
}

.history-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.history-item.disabled .item-main {
  cursor: not-allowed;
}

.item-main {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.item-main:hover {
  background: rgba(102, 126, 234, 0.05);
}

.item-text {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.item-hint {
  color: #667eea;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-item:hover:not(.disabled) .item-hint {
  opacity: 1;
}

.history-item.disabled .item-hint {
  opacity: 1;
  color: #94a3b8;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.delete-btn:active {
  transform: scale(0.95);
}

/* 自定义滚动条 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

@media (max-width: 768px) {
  .history-header {
    padding: 16px 20px 12px;
  }
  
  .header-title {
    font-size: 15px;
  }
  
  .history-item {
    padding: 14px;
  }
  
  .item-text {
    font-size: 13px;
  }
  
  .item-meta {
    font-size: 11px;
  }
  
  .history-list {
    max-height: 280px;
  }
  
  .delete-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .history-container {
    border-radius: 16px;
  }
  
  .history-header {
    padding: 14px 16px 10px;
  }
  
  .header-icon {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .header-title {
    font-size: 14px;
  }
  
  .history-item {
    padding: 12px;
    border-radius: 12px;
  }
  
  .item-text {
    font-size: 12px;
    -webkit-line-clamp: 1;
  }
  
  .item-actions {
    gap: 6px;
  }
  
  .delete-btn {
    width: 24px;
    height: 24px;
  }
}
</style>