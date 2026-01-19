<script setup lang="ts">
/**
 * CodeCompletion 组件 - 代码补全业务组件
 * 职责：实现代码补全开关配置功能
 * - 使用基础组件
 * - 保持与 light-code-html 相同的样式和交互效果
 * - 使用 MessageType 中定义的消息类型
 */

import { ref } from 'vue'
import { ElCheckbox } from 'element-plus'
import { usePostMessage } from '@/composables/usePostMessage'
import { HICODE_CHANGE_COMPLETE_F2B_REQ } from '@/utils/messageType'

// 响应式数据
const completeModel = ref(false)

const { postMessage } = usePostMessage()

// 处理代码补全变化
const handleCompleteChange = (value: boolean) => {
  if (value) {
    postMessage(HICODE_CHANGE_COMPLETE_F2B_REQ, { value: 'auto' })
  } else {
    postMessage(HICODE_CHANGE_COMPLETE_F2B_REQ, { value: 'custom' })
  }
}

// 初始化代码补全配置（从设置数据中获取）
const initComplete = (data?: { complete?: string }) => {
  if (data) {
    completeModel.value = data.complete === 'auto'
  }
}

defineExpose({
  initComplete,
})
</script>

<template>
  <div class="code-completion">
    <span class="form-title">代码补全</span>
    <br />
    <el-checkbox v-model="completeModel" label="编辑时代码能够自动触发补全" size="small" @change="handleCompleteChange" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.code-completion {
  .form-title {
    font-weight: 400;
    font-size: 14px;
  }
}

// 选择框样式（如果需要）
.el-checkbox {
  --el-checkbox-checked-bg-color: $vscode-checkbox-selectBackground !important;
  --el-checkbox-checked-border-color: $vscode-checkbox-selectBorder !important;
}

// 复选框样式（全局样式，不在 .base-table 内部）
:deep(.el-checkbox__inner) {
  border: 1px solid var(--vscode-checkbox-selectBorder);
  background-color: var(--vscode-checkbox-background);
}

:deep(.el-checkbox__input.is-disabled .el-checkbox__inner) {
  border-color: var(--vscode-checkbox-border);
  background-color: var(--vscode-checkbox-selectBackground);
}
</style>
