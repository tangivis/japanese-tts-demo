<template>
  <div class="history-container" v-if="history.length > 0">
    <div class="history-header">
      <div class="header-content">
        <div class="header-icon">📚</div>
        <span class="header-title">再生履歴</span>
        <div class="history-count">{{ history.length }}</div>
      </div>
    </div>

    <div class="history-list">
      <div 
        v-for="item in history" 
        :key="item.id"
        class="history-item"
      >
        <div class="item-main" @click="handleItemClick(item)">
          <div class="item-text">{{ item.text }}</div>
          <div class="item-meta">
            <span class="item-time">{{ formatTime(item.timestamp) }}</span>
            <span class="item-hint">クリックして使用</span>
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
  </div>
</template>

<script setup>
const emit = defineEmits(['selectItem', 'delete'])

defineProps({
  history: {
    type: Array,
    default: () => []
  }
})

const handleItemClick = (item) => {
  emit('selectItem', item)
}

const handleDelete = (itemId) => {
  emit('delete', itemId)
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = (now - time) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const minutes = Math.floor((now - time) / (1000 * 60))
    return minutes < 1 ? 'たった今' : `${minutes}分前`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}時間前`
  } else {
    return time.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
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
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
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

.history-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
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

.item-time {
  color: #64748b;
  font-weight: 400;
}

.item-hint {
  color: #667eea;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-item:hover .item-hint {
  opacity: 1;
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
  
  .play-btn {
    width: 36px;
    height: 36px;
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
  
  .play-btn {
    width: 32px;
    height: 32px;
  }
  
  .delete-btn {
    width: 24px;
    height: 24px;
  }
}
</style>