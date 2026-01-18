<script setup lang="ts">
/**
 * PromptTabs 组件 - 模板标签页组件（基础组件）
 * 职责：模板分类切换
 * - 系统模板/用户模板切换
 * - 管理当前激活的标签页
 */
import { ref, watch } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'

/**
 * 组件 Props 定义
 */
interface Props {
  /** 当前激活的标签页名称 */
  modelValue?: string
}

/**
 * 组件 Emits 定义
 */
interface Emits {
  /** 更新激活标签页事件 */
  (e: 'update:modelValue', value: string): void
  /** 标签页切换事件 */
  (e: 'tab-change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'system',
})

const emit = defineEmits<Emits>()

/** 当前激活的标签页 */
const activeName = ref(props.modelValue)

/**
 * 处理标签页切换
 */
const handleTabChange = (value: string): void => {
  activeName.value = value
  emit('update:modelValue', value)
  emit('tab-change', value)
}

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== activeName.value) {
      activeName.value = newVal
    }
  }
)
</script>

<template>
  <el-tabs v-model="activeName" class="prompt-tabs" @tab-change="handleTabChange">
    <el-tab-pane label="系统模板" name="system"></el-tab-pane>
    <el-tab-pane label="用户模板" name="custom"></el-tab-pane>
  </el-tabs>
</template>

<style scoped lang="scss">
.prompt-tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 8px;
  }

  :deep(.el-tabs__nav) {
    border: none;
    padding: 0 8px !important;
  }

  :deep(.el-tabs__item) {
    padding: 0 12px !important;
    height: 32px;
    line-height: 32px;
    color: $foreground-menu;
    font-weight: $font-weight-medium;
    font-size: $font-size-base;
    letter-spacing: 0;
  }

  :deep(.el-tabs__item.is-active) {
    color: $text-selected;
  }

  :deep(.el-tabs__active-bar) {
    background-color: $text-selected;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: $border-menu;
  }
}
</style>

