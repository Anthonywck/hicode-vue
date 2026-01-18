<script setup lang="ts">
/**
 * HicodeSelector 组件 - 基础选择器组件
 * 职责：包装 el-select，适配 VSCode 主题样式
 * - 保留 el-select 的所有属性、事件和插槽
 * - 仅修改样式以适配 VSCode 主题
 */

import { computed, useAttrs } from 'vue'

// 使用 defineOptions 定义组件名称（如果需要）
defineOptions({
  name: 'HicodeSelector',
  inheritAttrs: false, // 禁用自动属性继承，手动控制
})

// 获取 attrs
const attrs = useAttrs()

// 计算 popper-class，合并用户传入的 popper-class 和默认的样式类
const popperClass = computed(() => {
  const userPopperClass = (attrs.popperClass as string) || ''
  const defaultClass = 'base-selector-popper'
  return userPopperClass ? `${defaultClass} ${userPopperClass}` : defaultClass
})

// 合并属性，确保 popper-class 被正确应用
const selectAttrs = computed(() => {
  return {
    ...attrs,
    popperClass: popperClass.value,
  }
})
</script>

<template>
  <el-select
    v-bind="selectAttrs"
    class="base-selector"
  >
    <!-- 传递所有插槽 -->
    <template
      v-for="(_, slot) in $slots"
      :key="slot"
      #[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope ?? {}"
      />
    </template>
  </el-select>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

// 适配 VSCode 主题的 select 样式
.base-selector {
  // 选择器包装器样式
  :deep(.el-select__wrapper) {
    background-color: $vscode-input-background !important;
    box-shadow: 0 0 0 1px $vscode-input-background inset !important;
    border: 1px solid $vscode-input-background !important;
  }

  // 选择器输入框文本颜色
  :deep(.el-select__placeholder) {
    color: $vscode-input-placeholderForeground !important;
  }

  :deep(.el-select__selected-item) {
    color: $vscode-input-foreground !important;
  }

  // 聚焦状态
  :deep(.el-select__wrapper.is-focus) {
    box-shadow: 0 0 0 1px $vscode-focusBorder inset !important;
  }

  // 禁用状态
  :deep(.el-select.is-disabled .el-select__wrapper) {
    background-color: $vscode-input-background !important;
    border-color: $vscode-input-background !important;
  }

  :deep(.el-select.is-disabled .el-select__selected-item) {
    color: $vscode-input-foreground !important;
    -webkit-text-fill-color: $vscode-input-foreground !important;
  }

  // 多选时的标签样式
  :deep(.el-tag) {
    background-color: $vscode-checkbox-background !important;
    color: $vscode-input-foreground !important;
    border-color: $vscode-checkbox-background !important;
  }

  :deep(.el-tag__close) {
    color: $vscode-input-foreground !important;
    
    &:hover {
      color: $vscode-textLink-foreground !important;
      background-color: transparent !important;
    }
  }

  // 下拉箭头图标
  :deep(.el-select__caret) {
    color: $vscode-input-foreground !important;
  }

  // 清除按钮
  :deep(.el-select__clear) {
    color: $vscode-input-foreground !important;
    
    &:hover {
      color: $vscode-textLink-foreground !important;
    }
  }

  // 下拉菜单样式（通过 popper-class 或全局样式控制）
  // 注意：下拉菜单是挂载在 body 上的，需要使用全局样式或 popper-class
  // 这里提供基础样式，实际使用时可能需要通过 popper-class 应用
}

// 全局样式：下拉菜单（因为下拉菜单挂载在 body 上，不在组件作用域内）
// 注意：需要使用 :global 或非 scoped 样式，因为下拉菜单挂载在 body 上
</style>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;

.base-selector-popper {
  background-color: $vscode-input-background !important;
  border: 1px solid $vscode-panel-border !important;

  .el-select-dropdown__item {
    color: $vscode-input-foreground !important;
    background-color: $vscode-input-background !important;

    &:hover {
      background-color: $vscode-list-hoverBackground !important;
    }

    &.selected {
      color: $vscode-list-activeSelectionForeground !important;
      background-color: $vscode-list-activeSelectionBackground !important;
    }

    &.is-disabled {
      color: $vscode-input-placeholderForeground !important;
    }
  }

  .el-select-dropdown__empty {
    color: $vscode-input-placeholderForeground !important;
  }

  .el-select-dropdown__loading {
    color: $vscode-input-foreground !important;
  }
}
</style>

