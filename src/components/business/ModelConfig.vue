<script setup lang="ts">
/**
 * ModelConfig 组件 - 模型配置业务组件
 * 职责：实现模型配置的增删改查功能
 * - 使用基础组件 HicodeTable、HicodeDialog、HicodeInput、HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 * - 使用 MessageType 中定义的消息类型
 */

import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'
import HicodeTable from '@/components/base/HicodeTable.vue'
import ModelDialog from '@/components/business/ModelDialog.vue'
import type { ModelData } from '@/components/business/ModelDialog.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import { useMessageHandler } from '@/composables/useMessageHandler'
import type { MessageEvent } from '@/composables/useMessageHandler'
import {
  HICODE_ADD_MODEL_F2B_REQ,
  HICODE_EDIT_MODEL_F2B_REQ,
  HICODE_DELETE_MODEL_F2B_REQ,
  HICODE_REFRESH_MODELS_B2F_RES,
  HICODE_ERROR_B2F,
} from '@/utils/messageType'

// Props：接收父组件传递的模型列表
const props = defineProps<{
  models?: ModelData[]
}>()

// Emits：向父组件发送模型列表更新事件
const emit = defineEmits<{
  'update:models': [models: ModelData[]]
}>()

// 响应式数据
const modelTableRef = ref<InstanceType<typeof HicodeTable>>()
const modelDialogRef = ref<InstanceType<typeof ModelDialog>>()

// 使用 props 中的模型列表
const modelOptions = computed(() => props.models || [])

// 当模型列表更新时，通知父组件
const updateModels = (models: ModelData[]) => {
  emit('update:models', JSON.parse(JSON.stringify(models)))
}

// 厂商映射：值 -> 名称
const vendorMap: Record<string, string> = {
  zhipuai: '智谱AI',
  deepseek: 'DeepSeek',
  openai: 'OpenAI',
  qwen: '阿里千问',
}

const { postMessage } = usePostMessage()

// 获取厂商名称
const getVendorName = (vendorValue: string): string => {
  return vendorMap[vendorValue] || vendorValue || ''
}

// 处理对话框提交事件
const handleDialogSubmit = (data: ModelData, type: 'add' | 'edit') => {
  if (type === 'add') {
    // 发送新增模型消息
    postMessage(HICODE_ADD_MODEL_F2B_REQ, JSON.parse(JSON.stringify(data)))
  } else if (type === 'edit') {
    // 发送编辑模型消息
    postMessage(HICODE_EDIT_MODEL_F2B_REQ, JSON.parse(JSON.stringify(data)))
  }
}

// 新增模型
const handleAddModel = () => {
  modelDialogRef.value?.openDialog('add', undefined)
}

// 编辑模型
const handleEditModel = (row: ModelData) => {
  modelDialogRef.value?.openDialog('edit', row)
}

// 删除模型
const handleDeleteModel = (row: ModelData) => {
  ElMessageBox.confirm('确定要删除该模型配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      postMessage(HICODE_DELETE_MODEL_F2B_REQ, { modelId: row.modelId })
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 处理消息响应
const handleMessage = (event: MessageEvent) => {
  const { message, data } = event.data
  
  if (message === HICODE_REFRESH_MODELS_B2F_RES) {
    const refreshData = data as { type: string; models: ModelData[] }
    // 通过 emit 更新父组件的模型列表
    if (refreshData.models) {
      updateModels(refreshData.models)
    }
    
    let messageText = ''
    if (refreshData.type === 'add') {
      messageText = '新增模型配置成功'
    } else if (refreshData.type === 'delete') {
      messageText = '删除模型配置成功'
    } else if (refreshData.type === 'edit') {
      messageText = '更新模型配置成功'
    } else if (refreshData.type === 'import') {
      messageText = '导入模型配置成功'
    }
    
    if (messageText) {
      ElMessage({
        type: 'success',
        message: messageText,
      })
    }
  } else if (message === HICODE_ERROR_B2F) {
    // 处理错误消息
    const errorData = data as { operationType?: string; error?: string }
    const operationType = errorData.operationType || '操作'
    const errorMessage = errorData.error || '未知错误'
    
    ElMessage({
      type: 'error',
      message: `${operationType}失败：${errorMessage}`,
      duration: 5000,
    })
  }
}

// 注册消息监听
useMessageHandler(handleMessage)

// 暴露方法供父组件调用
defineExpose({
  openDialog: (type: 'add' | 'edit' | 'display', data?: ModelData) => {
    modelDialogRef.value?.openDialog(type, data)
  },
})
</script>

<template>
  <div class="model-config">
    <span class="form-title">模型配置（用于配置工具的模型信息）</span>
    <br />
    <span class="form-subtitle">
      配置当前工具所能调用的的大模型（包括模型ID、模型名称、模型类型、模型描述、API key等）。
    </span>
    <br />
    
    <!-- 模型配置表格 -->
    <HicodeTable
      ref="modelTableRef"
      class="model-table"
      :data="modelOptions"
      :stripe="true"
    >
      <el-table-column type="selection" width="36" />
      <el-table-column prop="modelName" label="模型名称" width="150">
        <template #default="scoped">
          <span class="tab-cell-content" :title="scoped.row.modelName">
            {{ scoped.row.modelName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="vendor" label="厂商" width="120">
        <template #default="scoped">
          <span class="tab-cell-content" :title="getVendorName(scoped.row.vendor)">
            {{ getVendorName(scoped.row.vendor) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="supportMultimodal" label="多模态支持" width="120">
        <template #default="scoped">
          <el-tag :type="scoped.row.supportMultimodal ? 'success' : 'info'" size="small">
            {{ scoped.row.supportMultimodal ? '支持' : '不支持' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="modelDescription" label="模型描述">
        <template #default="scoped">
          <span class="tab-cell-content" :title="scoped.row.modelDescription">
            {{ scoped.row.modelDescription }}
          </span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scoped">
          <el-button link type="primary" size="small" @click="handleEditModel(scoped.row)">
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click="handleDeleteModel(scoped.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </HicodeTable>
    
    <el-button type="primary" style="margin-top: 10px" size="small" @click="handleAddModel">
      新增
    </el-button>
    
    <!-- 模型配置对话框 -->
    <ModelDialog ref="modelDialogRef" @submit="handleDialogSubmit" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.model-config {
  .form-title {
    font-weight: 400;
    font-size: 14px;
  }

  .form-subtitle {
    color: #a0a0a0;
    font-weight: 400;
    font-size: 14px;
  }

  .model-table {
    width: 100%;
    margin-top: 10px;
  }

  .tab-cell-content {
    display: -webkit-box;
    overflow: hidden;
    text-align: left;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 设置最大显示行数为2 */
    line-clamp: 2;
  }
}
</style>

