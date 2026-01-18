<script setup lang="ts">
/**
 * HicodeTable 组件 - 基础表格组件
 * 职责：包装 el-table，适配 VSCode 主题样式
 * - 保留 el-table 的所有属性、事件和插槽
 * - 仅修改样式以适配 VSCode 主题
 * - 暴露 el-table 的方法供外部调用
 */

import { ref } from 'vue'
import type { ElTable } from 'element-plus'

// 使用 defineOptions 定义组件名称（如果需要）
defineOptions({
  name: 'HicodeTable',
  inheritAttrs: false, // 禁用自动属性继承，手动控制
})

// 表格实例引用
const tableRef = ref<InstanceType<typeof ElTable>>()

// 暴露 el-table 的方法
defineExpose({
  // 获取选中的行
  getSelectionRows: () => {
    return tableRef.value?.getSelectionRows() || []
  },
  // 其他 el-table 方法可以通过 tableRef 访问
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: unknown, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  doLayout: () => tableRef.value?.doLayout(),
})
</script>

<template>
  <el-table
    ref="tableRef"
    v-bind="$attrs"
    class="base-table"
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
  </el-table>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// 复选框样式（全局样式，不在 .base-table 内部）
:deep(.el-checkbox__inner) {
  border: 1px solid var(--vscode-checkbox-selectBorder);
  background-color: var(--vscode-checkbox-background);
}
:deep(.el-checkbox__input.is-disabled .el-checkbox__inner) {
  border-color: var(--vscode-checkbox-border);
  background-color: var(--vscode-checkbox-selectBackground);
}

</style>
<style lang="scss">
// 适配 VSCode 主题的 table 样式
.base-table {
  // Element Plus CSS 变量设置
  --el-table-border: 1px solid $vscode-badge-background !important;
  --el-table-border-color: $vscode-badge-background !important;
  --el-table-tr-bg-color: $vscode-sideBar-background !important;

  background-color: $vscode-table-background !important;
  width: 100%;
  // 表格边框样式
}
.el-table__inner-wrapper::before {
  background-color: $vscode-badge-background !important;
}

.el-table__inner-wrapper::after {
  background-color: $vscode-badge-background !important;
}

// 表格空数据样式
.el-table__empty-block {
  background-color: $vscode-input-background !important;
  color: $vscode-input-placeholderForeground !important;
}

.el-table__empty-text {
  color: $vscode-input-placeholderForeground !important;
}

// 表格加载样式
.el-table__loading-mask {
  background-color: rgba($vscode-input-background, 0.8) !important;
}

// 固定列阴影
.el-table__fixed-right-patch {
  background-color: $vscode-input-background !important;
}

.el-table__fixed {
  background-color: $vscode-input-background !important;
}

// 排序图标
.el-table__sort-caret {
  border-top-color: $vscode-input-foreground !important;
  border-bottom-color: $vscode-input-foreground !important;
}

.el-table__sort-caret.ascending {
  border-bottom-color: $vscode-textLink-foreground !important;
}

.el-table__sort-caret.descending {
  border-top-color: $vscode-textLink-foreground !important;
}

// 展开行图标
.el-table__expand-icon {
  color: $vscode-input-foreground !important;
  
  &:hover {
    color: $vscode-textLink-foreground !important;
  }
}

// 选择框样式（如果需要）
.el-checkbox {
  --el-checkbox-checked-bg-color: $vscode-checkbox-selectBackground !important;
  --el-checkbox-checked-border-color: $vscode-checkbox-selectBorder !important;
}

// 表格行样式（与 light-code-html 保持一致）
.el-table__row {
  background-color: $vscode-input-background !important;
  color: $vscode-editor-foreground !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  letter-spacing: 0 !important;
}



// 表格单元格样式
.el-table td.el-table__cell {
  border-color: $vscode-badge-background !important;
  background-color: $vscode-input-background !important;
  color: $vscode-foreground !important;
}

// 悬停行样式
.el-table__body tr.hover-row > td.el-table__cell {
  background-color: $vscode-editorBracketMatch-border !important;
}

// 当前行样式
.el-table__body tr.current-row > td.el-table__cell {
  background-color: $vscode-list-activeSelectionBackground !important;
  color: $vscode-list-activeSelectionForeground !important;
}

// 斑马纹表格的交替行样式（与 light-code-html 保持一致）
.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background-color: $vscode-sideBar-background !important;
  color: $vscode-editor-foreground !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  letter-spacing: 0 !important;
}
// 表头样式（与 light-code-html 保持一致）
.el-table th.el-table__cell {
  border: 1px solid $vscode-badge-background !important;
  background-color: $vscode-input-background !important;
  color: $vscode-editor-foreground !important;
  font-weight: 400 !important;
  font-size: 14px !important;
}
</style>
