<script setup lang="ts">
/**
 * HicodeDialog 组件 - 基础对话框组件
 * 职责：包装 el-dialog，适配 VSCode 主题样式
 * - 保留 el-dialog 的所有属性、事件和插槽
 * - 统一实现 header，包括 title 和 close 按钮
 * - 确保 title 垂直居中，统一字号和字重
 */

import { computed, useSlots } from 'vue'
import { Close } from '@element-plus/icons-vue'

// 使用 defineOptions 定义组件名称（如果需要）
defineOptions({
  name: 'HicodeDialog',
  inheritAttrs: false, // 禁用自动属性继承，手动控制
})

// Props：接收 title 属性
const props = defineProps<{
  title?: string
}>()

// 获取 slots
const slots = useSlots()

// 计算是否有自定义 header 插槽
const hasHeaderSlot = computed(() => {
  return !!slots.header
})
</script>

<template>
  <el-dialog
    v-bind="$attrs"
    class="base-dialog"
    :title="props.title"
  >
    <!-- 如果没有自定义 header 插槽，使用默认的 header（包含 title 和 close 按钮） -->
    <template v-if="!hasHeaderSlot" #header="{ close, titleId, titleClass }">
      <div class="dlg-header">
        <span :id="titleId" :class="titleClass" class="dlg-title">
          {{ props.title || '' }}
        </span>
        <el-icon class="close-btn" @click="close">
          <Close />
        </el-icon>
      </div>
    </template>

    <!-- 如果有自定义 header 插槽，使用自定义的 -->
    <template v-else #header="scope">
      <slot name="header" v-bind="scope" />
    </template>

    <!-- 传递其他插槽 -->
    <template
      v-for="(_, slot) in slots"
      :key="slot"
      #[slot]="scope"
    >
      <slot
        v-if="slot !== 'header'"
        :name="slot"
        v-bind="scope"
      />
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
:deep(.el-textarea__inner) {
  width: 100%;
  height: 68px;
  margin: 0;
  background-color: transparent;
  color: var(--vscode-input-foreground);
  line-height: 20px;
  resize: none;
}
:deep(.el-input__inner) {
  color: var(--vscode-input-foreground);
}

:deep(.el-input__inner:focus) {
  color: var(--vscode-input-foreground);
}
:deep(.el-input.is-disabled .el-input__inner) {
  -webkit-text-fill-color: var(--vscode-input-foreground);
}
</style>
<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

// 对话框头部容器样式（统一实现）
.dlg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 44px;
  background-color: $background-editor;

  // 标题样式（垂直居中，统一字号和字重）
  .dlg-title {
    display: flex;
    align-items: center;
    height: 44px;
    line-height: 44px;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0;
    color: $vscode-editor-foreground;
  }

  // 关闭按钮样式
  .close-btn {
    height: 44px !important;
    line-height: 44px !important;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $vscode-input-foreground;

    &:hover {
      color: $vscode-textLink-foreground;
    }
  }
}
</style>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;

// 适配 VSCode 主题的 dialog 样式
// 对话框主体背景
.el-dialog {
  background-color: $background-editor !important;
  border-radius: 4px !important;
  padding: 0 !important;
}

// 对话框内容区域
.base-dialog .el-dialog__body {
  padding: 20px 40px !important;
  background-color: $background-editor !important;
  color: $vscode-foreground !important;
  font-size: 12px !important;
}

// 对话框头部样式
.base-dialog .el-dialog__header {
  margin: 0 !important;
  padding: 0 24px !important;
  background-color: $background-editor !important;
  border-bottom: 1px solid $vscode-panel-border !important;
  border-radius: 4px 4px 0 0 !important;
}

// 对话框标题样式（当使用默认 title 属性时）
.base-dialog .el-dialog__title {
  color: $vscode-editor-foreground !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 44px !important;
  height: 44px !important;
  letter-spacing: 0 !important;
  display: flex;
  align-items: center;
}

// 对话框关闭按钮（默认隐藏，因为使用自定义 header）
.base-dialog .el-dialog__headerbtn {
  display: none !important;
}

// 对话框底部区域
.base-dialog .el-dialog__footer {
  padding: 16px 24px !important;
  background-color: $background-editor !important;
  border-top: 1px solid $vscode-panel-border !important;
  border-radius: 0 0 4px 4px !important;
}
</style>

