<script setup lang="ts">
/**
 * ResourceInput 组件 - 支持资源标签混编的输入组件
 * 功能：
 * 1. 支持纯文本输入
 * 2. 支持资源标签（代码片段、文件等）的插入和显示
 * 3. 支持资源标签和文本的混编
 * 4. 支持键盘快捷键（Enter发送、Ctrl/Cmd+Enter换行、↑显示历史）
 * 5. 支持资源标签的删除（hover显示关闭按钮）
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue'

/**
 * 资源类型定义
 */
interface Resource {
  /** 资源唯一标识 */
  id: string
  /** 资源类型：code-代码片段, file-文件, image-图片 */
  type: 'code' | 'file' | 'image'
  /** 代码语言（type为code时使用） */
  language?: string
  /** 代码语言ID（type为code时使用） */
  languageId?: string
  /** 文件路径 */
  filePath?: string
  /** 代码内容（type为code时使用） */
  code?: string
  /** 起始行号（type为code时使用） */
  startLine?: number
  /** 结束行号（type为code时使用） */
  endLine?: number
  /** 资源名称 */
  name?: string
}

/**
 * 组件 Props 定义
 */
interface Props {
  /** 输入框的值（v-model） */
  modelValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 资源列表 */
  resources?: Resource[]
  /** 是否聚焦 */
  focused?: boolean
}

/**
 * 组件 Emits 定义
 */
interface Emits {
  /** 更新值事件 */
  (e: 'update:modelValue', value: string): void
  /** 聚焦事件 */
  (e: 'focus', event: FocusEvent): void
  /** 失焦事件 */
  (e: 'blur', event: FocusEvent): void
  /** 输入事件 */
  (e: 'input', event: Event): void
  /** Enter键事件（发送） */
  (e: 'enter', event: KeyboardEvent): void
  /** Ctrl/Cmd+Enter键事件（换行） */
  (e: 'ctrl-enter', event: KeyboardEvent): void
  /** 上箭头键事件（显示历史） */
  (e: 'arrow-up', event: KeyboardEvent): void
  /** 资源删除事件 */
  (e: 'resource-removed', resourceId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '输入问题，ctrl/⌘↵换行，↵发送，↑展示上一次编辑内容',
  resources: () => [],
  focused: false,
})

const emit = defineEmits<Emits>()

// 响应式数据
const inputContainer = ref<HTMLDivElement | null>(null)
const editableDiv = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
/** 存储资源ID到DOM元素的映射 */
const resourcesMap = ref<Map<string, HTMLElement>>(new Map())

/**
 * 容器类名计算属性
 */
const containerClass = computed(() => {
  return isFocused.value
    ? 'resource-input-container-blur'
    : 'resource-input-container-blur'
})

/**
 * 容器样式计算属性
 */
const containerStyle = computed(() => {
  return {}
})

/**
 * 获取当前内容（纯文本，不包括标签）
 */
const getContent = (): string => {
  const div = editableDiv.value
  if (!div) return ''
  return extractTextFromNode(div)
}

/**
 * 从节点中提取纯文本
 */
const extractTextFromNode = (node: Node): string => {
  let text = ''
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent || ''
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // 如果是资源标签，提取其标识符
      const element = child as HTMLElement
      if (element.classList && element.classList.contains('resource-tag')) {
        const resourceId = element.getAttribute('data-resource-id')
        if (resourceId) {
          text += `@${resourceId}`
        }
      } else {
        text += extractTextFromNode(child)
      }
    }
  }
  return text
}

/**
 * 设置内容
 */
const setContent = (content: string): void => {
  const div = editableDiv.value
  if (!div) return
  // 简单设置文本内容，资源标签通过 resources prop 单独管理
  div.textContent = content
}

/**
 * 规范化文件路径（统一路径格式，便于比较）
 */
const normalizePath = (path: string): string => {
  if (!path) return ''
  // 统一使用正斜杠，并转换为小写（Windows路径不区分大小写）
  return path.replace(/\\/g, '/').toLowerCase()
}

/**
 * 通过文件路径查找标签
 */
const findTagByFilePath = (resource: Resource): HTMLElement | null => {
  if (resource.type !== 'code' || !resource.filePath) {
    return null
  }
  const div = editableDiv.value
  if (!div) return null

  const allTags = div.querySelectorAll('.resource-tag')
  for (const tag of Array.from(allTags)) {
    const element = tag as HTMLElement
    const resourceId = element.getAttribute('data-resource-id')
    const existingResource = props.resources.find((r) => r.id === resourceId)
    if (
      existingResource &&
      existingResource.type === 'code' &&
      normalizePath(existingResource.filePath || '') ===
      normalizePath(resource.filePath || '')
    ) {
      return element
    }
  }
  return null
}

/**
 * 获取资源标签文本
 */
const getResourceLabel = (resource: Resource): string => {
  if (resource.type === 'code') {
    const filePath = resource.filePath || 'code'
    // 只显示文件名，不显示完整路径
    const fileName = filePath.split(/[/\\]/).pop() || filePath
    return `${resource.language || 'code'}:${fileName}`
  } else if (resource.type === 'file') {
    const filePath = resource.filePath || resource.name || 'file'
    return filePath.split(/[/\\]/).pop() || filePath
  } else if (resource.type === 'image') {
    return resource.name || 'image'
  }
  return resource.name || resource.id || 'resource'
}

/**
 * 更新资源标签的内容显示
 */
const updateResourceTagContent = (tag: HTMLElement, resource: Resource): void => {
  const labelSpan = tag.querySelector('.resource-tag-label')
  if (labelSpan) {
    labelSpan.textContent = getResourceLabel(resource)
  }
}

/**
 * 插入资源标签
 */
const insertResourceTag = (resource: Resource): void => {
  const div = editableDiv.value
  if (!div) return

  // 检查是否已存在该资源的标签，避免重复插入
  if (resourcesMap.value.has(resource.id)) {
    // 如果已存在，更新内容即可
    const existingTag = resourcesMap.value.get(resource.id)
    if (existingTag) {
      updateResourceTagContent(existingTag, resource)
    }
    return
  }

  const selection = window.getSelection()
  let range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  // 检查选区是否在 editableDiv 内部，如果不在则设为 null，后续会插入到末尾
  if (range && !div.contains(range.commonAncestorContainer)) {
    range = null
  }

  // 创建资源标签元素
  const tag = document.createElement('span')
  tag.className = 'resource-tag'
  tag.setAttribute('data-resource-id', resource.id)
  tag.setAttribute('contenteditable', 'false')
  const label = getResourceLabel(resource)
  const tagContent = document.createElement('span')
  tagContent.className = 'resource-tag-content'

  // 创建图标容器（用于显示图标或关闭按钮）
  const iconContainer = document.createElement('span')
  iconContainer.className = 'resource-tag-icon-container'

  // 创建图标
  const icon = document.createElement('span')
  icon.className = 'resource-tag-icon'
  icon.textContent = '📎'

  // 创建关闭按钮
  const closeBtn = document.createElement('span')
  closeBtn.className = 'resource-tag-close'
  closeBtn.textContent = '×'
  closeBtn.setAttribute('title', '删除')

  // 图标和关闭按钮放在同一个容器中，通过 hover 切换显示
  iconContainer.appendChild(icon)
  iconContainer.appendChild(closeBtn)

  const labelSpan = document.createElement('span')
  labelSpan.className = 'resource-tag-label'
  labelSpan.textContent = label

  tagContent.appendChild(iconContainer)
  tagContent.appendChild(labelSpan)
  tag.appendChild(tagContent)

  // 绑定删除事件
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    e.preventDefault()
    removeResource(resource.id)
  })

  if (range) {
    // 在光标位置插入
    range.deleteContents()
    range.insertNode(tag)
    // 在标签后插入一个空格或文本节点，方便继续输入
    const textNode = document.createTextNode(' ')
    range.setStartAfter(tag)
    range.insertNode(textNode)
    range.setStartAfter(textNode)
    range.collapse(true)
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  } else {
    // 在末尾插入
    div.appendChild(tag)
    const textNode = document.createTextNode(' ')
    div.appendChild(textNode)
  }

  // 确保输入框有足够的高度和可点击区域
  nextTick(() => {
    ensureInputArea()
    ensureMinHeight()
  })

  resourcesMap.value.set(resource.id, tag)
  syncValue()
}

/**
 * 更新资源标签
 */
const updateResources = (resources: Resource[]): void => {
  const div = editableDiv.value
  if (!div) return

  // 移除旧的资源标签（不在新资源列表中的）
  const oldTags = div.querySelectorAll('.resource-tag')
  oldTags.forEach((tag) => {
    const element = tag as HTMLElement
    const resourceId = element.getAttribute('data-resource-id')
    if (!resources.find((r) => r.id === resourceId)) {
      element.remove()
      resourcesMap.value.delete(resourceId || '')
    }
  })

  // 更新或添加资源标签
  resources.forEach((resource) => {
    // 首先检查是否已存在该资源ID的标签
    const existingTag = resourcesMap.value.get(resource.id)
    if (existingTag) {
      // 如果标签已存在，更新其内容
      updateResourceTagContent(existingTag, resource)
      return
    }

    // 如果标签不存在，检查是否有相同文件的标签需要更新
    if (resource.type === 'code' && resource.filePath) {
      const sameFileTag = findTagByFilePath(resource)
      if (sameFileTag) {
        // 找到相同文件的标签，更新资源ID映射并更新内容
        const oldResourceId = sameFileTag.getAttribute('data-resource-id')
        // 确保旧ID和新ID不同才更新映射
        if (oldResourceId !== resource.id) {
          resourcesMap.value.delete(oldResourceId || '')
          sameFileTag.setAttribute('data-resource-id', resource.id)
          resourcesMap.value.set(resource.id, sameFileTag)
        }
        updateResourceTagContent(sameFileTag, resource)
        return
      }
    }

    // 没有找到，插入新标签
    insertResourceTag(resource)
  })

  // 更新后，检查是否需要清理空节点并确保有足够的可点击区域
  nextTick(() => {
    const textContent = div.textContent ? div.textContent.trim() : ''
    const hasTags = div.querySelectorAll('.resource-tag').length > 0
    if (!textContent && !hasTags) {
      // 如果完全为空，清空所有内容
      div.textContent = ''
    } else {
      // 清理多余的空白节点
      cleanupEmptyNodes(div)
      // 确保有足够的可点击区域
      ensureInputArea()
      ensureMinHeight()
    }
  })
}

/**
 * 移除资源
 */
const removeResource = (resourceId: string): void => {
  const tag = resourcesMap.value.get(resourceId)
  if (tag && tag.parentNode) {
    tag.parentNode.removeChild(tag)
    resourcesMap.value.delete(resourceId)
    syncValue()
    emit('resource-removed', resourceId)

    // 删除标签后，清理输入框，确保恢复到空状态
    nextTick(() => {
      const div = editableDiv.value
      if (!div) return

      // 检查是否真的为空（没有文本且没有标签）
      const textContent = div.textContent ? div.textContent.trim() : ''
      const hasTags = div.querySelectorAll('.resource-tag').length > 0

      if (!textContent && !hasTags) {
        // 完全清空输入框，确保是真正的空状态
        // 先移除所有子节点
        while (div.firstChild) {
          div.removeChild(div.firstChild)
        }
      } else {
        // 清理多余的空白节点和换行符
        cleanupEmptyNodes(div)
      }
    })
  }
}

/**
 * 清理空节点
 */
const cleanupEmptyNodes = (node: Node): void => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, null, false)
  const nodesToRemove: Node[] = []

  let currentNode: Node | null
  while ((currentNode = walker.nextNode())) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      // 如果文本节点只包含空白字符，标记为删除
      if (currentNode.textContent?.trim() === '') {
        nodesToRemove.push(currentNode)
      }
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as HTMLElement
      // 如果是空的元素节点（除了资源标签），也标记为删除
      if (
        !element.classList.contains('resource-tag') &&
        element.textContent?.trim() === '' &&
        element.children.length === 0
      ) {
        nodesToRemove.push(currentNode)
      }
    }
  }

  // 删除标记的节点
  nodesToRemove.forEach((node) => {
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }
  })
}

/**
 * 同步值到父组件
 */
const syncValue = (): void => {
  const content = getContent()
  emit('update:modelValue', content)
}

/**
 * 确保输入框有足够的可点击区域
 */
const ensureInputArea = (): void => {
  const div = editableDiv.value
  if (!div) return

  const hasTags = div.querySelectorAll('.resource-tag').length > 0

  // 如果有资源标签，确保标签后有足够的空间
  if (hasTags) {
    // 检查最后一个子节点
    let lastChild = div.lastChild

    // 移除末尾的空白文本节点和多余的换行符
    while (lastChild) {
      if (lastChild.nodeType === Node.TEXT_NODE && lastChild.textContent?.trim() === '') {
        const prev = lastChild.previousSibling
        div.removeChild(lastChild)
        lastChild = prev
      } else if (
        lastChild.nodeType === Node.ELEMENT_NODE &&
        (lastChild as HTMLElement).tagName === 'BR' &&
        lastChild.previousSibling &&
        (lastChild.previousSibling as HTMLElement).tagName === 'BR'
      ) {
        // 移除连续的换行符
        const prev = lastChild.previousSibling
        div.removeChild(lastChild)
        lastChild = prev
      } else {
        break
      }
    }

    // 如果最后一个节点是资源标签，在它后面添加一个换行符，确保有可点击区域
    lastChild = div.lastChild
    if (
      lastChild &&
      lastChild.nodeType === Node.ELEMENT_NODE &&
      (lastChild as HTMLElement).classList?.contains('resource-tag')
    ) {
      // 在标签后添加一个换行符，确保有足够的可点击区域
      const br = document.createElement('br')
      div.appendChild(br)
    } else if (
      !lastChild ||
      (lastChild.nodeType === Node.TEXT_NODE && !lastChild.textContent?.trim())
    ) {
      // 如果最后是空文本节点或没有节点，添加换行符
      const br = document.createElement('br')
      div.appendChild(br)
    }
  }
}

/**
 * 确保输入框有最小高度
 */
const ensureMinHeight = (): void => {
  const div = editableDiv.value
  if (!div) return

  // 强制设置最小高度，确保即使内容很少时也有足够的可点击区域
  const minHeight = 58 // 最小高度 58px
  const currentHeight = div.offsetHeight

  if (currentHeight < minHeight) {
    // 使用 style 直接设置，确保优先级
    div.style.setProperty('min-height', `${minHeight}px`, 'important')
  }
}

/**
 * 处理输入事件
 */
const handleInput = (e: Event): void => {
  const div = editableDiv.value
  if (div) {
    // 检查内容是否为空
    const textContent = div.textContent ? div.textContent.trim() : ''
    const hasTags = div.querySelectorAll('.resource-tag').length > 0

    // 如果内容为空且没有标签，清理所有子节点以确保 :empty 伪类生效
    if (!textContent && !hasTags) {
      nextTick(() => {
        if (div && !div.textContent?.trim() && !div.querySelectorAll('.resource-tag').length) {
          // 移除所有子节点，确保输入框是真正的空状态
          while (div.firstChild) {
            div.removeChild(div.firstChild)
          }
        }
      })
    } else {
      // 如果有内容或标签，确保输入框有足够的可点击区域
      nextTick(() => {
        ensureInputArea()
        ensureMinHeight()
      })
    }
  }

  syncValue()
  emit('input', e)
}

/**
 * 插入换行
 */
const insertNewLine = (): void => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const br = document.createElement('br')
  range.deleteContents()
  range.insertNode(br)
  range.setStartAfter(br)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  syncValue()
}

/**
 * 处理 Backspace 键
 */
const handleBackspace = (e: KeyboardEvent): void => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (range.collapsed && range.startOffset === 0) {
    const container = range.startContainer
    const previousSibling = container.previousSibling
    if (
      previousSibling &&
      (previousSibling as HTMLElement).classList?.contains('resource-tag')
    ) {
      e.preventDefault()
      const resourceId = (previousSibling as HTMLElement).getAttribute('data-resource-id')
      if (resourceId) {
        removeResource(resourceId)
      }
    }
  }
}

/**
 * 处理键盘事件
 */
const handleKeydown = (e: KeyboardEvent): void => {
  const { code, ctrlKey, metaKey, isComposing, keyCode } = e

  // 处理 Enter 键
  if (code === 'Enter' && !isComposing) {
    if (ctrlKey || metaKey) {
      // Ctrl/Cmd + Enter: 换行
      e.preventDefault()
      insertNewLine()
      emit('ctrl-enter', e)
    } else {
      // Enter: 发送
      e.preventDefault()
      emit('enter', e)
    }
    return
  }

  // 处理 Up 键
  if (keyCode === 38) {
    emit('arrow-up', e)
    return
  }

  // 处理 Backspace: 如果光标在资源标签前，删除标签
  if (code === 'Backspace') {
    handleBackspace(e)
  }
}

/**
 * 处理粘贴事件
 */
const handlePaste = (e: ClipboardEvent): void => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') || ''
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  range.deleteContents()
  const textNode = document.createTextNode(text)
  range.insertNode(textNode)
  range.setStartAfter(textNode)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)

  syncValue()
}

/**
 * 处理可编辑div聚焦
 */
const handleEditableFocus = (e: FocusEvent): void => {
  isFocused.value = true
  emit('focus', e)
}

/**
 * 处理可编辑div失焦
 */
const handleEditableBlur = (e: FocusEvent): void => {
  // 延迟检查，以便点击删除按钮时不会立即失焦
  setTimeout(() => {
    if (!editableDiv.value || !editableDiv.value.contains(document.activeElement)) {
      isFocused.value = false
      emit('blur', e)
    }
  }, 200)
}

/**
 * 处理容器点击
 */
const handleContainerClick = (e: MouseEvent): void => {
  const div = editableDiv.value
  if (!div) return

  // 如果点击的是容器但不是可编辑div本身，聚焦可编辑div
  if (e.target === inputContainer.value && document.activeElement !== div) {
    div.focus()
    // 如果有标签但没有文本，将光标放在最后一个标签后
    const hasTags = div.querySelectorAll('.resource-tag').length > 0
    const textContent = div.textContent ? div.textContent.trim() : ''
    if (hasTags && !textContent) {
      const lastTag = div.lastChild
      if (lastTag) {
        const range = document.createRange()
        const selection = window.getSelection()
        if (selection) {
          range.setStartAfter(lastTag)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }
}

/**
 * 聚焦输入框
 */
const focus = (): void => {
  if (editableDiv.value) {
    editableDiv.value.focus()
  }
}

/**
 * 失焦输入框
 */
const blur = (): void => {
  if (editableDiv.value) {
    editableDiv.value.blur()
  }
}

/**
 * 设置光标位置
 */
const setCursorPosition = (position: number): void => {
  const div = editableDiv.value
  if (!div) return

  const textNode = getTextNodeAtPosition(div, position)
  if (textNode) {
    const range = document.createRange()
    const selection = window.getSelection()
    if (selection) {
      range.setStart(
        textNode.node,
        Math.min(position, textNode.node.textContent?.length || 0)
      )
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

/**
 * 获取指定位置的文本节点
 */
const getTextNodeAtPosition = (
  root: Node,
  position: number
): { node: Text; offset: number } | null => {
  let currentPos = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)

  let node: Node | null
  while ((node = walker.nextNode())) {
    const textNode = node as Text
    const nodeLength = textNode.textContent?.length || 0
    if (currentPos + nodeLength >= position) {
      return { node: textNode, offset: position - currentPos }
    }
    currentPos += nodeLength
  }
  return null
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== getContent()) {
      setContent(newVal)
    }
  }
)

// 监听 resources 变化
watch(
  () => props.resources,
  (newResources) => {
    updateResources(newResources)
  },
  { deep: true }
)

// 监听 focused 变化
watch(
  () => props.focused,
  (newVal) => {
    if (newVal && editableDiv.value) {
      editableDiv.value.focus()
    }
  }
)

// 组件挂载时初始化
onMounted(() => {
  if (props.modelValue) {
    setContent(props.modelValue)
  }
  updateResources(props.resources)
})

// 暴露方法供父组件调用
defineExpose({
  focus,
  blur,
  setCursorPosition,
})
</script>

<template>
  <div ref="inputContainer" :class="containerClass" :style="containerStyle" @click="handleContainerClick">
    <div ref="editableDiv" class="resource-input-editable" contenteditable="true" :placeholder="placeholder"
      @input="handleInput" @keydown="handleKeydown" @paste="handlePaste" @focus="handleEditableFocus"
      @blur="handleEditableBlur"></div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.resource-input-container-blur,
.resource-input-container-focus {
  width: 100% !important;
  max-height: 226px !important;
  border-radius: $border-radius-md;
  background: $background-input;
  padding: 0;
  min-height: 68px !important;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: text;
  // 确保容器始终有足够的高度
  position: relative;
}

.resource-input-container-blur {
  border: 1px solid $background-input;
}

.resource-input-container-focus {
  border: 1px solid $vscode-textLink-foreground;
  border-radius: $border-radius-sm;
}

.resource-input-editable {
  background: $background-input;
  width: 100% !important;
  min-height: 58px !important;
  max-height: 200px;
  overflow-y: auto;
  color: $vscode-input-foreground;
  line-height: 20px;
  outline: none;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: block;
  flex: 1;
  position: relative;
  // 使用 padding 来确保有足够的可点击区域
  padding-bottom: 0;

  // 使用伪元素确保即使内容很少时也有足够的高度
  &::after {
    content: '';
    display: block;
    height: 20px;
    width: 1px;
    pointer-events: none;
    visibility: hidden;
  }

  &:empty:before {
    content: attr(placeholder);
    color: $vscode-input-placeholderForeground;
    pointer-events: none;
  }

  // 移除 focus 时的默认 outline，但不添加任何其他样式
  // focus 效果由容器的 resource-input-container-focus 类控制
  &:focus {
    outline: none;
    // 确保 focus 时不会有任何背景色或其他样式变化
    background: $background-input;
  }
}

:deep(.resource-tag) {
  display: inline-flex;
  align-items: center;
  margin: 0 2px;
  vertical-align: middle;
  user-select: none;

  .resource-tag-content {
    display: inline-flex;
    align-items: center;
    background: $vscode-badge-background;
    color: $vscode-badge-foreground;
    border-radius: $border-radius-sm;
    padding: 2px 6px;
    font-size: $font-size-small;
    line-height: 18px;
    max-width: 200px;
  }

  .resource-tag-icon-container {
    position: relative;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-xs;
    flex-shrink: 0;
  }

  .resource-tag-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: $font-size-small;
    margin-right: 0;
  }

  .resource-tag-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }

  .resource-tag-close {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    color: $vscode-input-foreground;
    opacity: 0.7;
    transition: opacity $transition-fast, color $transition-fast;
    z-index: 1;

    &:hover {
      opacity: 1;
      color: $vscode-input-foreground;
    }
  }

  // hover 时显示关闭按钮，隐藏图标
  &:hover {
    .resource-tag-icon {
      display: none !important;
    }

    .resource-tag-close {
      display: flex !important;
    }
  }
}
</style>
