<script setup lang="ts">
/**
 * PromptTemplateDialog 组件 - Prompt 模板对话框组件
 * 职责：实现 Prompt 模板的新增、编辑、查看功能
 * - 使用基础组件 HicodeDialog、HicodeInput、HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 */

import { ref, computed } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElButton } from 'element-plus'
import HicodeDialog from '@/components/base/HicodeDialog.vue'
import HicodeInput from '@/components/base/HicodeInput.vue'
import HicodeSelector from '@/components/base/HicodeSelector.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import {
  HICODE_ADD_USER_PROMPT_F2B_REQ,
  HICODE_EDIT_USER_PROMPT_F2B_REQ,
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
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'display'>('add')
const dialogTitle = ref('')
const promptFormRef = ref<InstanceType<typeof ElForm>>()

// 将模型数据转换为对话框需要的格式（与 light-code-html 保持一致）
const modelOptions = computed(() => {
  if (!props.models || props.models.length === 0) {
    return []
  }
  return props.models.map((model) => ({
    id: model.id || model.modelId,
    modelId: model.modelId,
    modelName: model.modelName,
    display: model.displayName || model.modelName,
    model: model.modelName,
  }))
})

// 表单数据
const formData = ref<PromptData>({
  id: '',
  title: '',
  prompt: '',
  modelParams: '',
  model: '',
  isSystemPrompt: false,
})

// 记录表单初始值（用于判断是否有修改）
const initialFormString = ref('')

// 表单验证规则
const promptRules = {
  title: [{ required: true, message: '请输入prompt名称', trigger: 'blur' }],
  prompt: [{ required: true, message: '请输入prompt模板', trigger: 'blur' }],
}

const { postMessage } = usePostMessage()

// 生成唯一ID
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 生成表单字符串（用于判断是否有修改）
const generateFormString = (data: PromptData): string => {
  return (
    (data.title?.trim() || '') +
    (data.prompt?.trim() || '') +
    (data.modelParams?.trim() || '') +
    (data.model?.trim() || '')
  )
}

// 打开对话框
const openDialog = (type: 'add' | 'edit' | 'display', data?: PromptData) => {
  dialogType.value = type

  if (type === 'add') {
    dialogTitle.value = '新增prompt模板'
  } else if (type === 'edit') {
    dialogTitle.value = '编辑prompt模板'
  } else if (type === 'display') {
    dialogTitle.value = '查看prompt模板'
  }
  // 深拷贝数据
  formData.value = JSON.parse(JSON.stringify(data || {}))

  // 如果是新增操作，设置默认值：用户通过页面添加的默认为用户prompt（非系统prompt）
  if (type === 'add') {
    formData.value.isSystemPrompt = false
  } else {
    // 编辑或查看时，如果数据中没有 isSystemPrompt 字段，默认为 false（向后兼容）
    if (formData.value.isSystemPrompt === undefined) {
      formData.value.isSystemPrompt = false
    }
  }

  dialogVisible.value = true
  initialFormString.value = generateFormString(formData.value)

  // 重置表单验证状态
  if (promptFormRef.value) {
    promptFormRef.value.clearValidate()
  }
}

// 关闭对话框
const closeDialog = () => {
  dialogTitle.value = ''
  dialogType.value = 'add'
  formData.value = {
    id: '',
    title: '',
    prompt: '',
    modelParams: '',
    model: '',
    isSystemPrompt: false,
  }
  dialogVisible.value = false
  initialFormString.value = ''

  if (promptFormRef.value) {
    promptFormRef.value.resetFields()
  }
}

// 提交表单
const submitForm = () => {
  if (!promptFormRef.value) return

  promptFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (dialogType.value === 'add') {
        formData.value.id = uuid()
        postMessage(HICODE_ADD_USER_PROMPT_F2B_REQ, JSON.parse(JSON.stringify(formData.value)))
        closeDialog()
      } else if (dialogType.value === 'edit') {
        const currentFormString = generateFormString(formData.value)
        if (initialFormString.value !== currentFormString) {
          postMessage(HICODE_EDIT_USER_PROMPT_F2B_REQ, JSON.parse(JSON.stringify(formData.value)))
          closeDialog()
        } else {
          ElMessage({
            type: 'info',
            message: '无任何修改，无需更新',
          })
          closeDialog()
        }
      }
    } else {
      ElMessage({
        type: 'error',
        message: '请填写完整的表单信息',
      })
    }
  })
}

// 暴露方法供父组件调用
defineExpose({
  openDialog,
})
</script>

<template>
  <HicodeDialog v-model="dialogVisible" :modal="false" width="600px" :title="dialogTitle" @close="closeDialog">

    <el-form
      ref="promptFormRef"
      :model="formData"
      label-position="top"
      :rules="promptRules"
    >
      <el-form-item label="名称" label-width="140px" prop="title">
        <HicodeInput
          v-model="formData.title"
          autocomplete="off"
          size="small"
          placeholder="请输入prompt模板名称"
          :disabled="dialogType === 'display'"
        />
      </el-form-item>

      <el-form-item label="prompt模板" label-width="140px" prop="prompt">
        <el-input
          v-model="formData.prompt"
          type="textarea"
          :rows="5"
          autocomplete="off"
          size="small"
          placeholder="请输入prompt模板,引用代码用${SOURCE}替换"
          :disabled="dialogType === 'display'"
          class="prompt-textarea"
        />
      </el-form-item>

      <el-form-item label="参数" label-width="140px">
        <el-input
          v-model="formData.modelParams"
          type="textarea"
          :rows="5"
          autocomplete="off"
          placeholder="请输入模型参数"
          :disabled="dialogType === 'display'"
          class="prompt-textarea"
        />
      </el-form-item>

      <el-form-item label="适用模型" label-width="140px">
        <HicodeSelector
          v-model="formData.model"
          style="width: 100%"
          size="small"
          placeholder="请选择模板适用模型"
          :disabled="dialogType === 'display'"
          clearable
          no-data-text="暂无数据，请检查环境设置和认证状态是否正常"
          :show-arrow="false"
        >
          <el-option
            v-for="item in modelOptions"
            :key="item.id || item.modelId"
            :label="item.display || item.modelName"
            :value="item.model || item.modelName"
          />
        </HicodeSelector>
      </el-form-item>
    </el-form>

    <template #footer>
      <span>
        <el-button
          v-if="dialogType !== 'display'"
          class="dialog-btn"
          @click="closeDialog"
          size="small"
        >
          取消
        </el-button>
        <el-button
          v-if="dialogType !== 'display'"
          class="dialog-btn"
          type="primary"
          @click="submitForm"
          size="small"
        >
          确认
        </el-button>
        <el-button
          v-if="dialogType === 'display'"
          class="dialog-btn"
          type="primary"
          @click="closeDialog"
          size="small"
        >
          关闭
        </el-button>
      </span>
    </template>
  </HicodeDialog>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.dialog-btn {
  height: 28px;
}

.prompt-textarea {
  --el-input-border-color: $vscode-input-background !important;
  --el-input-hover-border-color: $vscode-input-background !important;
  :deep(.el-textarea__inner) {
    width: 100%;
    margin: 0;
    background-color: transparent;
    color: $vscode-input-foreground;
    line-height: 20px;
    resize: none;
    // border: 1px solid $vscode-input-background !important;
    background-color: $vscode-input-background !important;

    &::placeholder {
      color: $vscode-input-placeholderForeground !important;
    }

    &:focus {
      border-color: $vscode-focusBorder !important;
      box-shadow: 0 0 0 1px $vscode-focusBorder inset !important;
    }

    &:disabled {
      -webkit-text-fill-color: $vscode-input-foreground !important;
      color: $vscode-input-foreground !important;
    }
  }
}
</style>

