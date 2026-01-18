<script setup lang="ts">
/**
 * FillModelConfig 组件 - 补全大模型配置业务组件
 * 职责：实现补全大模型的选择配置功能
 * - 使用基础组件 HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 * - 使用 MessageType 中定义的消息类型
 */

import { ref, computed } from 'vue'
import HicodeSelector from '@/components/base/HicodeSelector.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import { HICODE_CHANGE_FILL_MODEL_F2B_REQ } from '@/utils/messageType'

// 模型数据接口定义
interface ModelData {
  id?: string
  modelId: string
  modelName: string
  displayName?: string
  maxContextTokens?: number
  supportMultimodal?: boolean
  vendor: string
  modelDescription?: string
  apiKey?: string
  apiBaseUrl?: string
}

// Props：接收父组件传递的模型列表
const props = defineProps<{
  models?: ModelData[]
}>()

// 响应式数据
const fillModelValue = ref<string[]>([])
const oldFillModelValue = ref<string>('')

// 从模型配置中提取补全大模型的选项（使用 modelName 作为显示和值）
const fillModelOptions = computed(() => {
  if (!props.models || props.models.length === 0) {
    return []
  }
  return props.models.map((model) => ({
    modelId: model.modelId,
    modelName: model.modelName,
  }))
})

const { postMessage } = usePostMessage()

// 处理补全模型变化
const handleModelChange = () => {
  // 过滤掉旧值
  const filteredValue = fillModelValue.value.filter((item) => item !== oldFillModelValue.value)
  if (filteredValue.length > 0) {
    // 发送切换补全模型消息
    postMessage(HICODE_CHANGE_FILL_MODEL_F2B_REQ, { value: filteredValue[0] })
    oldFillModelValue.value = filteredValue[0]
  }
}

// 初始化补全模型配置（从设置数据中获取当前选中的模型）
const initFillModel = (data?: {
  fillModel?: string
}) => {
  if (data) {
    fillModelValue.value = data.fillModel ? [data.fillModel] : []
    oldFillModelValue.value = data.fillModel || ''
  }
}

// 暴露方法供父组件调用
defineExpose({
  initFillModel,
})
</script>

<template>
  <div class="fill-model-config">
    <span class="form-title">补全大模型（仅适用于代码补全）</span>
    <br />
    <span class="form-subtitle">根据此设置决定代码补全使用的大模型。</span>
    <br />
    
    <HicodeSelector
      v-model="fillModelValue"
      multiple
      collapse-tags
      collapse-tags-tooltip
      placeholder="请选择补全大模型"
      class="model-select"
      size="small"
      no-data-text="暂无数据，请检查环境设置和认证状态是否正常"
      @change="handleModelChange"
    >
      <el-option
        v-for="item in fillModelOptions"
        :key="item.modelId"
        :label="item.modelName"
        :value="item.modelName"
      />
    </HicodeSelector>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.fill-model-config {
  .form-title {
    font-weight: 400;
    font-size: 14px;
  }

  .form-subtitle {
    color: #a0a0a0;
    font-weight: 400;
    font-size: 14px;
  }

  .model-select {
    width: 360px;
    margin-top: 10px;
    
    :deep(.el-tag) {
      background-color: $vscode-checkbox-background;
      color: $vscode-input-foreground;
    }
    
    :deep(.el-tag__close) {
      display: none !important;
    }
  }
}
</style>

