<script setup lang="ts">
/**
 * PromptList 组件 - 模板列表组件（基础组件）
 * 职责：模板列表展示
 * - 展示系统模板列表
 * - 展示用户模板列表
 * - 处理模板点击事件
 */
import { computed } from 'vue'

/**
 * 模板项数据类型定义
 */
interface PromptItem {
  /** 模板ID */
  id: string | number
  /** 模板标题 */
  title: string
  /** 其他可选属性 */
  [key: string]: unknown
}

/**
 * 组件 Props 定义
 */
interface Props {
  /** 模板列表数据 */
  prompts: PromptItem[]
  /** 模板类型：system-系统模板, custom-用户模板 */
  type: 'system' | 'custom'
  /** 是否显示快捷键提示 */
  showShortcut?: boolean
  /** 列表容器ID（用于滚动定位） */
  containerId?: string
}

/**
 * 组件 Emits 定义
 */
interface Emits {
  /** 模板点击事件 */
  (e: 'prompt-click', promptId: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  prompts: () => [],
  type: 'system',
  showShortcut: false,
  containerId: '',
})

const emit = defineEmits<Emits>()

/**
 * 处理模板项点击
 */
const handlePromptClick = (promptId: string | number): void => {
  emit('prompt-click', promptId)
}

/**
 * 获取快捷键文本（仅系统模板显示）
 */
const getShortcutText = (index: number): string => {
  if (props.type === 'system' && props.showShortcut) {
    return `Ctrl+Alt+${index + 1}`
  }
  return ''
}
</script>

<template>
  <div :id="containerId" class="prompt-list">
    <div
      v-for="(item, index) in prompts"
      :key="item.id"
      class="prompt-item"
      @click="handlePromptClick(item.id)"
    >
      <span class="prompt-title" :title="item.title">{{ item.title }}</span>
      <span v-if="getShortcutText(index)" class="prompt-shortcut">
        {{ getShortcutText(index) }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.prompt-list {
  color: $vscode-foreground;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  height: 194px;

  .prompt-item {
    display: flex;
    align-items: center;
    width: calc(100% - 40px);
    height: 24px;
    padding: 0 20px;
    color: $foreground-menu;
    font-weight: $font-weight-normal;
    font-size: $font-size-small;
    letter-spacing: 0;
    text-align: justify;
    cursor: pointer;
    transition: background-color $transition-fast, color $transition-fast;

    span {
      height: 24px;
      line-height: 24px;
    }

    .prompt-title {
      overflow: hidden;
      max-width: calc(100% - 70px);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .prompt-shortcut {
      justify-content: flex-end;
      margin-right: 0px;
      margin-left: auto;
      color: $foreground-menu;
      opacity: 0.7;
    }
  }

  .prompt-item:hover {
    background-color: $background-menu !important;
    color: $foreground-menu !important;
  }
}
</style>

