<script setup lang="ts">
/**
 * AdditionalSpecificationDialog 组件 - 附加规范对话框组件
 * 职责：实现附加规范的新增、编辑、查看功能
 * - 使用基础组件 HicodeDialog、HicodeInput、HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 */

import { ref, nextTick } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElButton, ElSwitch } from 'element-plus'
import HicodeDialog from '@/components/base/HicodeDialog.vue'
import HicodeInput from '@/components/base/HicodeInput.vue'
import HicodeSelector from '@/components/base/HicodeSelector.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import {
  HICODE_ADD_SPECIFICATION_F2B_REQ,
  HICODE_EDIT_SPECIFICATION_F2B_REQ,
} from '@/utils/messageType'

// 附加规范数据接口定义
interface SpecificationData {
  id?: string
  name: string
  regex: string
  content: string
  action: string
  state: boolean
}

// 响应式数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'display'>('add')
const dialogTitle = ref('')
const specificationFormRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const formData = ref<SpecificationData>({
  id: '',
  name: '',
  regex: '',
  content: '',
  action: '',
  state: true,
})

// 记录表单初始值（用于判断是否有修改）
const initialFormString = ref('')

// 实现方式选项
const actionOptions = [
  { label: '追加', value: 'append' },
  { label: '替换', value: 'replace' },
]

// 表单验证规则
const specificationRules = {
  name: [{ required: true, message: '请输入规范名称', trigger: 'blur' }],
  action: [{ required: true, message: '请选择实现方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入规则内容', trigger: 'blur' }],
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
const generateFormString = (data: SpecificationData): string => {
  return (
    (data.name?.trim() || '') +
    (data.regex?.trim() || '') +
    (data.action?.trim() || '') +
    (data.content?.trim() || '') +
    (data.state?.toString() || 'false')
  )
}

// 打开对话框
const openDialog = (type: 'add' | 'edit' | 'display', data?: SpecificationData) => {
  dialogType.value = type

  if (type === 'add') {
    dialogTitle.value = '新增附加规范'
  } else if (type === 'edit') {
    dialogTitle.value = '编辑附加规范'
  } else if (type === 'display') {
    dialogTitle.value = '查看附加规范'
  }

  // 初始化表单数据
  const formDataCopy = JSON.parse(JSON.stringify(data || {}))
  formData.value = {
    id: formDataCopy.id || '',
    name: formDataCopy.name || '',
    regex: formDataCopy.regex || '',
    content: formDataCopy.content || '',
    action: formDataCopy.action || '',
    state: formDataCopy.state !== undefined ? formDataCopy.state : true,
  }

  // 如果是新增，自动生成ID
  if (type === 'add') {
    formData.value.id = uuid()
    formData.value.state = true
  }

  dialogVisible.value = true

  // 等待DOM更新后再设置初始字符串，用于比较是否有修改
  nextTick(() => {
    initialFormString.value = generateFormString(formData.value)
  })

  // 重置表单验证状态
  if (specificationFormRef.value) {
    specificationFormRef.value.clearValidate()
  }
}

// 关闭对话框
const closeDialog = () => {
  dialogTitle.value = ''
  dialogType.value = 'add'
  formData.value = {
    id: '',
    name: '',
    regex: '',
    content: '',
    action: '',
    state: true,
  }
  dialogVisible.value = false
  initialFormString.value = ''

  if (specificationFormRef.value) {
    specificationFormRef.value.resetFields()
  }
}

// 提交表单
const submitForm = () => {
  if (!specificationFormRef.value) return

  specificationFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (dialogType.value === 'add') {
        postMessage(HICODE_ADD_SPECIFICATION_F2B_REQ, JSON.parse(JSON.stringify(formData.value)))
        closeDialog()
      } else if (dialogType.value === 'edit') {
        const currentFormString = generateFormString(formData.value)
        if (initialFormString.value !== currentFormString) {
          postMessage(
            HICODE_EDIT_SPECIFICATION_F2B_REQ,
            JSON.parse(JSON.stringify(formData.value))
          )
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
      ref="specificationFormRef"
      :model="formData"
      label-position="top"
      :rules="specificationRules"
    >
      <el-form-item label="名称" label-width="140px" prop="name">
        <HicodeInput
          v-model="formData.name"
          autocomplete="off"
          placeholder="请输入规范名称"
          :disabled="dialogType === 'display'"
          size="small"
        />
      </el-form-item>

      <el-form-item label="正则表达式" label-width="140px" prop="regex">
        <el-input
          v-model="formData.regex"
          type="textarea"
          :rows="5"
          autocomplete="off"
          placeholder="请输入匹配正则表达式"
          :disabled="dialogType === 'display'"
          class="specification-textarea"
        />
      </el-form-item>

      <el-form-item label="实现方式" label-width="140px" prop="action">
        <HicodeSelector
          v-model="formData.action"
          style="width: 100%"
          placeholder="请选择实现方式"
          :disabled="dialogType === 'display'"
          clearable
          no-data-text="暂无数据，请检查环境设置和认证状态是否正常"
          :show-arrow="false"
          size="small"
        >
          <el-option
            v-for="item in actionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </HicodeSelector>
      </el-form-item>

      <el-form-item label="内容" label-width="140px" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="5"
          autocomplete="off"
          placeholder="请输入规则内容"
          :disabled="dialogType === 'display'"
          class="specification-textarea"
        />
      </el-form-item>

      <el-form-item label="是否启用" label-width="140px">
        <el-switch v-model="formData.state" size="small" :disabled="dialogType === 'display'" />
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

.specification-textarea {
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

