<script setup lang="ts">
/**
 * AdditionalSpecification 组件 - 附加规范业务组件
 * 职责：实现附加规范的增删改查功能
 * - 使用基础组件 HicodeTable、HicodeDialog、HicodeInput、HicodeSelector
 * - 保持与 light-code-html 相同的样式和交互效果
 * - 使用 MessageType 中定义的消息类型
 */

import { ref } from 'vue'
import { ElMessage, ElMessageBox, ElButton, ElSwitch } from 'element-plus'
import { h } from 'vue'
import HicodeTable from '@/components/base/HicodeTable.vue'
import AdditionalSpecificationDialog from './AdditionalSpecificationDialog.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import { useMessageHandler } from '@/composables/useMessageHandler'
import type { MessageEvent } from '@/composables/useMessageHandler'
import {
  HICODE_DELETE_SPECIFICATION_F2B_REQ,
  HICODE_REFRESH_SPECIFICATIONS_B2F_RES,
  HICODE_ERROR_B2F,
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
const specificationTableRef = ref<InstanceType<typeof HicodeTable>>()
const specificationDialogRef = ref<InstanceType<typeof AdditionalSpecificationDialog>>()
const specificationData = ref<SpecificationData[]>([])

const { postMessage } = usePostMessage()

// 处理消息响应
const handleMessage = (event: MessageEvent) => {
  const { message, data } = event.data

  if (message === HICODE_REFRESH_SPECIFICATIONS_B2F_RES) {
    const refreshData = data as { type: string; specifications: SpecificationData[] }
    specificationData.value = JSON.parse(JSON.stringify(refreshData.specifications || []))

    let messageText = ''
    if (refreshData.type === 'add') {
      messageText = '新增产品规范成功'
    } else if (refreshData.type === 'delete') {
      messageText = '删除产品规范成功'
    } else if (refreshData.type === 'edit') {
      messageText = '更新产品规范成功'
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

// 编辑附加规范
const handleEditSpecification = (row: SpecificationData) => {
  if (specificationDialogRef.value) {
    specificationDialogRef.value.openDialog('edit', row)
  }
}

// 删除附加规范
const handleDeleteSpecification = (row: SpecificationData) => {
  ElMessageBox({
    title: '删除产品规范',
    type: 'warning',
    message: h('p', null, [h('span', null, '此操作无法撤销，确认删除?\n')]),
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = 'Loading...'
        postMessage(HICODE_DELETE_SPECIFICATION_F2B_REQ, { id: row.id })
        instance.confirmButtonLoading = false
        done()
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

// 导入附加规范
const handleImportSpecification = () => {
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
        postMessage('importSpecifications', { value: result })
      }
    }
    // 清理
    document.body.removeChild(input)
    input.removeEventListener('change', handleFileChange)
  }

  input.addEventListener('change', handleFileChange)
}

// 导出附加规范
const handleExportSpecification = () => {
  if (!specificationTableRef.value) return

  // 通过 ref 访问表格的 getSelectionRows 方法
  const selection = specificationTableRef.value.getSelectionRows()
  if (selection.length <= 0) {
    ElMessage({
      type: 'warning',
      message: '请选择需要导出的产品规则',
    })
    return
  }
  // 导出附加规范
  postMessage('exportSpecifications', JSON.parse(JSON.stringify(selection)))
}

// 新增附加规范
const handleAddSpecification = () => {
  if (specificationDialogRef.value) {
    specificationDialogRef.value.openDialog('add', undefined)
  }
}

// 初始化附加规范列表（从设置数据中获取）
const initSpecifications = (specifications?: SpecificationData[]) => {
  if (specifications) {
    specificationData.value = JSON.parse(JSON.stringify(specifications))
  }
}

// 暴露方法供父组件调用
defineExpose({
  initSpecifications,
})
</script>

<template>
  <div class="additional-specification">
    <span class="form-title">附加规范</span>
    <br />
    <span class="form-subtitle">设计出代码中使用产品及规范实现规范提效</span>
    <br />

    <!-- 附加规范表格 -->
    <HicodeTable
      ref="specificationTableRef"
      class="specification-table"
      :data="specificationData"
      :stripe="true"
    >
      <el-table-column type="selection" label="启用" width="36" />
      <el-table-column prop="name" label="名称" width="120">
        <template #default="scoped">
          <div style="display: flex; align-items: center; text-align: center">
            <span class="tab-cell-content" :title="scoped.row.name">
              {{ scoped.row.name }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="regex" label="正则表达式" width="120">
        <template #default="scoped">
          <span class="tab-cell-content">{{ scoped.row.regex }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="action" label="实现方式" width="90">
        <template #default="scoped">
          <span class="tab-cell-content">{{ scoped.row.action }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="content" label="内容">
        <template #default="scoped">
          <span class="tab-cell-content">{{ scoped.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="state" label="启用" width="65">
        <template #default="scoped">
          <el-switch v-model="scoped.row.state" disabled />
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scoped">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleEditSpecification(scoped.row)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="handleDeleteSpecification(scoped.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </HicodeTable>

    <el-button
      type="primary"
      style="margin-top: 10px"
      size="small"
      @click="handleAddSpecification"
    >
      新增
    </el-button>

    <el-button
      type="default"
      style="margin-top: 10px"
      size="small"
      @click="handleImportSpecification"
    >
      导入
    </el-button>

    <el-button
      type="default"
      style="margin-top: 10px"
      size="small"
      @click="handleExportSpecification"
    >
      导出
    </el-button>

    <!-- 附加规范对话框 -->
    <AdditionalSpecificationDialog ref="specificationDialogRef" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.additional-specification {
  .form-title {
    font-weight: 400;
    font-size: 14px;
  }

  .form-subtitle {
    color: #a0a0a0;
    font-weight: 400;
    font-size: 14px;
  }

  .specification-table {
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

