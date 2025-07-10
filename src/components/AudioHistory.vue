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
  color: #e6a23c;
}

.history-badge {
  margin-left: auto;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-text {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
  word-break: break-word;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 自定义滚动条 */
.history-content::-webkit-scrollbar {
  width: 6px;
}

.history-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.history-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.history-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .item-actions {
    justify-content: center;
  }
}
</style>