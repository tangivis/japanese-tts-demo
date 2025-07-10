<template>
  <el-card class="history-card" shadow="hover" v-if="history.length > 0">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon"><Clock /></el-icon>
        <span>履歴</span>
        <el-badge :value="history.length" class="history-badge" />
      </div>
    </template>

    <div class="history-content">
      <div 
        v-for="item in history" 
        :key="item.id"
        class="history-item"
      >
        <div class="item-content">
          <div class="item-text">{{ item.text }}</div>
          <div class="item-time">{{ item.timestamp }}</div>
        </div>
        
        <div class="item-actions">
          <el-button
            type="primary"
            size="small"
            circle
            @click="$emit('replay', item)"
            title="再生"
          >
            <el-icon><VideoPlay /></el-icon>
          </el-button>
          
          <el-button
            type="danger"
            size="small"
            circle
            @click="$emit('delete', item.id)"
            title="削除"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { defineEmits } from 'vue'
import { Clock, VideoPlay, Delete } from '@element-plus/icons-vue'

defineEmits(['replay', 'delete'])

defineProps({
  history: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.history-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.history-card:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.header-icon {
  color: #f59e0b;
  font-size: 1.2rem;
}

.history-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-text {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
  word-break: break-word;
  line-height: 1.4;
  font-weight: 500;
}

.item-time {
  font-size: 12px;
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', 'Monaco', 'Consolas', monospace;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.item-actions .el-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;
}

.item-actions .el-button[type="primary"] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.item-actions .el-button[type="primary"]:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.item-actions .el-button[type="danger"] {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.item-actions .el-button[type="danger"]:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #b91c1c;
  transform: scale(1.05);
}

/* 自定义滚动条 */
.history-content::-webkit-scrollbar {
  width: 6px;
}

.history-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.history-content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.history-content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
  
  .item-actions {
    justify-content: center;
    gap: 8px;
  }
  
  .item-actions .el-button {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .history-content {
    max-height: 240px;
  }
  
  .item-text {
    font-size: 13px;
  }
  
  .item-time {
    font-size: 11px;
  }
}
</style>