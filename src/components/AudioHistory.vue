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
      <div class="empty-content">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="empty-title">音声を作ってみましょう</h3>
        <p class="empty-description">
          テキストを入力して音声を生成すると、<br>
          ここに履歴が表示されます
        </p>
        <div class="empty-animation">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
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
  transform: translateY(-2px);
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

/* 空状态样式 */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.empty-content {
  text-align: center;
  max-width: 280px;
}

.empty-icon {
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-icon svg {
  color: #667eea;
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.empty-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.empty-animation {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.wave {
  width: 4px;
  height: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 2px;
  animation: wave 1.5s ease-in-out infinite;
  opacity: 0.6;
}

.wave:nth-child(2) {
  animation-delay: 0.2s;
}

.wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes wave {
  0%, 100% {
    height: 8px;
    opacity: 0.4;
  }
  50% {
    height: 20px;
    opacity: 0.8;
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
  transform: translateY(-2px);
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
  transform: scale(1.05);
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