<script setup lang="ts">
/**
 * ModelDialog 组件 - 模型配置对话框组件
 * 职责：实现模型配置的新增、编辑、查看功能
 * - 使用基础组件 HicodeDialog、HicodeInput、HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 */

import { ref } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElInputNumber, ElSwitch, ElTooltip } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import HicodeDialog from '@/components/base/HicodeDialog.vue'
import HicodeInput from '@/components/base/HicodeInput.vue'
import HicodeSelector from '@/components/base/HicodeSelector.vue'

// 模型数据接口定义
export interface ModelData {
  id?: string
  modelId: string
  modelName: string
  displayName?: string
  maxContextTokens?: number
  maxOutputTokens?: number
  temperature?: number
  supportMultimodal?: boolean
  vendor: string
  modelDescription?: string
  apiKey?: string
  apiBaseUrl?: string
}

// 响应式数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'display'>('add')
const dialogTitle = ref('')
const modelFormRef = ref<InstanceType<typeof ElForm>>()

// 表单数据（K单位显示）
const formData = ref<ModelData>({
  modelId: '',
  modelName: '',
  displayName: '',
  maxContextTokens: 4, // 默认4K，显示为K单位
  temperature: 0.6, // 默认temperature，不显示给用户
  supportMultimodal: false,
  vendor: 'zhipuai',
  modelDescription: '',
  apiKey: '',
  apiBaseUrl: '',
})

// 辅助函数：将token转换为K单位（用于显示）
const tokenToK = (tokens: number | undefined): number | undefined => {
  if (tokens === undefined || tokens === null) return undefined
  return Math.round((tokens / 1024) * 100) / 100 // 保留2位小数
}

// 辅助函数：将K单位转换为token（用于存储）
const kToToken = (k: number | undefined): number | undefined => {
  if (k === undefined || k === null) return undefined
  return Math.round(k * 1024)
}

// 记录表单初始值（用于判断是否有修改）
const initialFormString = ref('')

// 表单验证规则
const modelRules = {
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  vendor: [{ required: true, message: '请选择厂商', trigger: 'change' }],
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        // 验证API密钥长度，与后端验证逻辑保持一致
        // 后端要求：apiKey.trim().length >= 10
        if (value && value.trim().length < 10) {
          callback(new Error('API Key长度至少为10个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 厂商选项
const vendorOptions = [
  { label: '智谱AI', value: 'zhipuai' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI', value: 'openai' },
  { label: '阿里千问', value: 'qwen' },
]

// 生成唯一ID
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 生成表单字符串（用于判断是否有修改）
const generateFormString = (data: ModelData): string => {
  return (
    (data.modelId?.trim() || '') +
    (data.modelName?.trim() || '') +
    (data.displayName?.trim() || '') +
    (data.maxContextTokens?.toString() || '') +
    (data.temperature?.toString() || '') +
    (data.supportMultimodal?.toString() || 'false') +
    (data.vendor?.trim() || '') +
    (data.modelDescription?.trim() || '') +
    (data.apiKey?.trim() || '') +
    (data.apiBaseUrl?.trim() || '')
  )
}

// Emits：向父组件发送表单提交事件
const emit = defineEmits<{
  submit: [data: ModelData, type: 'add' | 'edit']
}>()

// 打开对话框
const openDialog = (type: 'add' | 'edit' | 'display', data?: ModelData) => {
  dialogType.value = type

  if (type === 'add') {
    dialogTitle.value = '新增模型配置'
  } else if (type === 'edit') {
    dialogTitle.value = '编辑模型配置'
  } else if (type === 'display') {
    dialogTitle.value = '查看模型配置'
  }

  // 深拷贝数据
  const rawData = JSON.parse(JSON.stringify(data || {}))

  // 将后端传来的token单位转换为K单位显示
  if (rawData.maxContextTokens !== undefined && rawData.maxContextTokens !== null) {
    rawData.maxContextTokens = tokenToK(rawData.maxContextTokens) || 4
  }
  // maxOutputTokens 不开放给用户配置，后端会自动处理

  formData.value = rawData

  // 如果是新增，自动生成模型ID并设置默认值
  if (type === 'add') {
    formData.value.modelId = uuid()
    if (!formData.value.vendor) {
      formData.value.vendor = 'zhipuai'
    }
    // 设置默认值：如果没有 maxContextTokens 或值为 0/null/undefined，设置为 4K
    if (!formData.value.maxContextTokens || formData.value.maxContextTokens === 0) {
      formData.value.maxContextTokens = 4
    }
    // temperature 默认值为 0.6
    if (formData.value.temperature === undefined || formData.value.temperature === null) {
      formData.value.temperature = 0.6
    }
    // displayName 默认与 modelName 一致
    if (!formData.value.displayName && formData.value.modelName) {
      formData.value.displayName = formData.value.modelName
    }
    // supportMultimodal 默认值为 false
    if (formData.value.supportMultimodal === undefined) {
      formData.value.supportMultimodal = false
    }
  } else {
    // 编辑时，如果没有 displayName，使用 modelName
    if (!formData.value.displayName && formData.value.modelName) {
      formData.value.displayName = formData.value.modelName
    }
    // 如果没有 maxContextTokens 或值为 0/null/undefined，设置默认值 4K
    if (!formData.value.maxContextTokens || formData.value.maxContextTokens === 0) {
      formData.value.maxContextTokens = 4
    }
    // temperature 默认值为 0.6
    if (formData.value.temperature === undefined || formData.value.temperature === null) {
      formData.value.temperature = 0.6
    }
    // supportMultimodal 默认值为 false
    if (formData.value.supportMultimodal === undefined) {
      formData.value.supportMultimodal = false
    }
  }

  dialogVisible.value = true
  initialFormString.value = generateFormString(formData.value)

  // 重置表单验证状态
  if (modelFormRef.value) {
    modelFormRef.value.clearValidate()
  }
}

// 关闭对话框
const closeDialog = () => {
  dialogType.value = 'add'
  dialogTitle.value = ''
  formData.value = {
    modelId: '',
    modelName: '',
    displayName: '',
    maxContextTokens: 4,
    temperature: 0.6,
    supportMultimodal: false,
    vendor: 'zhipuai',
    modelDescription: '',
    apiKey: '',
    apiBaseUrl: '',
  }
  dialogVisible.value = false
  initialFormString.value = ''

  if (modelFormRef.value) {
    modelFormRef.value.resetFields()
  }
}

// 模型名称失去焦点时的处理
const handleModelNameBlur = () => {
  // 当模型名称失去焦点时，如果显示名称为空，自动填充为模型名称
  if (!formData.value.displayName && formData.value.modelName) {
    formData.value.displayName = formData.value.modelName
  }
}

// 提交表单
const submitForm = () => {
  if (!modelFormRef.value) return

  modelFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 确保 displayName 有值（如果没有填写，使用 modelName）
      if (!formData.value.displayName && formData.value.modelName) {
        formData.value.displayName = formData.value.modelName
      }
      // 确保 maxContextTokens 有值：如果没有或值为 0/null/undefined，设置为 4K
      if (!formData.value.maxContextTokens || formData.value.maxContextTokens === 0) {
        formData.value.maxContextTokens = 4
      }
      // 确保 temperature 有值，默认 0.6
      if (formData.value.temperature === undefined || formData.value.temperature === null) {
        formData.value.temperature = 0.6
      }
      // 确保 supportMultimodal 有值
      if (formData.value.supportMultimodal === undefined) {
        formData.value.supportMultimodal = false
      }

      // 准备提交的数据：将K单位转换为token单位
      // maxOutputTokens 不开放给用户配置，后端会自动设置为默认值 2K (2048 tokens)
      const submitData: ModelData = {
        ...formData.value,
        maxContextTokens: kToToken(formData.value.maxContextTokens),
        // temperature 保持不变，直接传递
      }

      if (dialogType.value === 'add') {
        // 确保有 modelId
        if (!submitData.modelId) {
          submitData.modelId = uuid()
        }
        // 发送新增模型事件
        emit('submit', submitData, 'add')
      } else if (dialogType.value === 'edit') {
        const currentFormString = generateFormString(formData.value)
        if (initialFormString.value !== currentFormString) {
          // 发送编辑模型事件
          emit('submit', submitData, 'edit')
        } else {
          ElMessage({
            type: 'info',
            message: '无任何修改，无需更新',
          })
        }
      }
      closeDialog()
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
    <el-form ref="modelFormRef" :model="formData" label-position="top" :rules="modelRules">
      <el-form-item label="模型名称" label-width="140px" prop="modelName">
        <HicodeInput v-model="formData.modelName" autocomplete="off" size="small"
          placeholder="请输入模型名称，如：GPT-4、Claude 3等(模型厂商的模型调用名称)" :disabled="dialogType === 'display'"
          @blur="handleModelNameBlur" />
      </el-form-item>

      <el-form-item label="显示名称" label-width="140px">
        <HicodeInput v-model="formData.displayName" autocomplete="off" size="small" placeholder="请输入显示名称（选填，默认与模型名称一致）"
          :disabled="dialogType === 'display'" />
      </el-form-item>

      <el-form-item label="厂商" label-width="140px" prop="vendor">
        <HicodeSelector v-model="formData.vendor" style="width: 100%" size="small" placeholder="请选择厂商"
          :disabled="dialogType === 'display'" clearable :show-arrow="false">
          <el-option v-for="option in vendorOptions" :key="option.value" :label="option.label" :value="option.value" />
        </HicodeSelector>
      </el-form-item>

      <el-form-item label="最大上下文Token (K)" label-width="140px">
        <el-input-number v-model="formData.maxContextTokens" :min="0.1" :max="1000" :step="1" :precision="1"
          placeholder="请输入最大上下文Token数（单位：K）" :disabled="dialogType === 'display'" :controls="true" size="small"
          class="max-context-tokens-input" />
      </el-form-item>

      <el-form-item label-width="140px">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px" @click.stop.prevent>
            <span>是否支持多模态</span>
            <el-tooltip content="支持多模态表示该模型可以处理以下类型的资源：图片（Image）、文件（File）、视频（Video）、文本（Text）" placement="top"
              :show-after="200">
              <el-icon style="cursor: help; color: var(--vscode-descriptionForeground)">
                <InfoFilled />
              </el-icon>
            </el-tooltip>
          </span>
        </template>
        <el-switch v-model="formData.supportMultimodal" :disabled="dialogType === 'display'" active-text="支持"
          inactive-text="不支持" />
      </el-form-item>

      <el-form-item label="模型描述" label-width="140px">
        <HicodeInput v-model="formData.modelDescription" type="textarea" size="small" :rows="3" autocomplete="off"
          placeholder="请输入模型描述信息" :disabled="dialogType === 'display'" class="model-description-textarea" />
      </el-form-item>

      <el-form-item label="API Key" label-width="140px" prop="apiKey">
        <HicodeInput v-model="formData.apiKey" type="password" show-password size="small" autocomplete="off"
          placeholder="请输入API Key（可选）" :disabled="dialogType === 'display'" />
      </el-form-item>

      <el-form-item label="API Base URL" label-width="140px">
        <HicodeInput v-model="formData.apiBaseUrl" size="small" autocomplete="off" placeholder="请输入API Base URL（可选）"
          :disabled="dialogType === 'display'" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span>
        <el-button v-if="dialogType !== 'display'" class="dialog-btn" @click="closeDialog" size="small">
          取消
        </el-button>
        <el-button v-if="dialogType !== 'display'" class="dialog-btn" type="primary" @click="submitForm" size="small">
          确认
        </el-button>
        <el-button v-if="dialogType === 'display'" class="dialog-btn" type="primary" @click="closeDialog" size="small">
          关闭
        </el-button>
      </span>
    </template>
  </HicodeDialog>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

:deep(.el-input-number .el-input__wrapper) {
  background-color: $vscode-input-background !important;
  border: 1px solid $vscode-input-background !important;
  border-radius: 4px !important;

  &:hover {
    border-color: $vscode-input-background !important;
  }

  &:focus {
    border-color: $vscode-input-background !important;
  }
}

.max-context-tokens-input {
  width: 100%;
  background-color: $vscode-input-background !important;
  color: $vscode-input-foreground !important;
  border: 1px solid $vscode-input-background !important;
  border-radius: 4px !important;
  --el-input-border-color: $vscode-input-background !important;

  &:hover {
    border-color: $vscode-input-background !important;
  }

  &:focus {
    border-color: $vscode-input-background !important;
  }
}

:deep(.el-input) {
  --el-input-border-color: $vscode-input-background !important;
  --el-input-text-color: $vscode-input-foreground !important;
  --el-input-hover-border-color: $vscode-input-background !important;
}

:deep(.el-input-number__decrease) {
  background: $vscode-panel-border !important;
  border-right: 1px solid $vscode-panel-border !important;
  color: $vscode-input-foreground !important;
}

:deep(.el-input-number__increase) {
  background: $vscode-panel-border !important;
  border-left: 1px solid $vscode-panel-border !important;
  color: $vscode-input-foreground !important;
}

.dialog-btn {
  height: 28px;
}

// 对话框中的输入框样式
:deep(.el-input-number) {
  width: 100%;

  .el-input__wrapper {
    width: 100%;
  }
}

.model-description-textarea {
  --el-input-border-color: $vscode-input-background !important;
  --el-input-hover-border-color: $vscode-input-background !important;

  :deep(.el-textarea__inner) {
    width: 100%;
    height: 68px;
    margin: 0;
    background-color: transparent;
    color: $vscode-input-foreground;
    line-height: 20px;
    resize: none;
    border: 1px solid $vscode-input-background !important;
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
