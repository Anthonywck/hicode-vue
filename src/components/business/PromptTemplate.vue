<script setup lang="ts">
/**
 * PromptTemplate 组件 - Prompt 模板管理业务组件
 * 职责：实现 Prompt 模板的增删改查功能
 * - 使用基础组件 HicodeTable、HicodeDialog、HicodeInput、HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 * - 使用 MessageType 中定义的消息类型
 */

import { ref } from 'vue'
import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'
import { h } from 'vue'
import HicodeTable from '@/components/base/HicodeTable.vue'
import PromptTemplateDialog from './PromptTemplateDialog.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import { useMessageHandler } from '@/composables/useMessageHandler'
import type { MessageEvent } from '@/composables/useMessageHandler'
import {
  HICODE_DELETE_USER_PROMPT_F2B_REQ,
  HICODE_REFRESH_USER_PROMPTS_B2F_RES,
  HICODE_ERROR_B2F,
} from '@/utils/messageType'

// Prompt 模板数据接口定义
interface PromptData {
  id?: string
  title: string
  prompt: string
  modelParams?: string
  model: string
  isSystemPrompt?: boolean
}

// 模型数据接口定义（与 ModelConfig 中的一致）
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

// Props：接收模型列表
const props = defineProps<{
  models?: ModelData[]
}>()

// 响应式数据
const promptTableRef = ref<InstanceType<typeof HicodeTable>>()
const promptDialogRef = ref<InstanceType<typeof PromptTemplateDialog>>()
const promptData = ref<PromptData[]>([])

const { postMessage } = usePostMessage()

// 处理消息响应
const handleMessage = (event: MessageEvent) => {
  const { message, data } = event.data

  if (message === HICODE_REFRESH_USER_PROMPTS_B2F_RES) {
    const refreshData = data as { type: string; prompts?: PromptData[]; userPrompt?: PromptData[] }
    // 兼容不同的数据结构：优先使用 prompts，如果没有则使用 userPrompt
    const promptList = refreshData.prompts || refreshData.userPrompt || []
    promptData.value = JSON.parse(JSON.stringify(promptList))

    let messageText = ''
    if (refreshData.type === 'add') {
      messageText = '新增Prompt成功'
    } else if (refreshData.type === 'delete') {
      messageText = '删除Prompt成功'
    } else if (refreshData.type === 'edit') {
      messageText = '更新Prompt成功'
    } else if (refreshData.type === 'import') {
      messageText = ''
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

// 判断行是否可选择（只有非系统prompt才能被选择）
const handleSelectable = (row: PromptData) => {
  return row.isSystemPrompt !== true
}

// 查看 Prompt 模板
const handleDisplayPrompt = (row: PromptData) => {
  if (promptDialogRef.value) {
    promptDialogRef.value.openDialog('display', row)
  }
}

// 编辑 Prompt 模板
const handleEditPrompt = (row: PromptData) => {
  if (promptDialogRef.value) {
    promptDialogRef.value.openDialog('edit', row)
  }
}

// 删除 Prompt 模板
const handleDeletePrompt = (row: PromptData) => {
  ElMessageBox({
    title: '删除模板',
    type: 'warning',
    message: h('p', null, [h('span', null, '此操作无法撤销，确认删除?\n')]),
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '删除中...'
        postMessage(HICODE_DELETE_USER_PROMPT_F2B_REQ, { id: row.id })
        // 等待后端返回刷新消息，对话框先不关闭
        setTimeout(() => {
          instance.confirmButtonLoading = false
          done()
        }, 300)
      } else {
        done()
      }
    },
  })
    .then(() => {
      // 删除操作已提交，等待后端返回刷新消息
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}

// 导入 Prompt 模板
const handleImportPrompt = () => {
  const input = document.createElement('input')
  input.id = 'importFile'
  input.type = 'file'
  input.style.display = 'none'
  input.accept = '.json'
  document.body.appendChild(input)
  input.click()

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = (event) => {
        const result = event.target?.result as string
        // 使用消息类型发送导入请求
        postMessage('importPrompts', { value: result })
      }
    }
    // 清理
    document.body.removeChild(input)
    input.removeEventListener('change', handleFileChange)
  }

  input.addEventListener('change', handleFileChange)
}

// 导出 Prompt 模板
const handleExportPrompt = () => {
  if (!promptTableRef.value) return

  // 通过 ref 访问表格的 getSelectionRows 方法
  const selection = promptTableRef.value.getSelectionRows()
  if (selection.length <= 0) {
    ElMessage({
      type: 'warning',
      message: '请选择需要导出的prompt模板',
    })
    return
  }
  // 导出prompt模板
  postMessage('exportPrompts', JSON.parse(JSON.stringify(selection)))
}

// 新增 Prompt 模板
const handleAddPrompt = () => {
  if (promptDialogRef.value) {
    promptDialogRef.value.openDialog('add', undefined)
  }
}

// 初始化 Prompt 模板列表（从设置数据中获取）
const initPrompts = (prompts?: PromptData[]) => {
  if (prompts) {
    promptData.value = JSON.parse(JSON.stringify(prompts))
  }
}

// 暴露方法供父组件调用
defineExpose({
  initPrompts,
})
</script>

<template>
  <div class="prompt-template">
    <span class="form-title">prompt模板配置</span>
    <br />
    <span class="form-subtitle">使用模板可以提高提问效率。</span>
    <br />

    <!-- Prompt 模板表格 -->
    <HicodeTable
      ref="promptTableRef"
      class="prompt-table"
      :data="promptData"
      :stripe="true"
    >
      <el-table-column type="selection" width="36" :selectable="handleSelectable" />
      <el-table-column prop="title" label="名称" width="180">
        <template #default="scoped">
          <div style="display: flex; align-items: center; text-align: center">
            <el-tag
              v-if="scoped.row.isSystemPrompt === true"
              class="system-tag"
              type="info"
              style="margin-right: 8px"
              size="small"
            >
              系统
            </el-tag>
            <span class="tab-cell-content" :title="scoped.row.title">
              {{ scoped.row.title }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="prompt" label="prompt模板">
        <template #default="scoped">
          <span class="tab-cell-content">{{ scoped.row.prompt }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="model" label="适用模型" width="180">
        <template #default="scoped">
          <span class="tab-cell-content">{{ scoped.row.model }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scoped">
          <el-button
            v-if="scoped.row.isSystemPrompt === true"
            link
            type="primary"
            size="small"
            @click="handleDisplayPrompt(scoped.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="scoped.row.isSystemPrompt !== true"
            link
            type="primary"
            size="small"
            @click="handleEditPrompt(scoped.row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="scoped.row.isSystemPrompt !== true"
            link
            type="primary"
            size="small"
            @click="handleDeletePrompt(scoped.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </HicodeTable>

    <el-button type="primary" style="margin-top: 10px" size="small" @click="handleAddPrompt">
      新增
    </el-button>

    <el-button type="default" style="margin-top: 10px" size="small" @click="handleImportPrompt">
      导入
    </el-button>

    <el-button type="default" style="margin-top: 10px" size="small" @click="handleExportPrompt">
      导出
    </el-button>

    <!-- Prompt 模板对话框 -->
    <PromptTemplateDialog ref="promptDialogRef" :models="models" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.prompt-template {
  .form-title {
    font-weight: 400;
    font-size: 14px;
  }

  .form-subtitle {
    color: #a0a0a0;
    font-weight: 400;
    font-size: 14px;
  }

  .prompt-table {
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

  .system-tag {
    height: 20px;
    border-radius: 1px;
  }
}
</style>

