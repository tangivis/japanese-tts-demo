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
  color: #409eff;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 2px dashed #d3d3d3;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 0 0 4px 0;
  color: #606266;
  font-size: 16px;
}

.upload-text em {
  color: #909399;
  font-size: 14px;
}

.text-area {
  --el-input-focus-border-color: #409eff;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.generate-btn {
  min-width: 140px;
  background: linear-gradient(45deg, #409eff, #5dade2);
  border: none;
  font-weight: 600;
}

.generate-btn:hover {
  background: linear-gradient(45deg, #337ecc, #4a90e2);
}

@media (max-width: 768px) {
  .upload-area {
    padding: 20px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .generate-btn {
    min-width: auto;
  }
}
</style>