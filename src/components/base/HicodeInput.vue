<script setup lang="ts">
/**
 * HicodeInput 组件 - 基础输入框组件
 * 职责：包装 el-input，适配 VSCode 主题样式
 * - 保留 el-input 的所有属性、事件和插槽
 * - 仅修改样式以适配 VSCode 主题
 */

// 使用 defineOptions 定义组件名称（如果需要）
defineOptions({
  name: 'HicodeInput',
  inheritAttrs: false, // 禁用自动属性继承，手动控制
})
</script>

<template>
  <el-input
    v-bind="$attrs"
    class="base-input"
  >
    <!-- 传递所有插槽 -->
    <template
      v-for="(_, slot) in $slots"
      :key="slot"
      #[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </el-input>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

// 适配 VSCode 主题的 input 样式
// .base-input {
  
// }
:deep(.el-input__wrapper) {
  border: 1px solid $vscode-input-background !important;
  background-color: $vscode-input-background !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: $vscode-input-foreground !important;
}

:deep(.el-input__inner::placeholder) {
  color: $vscode-input-placeholderForeground !important;
}

:deep(.el-input__inner:focus) {
  color: $vscode-input-foreground !important;
}

// 禁用状态
:deep(.el-input.is-disabled .el-input__inner) {
  -webkit-text-fill-color: $vscode-input-foreground !important;
  color: $vscode-input-foreground !important;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: $vscode-input-background !important;
  border-color: $vscode-input-background !important;
}

// 聚焦状态
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px $vscode-focusBorder inset !important;
}

// 错误状态
:deep(.el-input.is-error .el-input__wrapper) {
  border-color: $vscode-errorForeground !important;
}

// 输入框前缀/后缀图标
:deep(.el-input__prefix),
:deep(.el-input__suffix) {
  color: $vscode-input-foreground !important;
}

// 清除按钮
:deep(.el-input__clear) {
  color: $vscode-input-foreground !important;
  
  &:hover {
    color: $vscode-textLink-foreground !important;
  }
}

// 密码显示/隐藏按钮
:deep(.el-input__password) {
  color: $vscode-input-foreground !important;
  
  &:hover {
    color: $vscode-textLink-foreground !important;
  }
}

// 计数功能
:deep(.el-input__count) {
  color: $vscode-input-foreground !important;
  background-color: transparent !important;
}
:deep(.el-textarea) {
  --el-input-border-color: $vscode-input-background !important;
}
</style>

