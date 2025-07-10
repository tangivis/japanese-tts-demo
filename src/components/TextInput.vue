<template>
  <el-card class="text-input-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon"><EditPen /></el-icon>
        <span>テキスト入力</span>
      </div>
    </template>

    <div class="input-section">
      <!-- 文件上传区域 -->
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".txt,.md"
        :on-change="handleFileChange"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          <p>ファイルをドラッグ</p>
          <em>または クリックして選択</em>
        </div>
      </el-upload>

      <!-- 文本输入框 -->
      <el-input
        v-model="text"
        type="textarea"
        :rows="6"
        placeholder="ここにテキストを入力してください..."
        class="text-area"
        resize="none"
        @input="onTextChange"
      />

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!text.trim()"
          @click="submitText"
          class="generate-btn"
        >
          <el-icon v-if="!loading"><Microphone /></el-icon>
          {{ loading ? '生成中...' : '音声生成' }}
        </el-button>
        
        <el-button
          size="large"
          @click="clearText"
          :disabled="!text.trim()"
        >
          <el-icon><Delete /></el-icon>
          クリア
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, UploadFilled, Microphone, Delete } from '@element-plus/icons-vue'

const emit = defineEmits(['textSubmit'])

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const text = ref('')

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    text.value = e.target.result
    ElMessage.success('ファイル読み込み完了')
  }
  reader.onerror = () => {
    ElMessage.error('ファイル読み込みに失敗しました')
  }
  reader.readAsText(file.raw, 'UTF-8')
}

const onTextChange = () => {
  // 可以添加文本变化的处理逻辑
}

const submitText = () => {
  if (text.value.trim()) {
    emit('textSubmit', text.value.trim())
  }
}

const clearText = () => {
  text.value = ''
}

const setText = (newText) => {
  text.value = newText
}

const getText = () => {
  return text.value
}

// 暴露方法给父组件
defineExpose({
  clearText,
  setText,
  getText
})
</script>

<style scoped>
.text-input-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.text-input-card:hover {
  background: rgba(255, 255, 255, 0.95);
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
  color: #667eea;
  font-size: 1.2rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.upload-icon {
  font-size: 40px;
  color: #667eea;
  margin-bottom: 12px;
  opacity: 0.8;
}

.upload-text p {
  margin: 0 0 4px 0;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
}

.upload-text em {
  color: #6b7280;
  font-size: 13px;
  font-weight: 400;
}

.text-area {
  --el-input-focus-border-color: #667eea;
  --el-input-border-radius: 12px;
  --el-input-bg-color: rgba(255, 255, 255, 0.8);
  --el-textarea-padding-horizontal: 16px;
  --el-textarea-padding-vertical: 12px;
}

.text-area :deep(.el-textarea__inner) {
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.text-area :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.generate-btn {
  min-width: 140px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.generate-btn:active {
  transform: translateY(0);
}

.generate-btn[disabled] {
  opacity: 0.6;
  transform: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.action-buttons .el-button:not(.generate-btn) {
  height: 44px;
  border-radius: 12px;
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  color: #6b7280;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-buttons .el-button:not(.generate-btn):hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .upload-area {
    padding: 20px;
  }
  
  .upload-icon {
    font-size: 32px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .generate-btn {
    min-width: auto;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: 16px;
  }
  
  .upload-text p {
    font-size: 14px;
  }
  
  .upload-text em {
    font-size: 12px;
  }
  
  .text-area :deep(.el-textarea__inner) {
    font-size: 14px;
  }
}
</style>