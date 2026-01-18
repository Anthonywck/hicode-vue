<script setup lang="ts">
/**
 * CodeSelect 组件 - 代码选择展示组件
 * 用于显示用户选中的代码，支持代码高亮和样式切换
 */
import { ref, watch, getCurrentInstance } from 'vue'
import { ElIcon } from 'element-plus'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import type { Marked } from 'marked'

/**
 * 组件 Props 定义
 */
interface Props {
  /** 选中的代码内容 */
  code?: string
  /** 代码语言类型 */
  language?: string
  /** 是否显示组件 */
  visible?: boolean
  /** 是否处于聚焦状态 */
  focused?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: '',
  visible: false,
  focused: false,
})

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  /** 清除选中代码事件 */
  clear: []
}>()

/**
 * 组件实例，用于访问全局属性
 */
const instance = getCurrentInstance()

/**
 * DOM 元素引用
 */
const codeSelectRef = ref<HTMLElement | null>(null)

/**
 * 获取 marked 实例
 * 用于解析 Markdown 内容
 */
const getMarked = (): Marked => {
  if (instance?.appContext.config.globalProperties.$marked) {
    return instance.appContext.config.globalProperties.$marked as Marked
  }
  throw new Error('$marked is not available in globalProperties')
}

/**
 * 代码选择容器的样式类
 * 根据聚焦状态切换样式
 */
const codeSelectClass = ref<'code-select-blur' | 'code-select-focus'>('code-select-blur')

/**
 * 格式化代码为 Markdown 格式
 * 
 * @param code - 代码内容
 * @param language - 代码语言类型
 * @returns 格式化后的 Markdown 代码块
 */
const getMarkedCode = (code: string, language: string): string => {
  return '```' + language + '\n' + code + '\n```'
}

/**
 * 渲染代码内容
 * 当代码内容或语言类型变化时，重新解析并渲染
 */
const renderCode = async () => {
  // 等待 DOM 元素准备好
  if (!codeSelectRef.value) {
    return
  }

  // 如果没有代码内容或不可见，清空显示
  if (!props.code || !props.visible) {
    codeSelectRef.value.innerHTML = ''
    return
  }

  try {
    // 格式化代码为 Markdown
    const markedCode = getMarkedCode(props.code, props.language)
    
    // 使用 marked 解析为 HTML
    const html = await getMarked().parse(markedCode)
    
    // 设置 HTML 内容（再次检查元素是否存在，防止异步操作期间元素被销毁）
    if (codeSelectRef.value) {
      codeSelectRef.value.innerHTML = html
    }
  } catch (error) {
    console.error('渲染代码失败:', error)
    if (codeSelectRef.value) {
      codeSelectRef.value.innerHTML = ''
    }
  }
}

/**
 * 处理清除按钮点击事件
 */
const handleClear = () => {
  emit('clear')
}

/**
 * 监听代码内容变化
 */
watch(
  () => [props.code, props.language, props.visible],
  async () => {
    await renderCode()
  },
  { immediate: true }
)

/**
 * 监听聚焦状态变化，更新样式类
 */
watch(
  () => props.focused,
  (focused) => {
    codeSelectClass.value = focused ? 'code-select-focus' : 'code-select-blur'
  },
  { immediate: true }
)
</script>

<template>
  <div class="code-select-wrapper">
    <!-- 清除按钮 -->
    <el-icon v-if="visible" class="clear-btn" @click="handleClear">
      <CircleCloseFilled />
    </el-icon>
    
    <!-- 代码选择容器 -->
    <div
      ref="codeSelectRef"
      :class="codeSelectClass"
      :style="visible ? '' : 'display: none;'"
    ></div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.code-select-wrapper {
  position: relative;
}

// 清除按钮样式
.clear-btn {
  position: absolute;
  top: 16px;
  right: 26px;
  cursor: pointer;
  color: $text-color;
  z-index: 10;

  &:hover {
    color: $error-color;
  }
}

// 代码选择容器 - 失焦状态
.code-select-blur {
  overflow: hidden;
  width: calc(100% - 2px);
  max-height: 200px;
  border-top: 1px solid $vscode-input-background;
  border-right: 1px solid $vscode-input-background;
  border-bottom: 0 solid $vscode-input-background !important;
  border-left: 1px solid $vscode-input-background;
  border-radius: 3px 3px 0 0 !important;

  pre {
    margin: 0 !important;
  }

  :deep(.hljs) {
    overflow: auto;
    width: unset;
    max-height: 174px;
  }
}

// 代码选择容器 - 聚焦状态
.code-select-focus {
  overflow: hidden;
  width: calc(100% - 2px);
  max-height: 200px;
  border-top: 1px solid $vscode-textLink-foreground;
  border-right: 1px solid $vscode-textLink-foreground;
  border-bottom: 0 solid $vscode-input-background !important;
  border-left: 1px solid $vscode-textLink-foreground;
  border-radius: 3px 3px 0 0 !important;

  pre {
    margin: 0 !important;
  }

  :deep(.hljs) {
    overflow: auto;
    width: unset;
    max-height: 174px;
  }
}
</style>

