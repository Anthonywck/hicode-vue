<script setup lang="ts">
/**
 * ChatPage 组件 - 聊天页面主组件
 * 功能：
 * 1. 聊天消息展示和管理
 * 2. 用户输入和资源标签管理
 * 3. 模型和模板选择
 * 4. 消息发送和接收（流式处理）
 * 5. 代码选择展示
 * 6. 停止回答功能
 */
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import ChatMessage from '@/components/business/ChatMessage.vue'
import WelcomeView from '@/components/business/WelcomeView.vue'
import ResourceInput from '@/components/business/ResourceInput.vue'
import InputToolbar from '@/components/business/InputToolbar.vue'
import StopButton from '@/components/business/StopButton.vue'
import CodeSelect from '@/components/business/CodeSelect.vue'
import { useMessageHandler, type MessageEvent } from '@/composables/useMessageHandler'
import { usePostMessage } from '@/composables/usePostMessage'
import * as OP from '@/utils/messageType'
// import { testChatData } from '../../../../test-chat-data'

/**
 * 聊天消息数据类型定义
 */
interface ChatMessageData {
  /** 聊天ID */
  chatId: string
  /** 显示的问题 */
  display_question?: string
  /** 显示的答案 */
  display_answer?: string
  /** 模型名称 */
  model_name?: string
  /** 状态：loading-加载中, finished-完成, break-中断 */
  status?: 'loading' | 'finished' | 'break'
}

/**
 * 聊天模型数据类型定义
 */
interface ChatModel {
  /** 模型ID */
  id?: string | number
  /** 模型名称（唯一标识） */
  modelName: string
  /** 模型显示名称 */
  displayName?: string
  /** 模型描述 */
  modelDescription?: string
  /** 其他可选属性 */
  [key: string]: unknown
}

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
 * 资源数据类型定义
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
 * 代码选择数据类型定义
 */
interface SelectionData {
  /** 选中的代码 */
  selectCode?: string
  /** 代码语言 */
  language?: string
  /** 代码语言ID */
  languageId?: string
  /** 文件路径 */
  filePath?: string
  /** 起始行号 */
  startLine?: number
  /** 结束行号 */
  endLine?: number
}

// 常量定义
const DONE_FLAG = '[DONE]'

// 使用 composables
const { postMessage } = usePostMessage()

// 响应式数据
const chatList = ref<ChatMessageData[]>([])
const question = ref('')
const historyQuestion = ref('')
const resources = ref<Resource[]>([])
const selectedCode = ref('')
const selectedLanguage = ref('')
const isShowCodeSelect = ref(false)
const answerStatus = ref(false)
const currChat = ref<ChatMessageData | null>(null)
const currModel = ref('')
const chatModels = ref<ChatModel[]>([])
const modelName = ref('')
const sysPrompts = ref<PromptItem[]>([])
const userPrompts = ref<PromptItem[]>([])
const modelPopoverVisible = ref(false)
const popoverVisible = ref(false)
const optionId = ref(0)
const modelOptionId = ref(0)
const containerClass = ref('chat-container-blur')
const codeSelectClass = ref('code-select-blur')
const isFocused = ref(false)
const editStart = ref(0)

// DOM 引用
const chatBox = ref<HTMLElement | null>(null)
const chatOptions = ref<HTMLElement | null>(null)
const questionInput = ref<InstanceType<typeof ResourceInput> | null>(null)

/**
 * 规范化文件路径（统一路径格式，便于比较）
 */
const normalizePath = (path: string): string => {
  if (!path) return ''
  return path.replace(/\\/g, '/').toLowerCase()
}

/**
 * 生成唯一ID
 */
const guid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 格式化代码为 Markdown
 */
const getMarkedCode = (code: string, language: string): string => {
  return '```' + language + '\n' + code + '\n```'
}

/**
 * 计算容器样式
 */
const containerStyle = computed(() => {
  if (containerClass.value === 'chat-container-focus' && isShowCodeSelect.value) {
    return `
      border-top: 0 solid var(--vscode-input-background) !important;
      border-right: 1px solid var(--vscode-textLink-foreground) !important;
      border-bottom: 1px solid var(--vscode-textLink-foreground) !important;
      border-left: 1px solid var(--vscode-textLink-foreground) !important;
      border-radius: 0 0 3px 3px !important;
    `
  } else if (containerClass.value === 'chat-container-blur' && isShowCodeSelect.value) {
    return `
      border-top: 0 solid var(--vscode-input-background) !important;
      border-right: 1px solid var(--vscode-input-background) !important;
      border-bottom: 1px solid var(--vscode-input-background) !important;
      border-left: 1px solid var(--vscode-input-background) !important;
      border-radius: 0 0 3px 3px !important;
    `
  }
  return ''
})

/**
/**
 * 计算当前选中模型的显示名称
 * (FIX: 若未被使用，则移除该变量)
 */
// 已被标记为未使用，如果未来需要使用该变量，可将下行取消注释。
// const displayModelName = computed(() => {
//   if (!modelName.value) return ''
//   const foundModel = chatModels.value.find((item) => item.modelName === modelName.value)
//   return foundModel ? foundModel.displayName || foundModel.modelName : ''
// })

/**
 * 获取聊天框样式（计算高度）
 * 由于输入框现在在外部，使用 flex 布局自动计算高度
 */
const getChatBoxStyle = (): void => {
  // 使用 flex 布局时，chat-box 会自动占据剩余空间
  // 这里保留函数以保持兼容性，但不再需要手动计算高度
  // 如果需要精确控制，可以在这里添加其他逻辑
}

/**
 * 平滑滚动到底部
 */
const startScroll = (): void => {
  if (!chatBox.value) return

  const start = chatBox.value.scrollTop
  const end = chatBox.value.scrollHeight
  const duration = 500
  const startTime = performance.now()

  const smoothScroll = (currentTime: number): void => {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    const easeInOutCubic =
      progress < 0.5
        ? 4 * progress * progress * progress
        : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1

    if (chatBox.value) {
      chatBox.value.scrollTop = start + (end - start) * easeInOutCubic
    }

    if (progress < 1) {
      requestAnimationFrame(smoothScroll)
    }
  }

  requestAnimationFrame(smoothScroll)
}

/**
 * 处理消息接收
 */
const onMessage = async (event: MessageEvent): Promise<void> => {
  const { message, data } = event.data

  // 记录日志（排除控制台日志消息本身）
  if (message !== OP.HICODE_CONSOLE_LOG) {
    postMessage(OP.HICODE_CONSOLE_LOG, { data: event.data })
  }

  console.log('收到消息:', message, data)

  // 处理不同类型的消息
  if (message === OP.HICODE_OPEN_HISTORY) {
    // 打开历史记录（暂不实现）
    console.log('打开历史记录')
  } else if (message === 'getPrompts') {
    // 获取模板列表
    sysPrompts.value = (data as { sysPrompts: PromptItem[] }).sysPrompts || []
    userPrompts.value = (data as { userPrompts: PromptItem[] }).userPrompts || []
    optionId.value++
  } else if (message === OP.HICODE_SELECTION_CHANGE) {
    // 处理代码选择变化
    await handleSelectionChange(data as SelectionData)
  } else if (message === OP.HICODE_ASK_QUESTION_B2F_RES) {
    // 处理问答响应
    parserReceiveMessage(data as { chatId: string; text?: string; answer?: string })
  } else if (message === OP.HICODE_NEW_CONVERSATION) {
    // 处理新会话
    chatList.value = []
    handleStopChat()
  } else if (message === 'sysPrompt') {
    // 处理系统模板响应
    handleChatReply(data as { question: string; chatId: string })
  } else if (message === 'userPrompt') {
    // 处理用户模板响应
    handleChatReply(data as { question: string; chatId: string })
  } else if (message === 'chatWithStream') {
    // 处理流式聊天（由后端处理，这里不需要实现）
    console.log('流式聊天消息:', data)
  } else if (message === OP.HICODE_GET_MODELS_B2F_RES) {
    // 处理模型列表响应
    const { currModel: currentModel, modelOptions } = data as {
      currModel: string
      modelOptions: ChatModel[]
    }
    currModel.value = currentModel
    chatModels.value = modelOptions || []
    if (chatModels.value.length > 0) {
      const foundModel = chatModels.value.find((item) => item.modelName === currentModel)
      modelName.value = foundModel ? foundModel.modelName : ''
    } else {
      modelName.value = ''
    }
    modelOptionId.value++
  } else if (message === OP.HICODE_ERROR_B2F) {
    // 处理错误消息
    handleError(data as { operationType?: string; error?: string; errorStack?: string })
  } else if (message === 'getLastVersion') {
    // 版本更新检查（暂不实现）
    console.log('版本更新检查:', data)
  } else if (message === 'showMessage') {
    // 显示消息提示
    const { type, message: msg } = data as { type: string; message: string }
    ElMessage({
      type: type as 'success' | 'warning' | 'info' | 'error',
      message: msg,
    })
  } else if (message === 'getHisChatById') {
    // 处理历史聊天记录
    handleHisChats(data as ChatMessageData[])
  }
}

/**
 * 处理代码选择变化
 */
const handleSelectionChange = async (data: SelectionData): Promise<void> => {
  if (data.selectCode) {
    isShowCodeSelect.value = true
    selectedCode.value = data.selectCode
    selectedLanguage.value = data.languageId || data.language || ''

    const filePath = data.filePath || ''

    // 检查是否已存在相同文件的资源
    const existingIndex = resources.value.findIndex(
      (r) =>
        r.type === 'code' &&
        normalizePath(r.filePath || '') === normalizePath(filePath) &&
        filePath !== ''
    )

    if (existingIndex !== -1) {
      // 更新现有资源
      const existingResource = resources.value[existingIndex]
      if (existingResource) {
        existingResource.code = data.selectCode
        // 优先使用 languageId，再次使用 language
        existingResource.language = data.languageId || data.language || ''
        existingResource.languageId = data.languageId || data.language || ''
        existingResource.startLine = data.startLine
        existingResource.endLine = data.endLine
      }
    } else {
      // 创建新资源
      const resourceId = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const resource: Resource = {
        id: resourceId,
        type: 'code',
        code: data.selectCode,
        language: selectedLanguage.value,
        languageId: data.languageId || data.language || '',
        filePath: filePath,
        startLine: data.startLine,
        endLine: data.endLine,
      }
      resources.value.push(resource)
    }

    // 代码预览由 CodeSelect 组件自动渲染
    await nextTick()
    getChatBoxStyle()
  } else {
    // 清除选择
    selectedCode.value = ''
    selectedLanguage.value = ''
    isShowCodeSelect.value = false
    resources.value = resources.value.filter((r) => r.type !== 'code')
    await nextTick()
    getChatBoxStyle()
  }
}

/**
 * 处理问答响应消息
 */
const parserReceiveMessage = (data: { chatId: string; text?: string; answer?: string }): void => {
  const { chatId, text, answer } = data
  // 优先使用 text 字段，兼容 answer 字段
  const responseText = text || answer || ''
  const currMessage = chatList.value.find((item) => item.chatId === chatId)

  if (currMessage) {
    if (currMessage.status === 'loading') {
      if (responseText !== DONE_FLAG) {
        // 追加回答内容
        currMessage.display_answer = (currMessage.display_answer || '') + responseText
      } else {
        // 回答完成
        if (chatBox.value) {
          startScroll()
        }
        answerStatus.value = false
        getChatBoxStyle()
        if (currMessage.status === 'loading') {
          currMessage.status = 'finished'
        }
        postMessage('finishedChat', {})
      }
    }
  }
}

/**
 * 处理聊天回复
 */
const handleChatReply = (data: { question: string; chatId: string }): void => {
  const { question: questionText, chatId } = data
  addChatMessage(chatId, questionText)
  clearSelected()
}

/**
 * 处理历史聊天记录
 */
const handleHisChats = (data: ChatMessageData[]): void => {
  if (!data) {
    chatList.value = []
    return
  }

  // 处理历史对话的 historyQuestion
  if (data.length > 0 && data[data.length - 1]) {
    historyQuestion.value = data[data.length - 1]?.display_question || ''
  }

  // 处理历史对话展示
  for (const item of data) {
    item.status = 'finished'
    answerStatus.value = false
  }
  chatList.value = data

  setTimeout(() => {
    if (chatBox.value) {
      startScroll()
    }
  }, 500)
}

/**
 * 处理错误消息
 */
const handleError = (data: {
  operationType?: string
  error?: string
  errorStack?: string
}): void => {
  const operationType = data.operationType || '操作'
  const errorMessage = data.error || '未知错误'

  ElMessage({
    type: 'error',
    message: `${operationType}失败：${errorMessage}`,
    duration: 5000,
  })

  console.error(`[${operationType}] 操作失败`, {
    operationType,
    error: errorMessage,
    errorStack: data.errorStack,
    timestamp: new Date().toISOString(),
  })
}

/**
 * 添加聊天消息
 */
const addChatMessage = (chatId: string, question: string): void => {
  const chatIds = chatList.value.map((chat) => chat.chatId)
  if (chatIds.includes(chatId)) {
    return
  }

  const chatMessage: ChatMessageData = {
    chatId,
    display_question: question || historyQuestion.value,
    display_answer: '',
    status: 'loading',
  }

  answerStatus.value = true
  currChat.value = chatMessage
  chatList.value.push(chatMessage)

  nextTick(() => {
    startScroll()
  })
}

/**
 * 处理停止聊天
 */
const handleStopChat = (): void => {
  answerStatus.value = false
  getChatBoxStyle()
  if (currChat.value) {
    currChat.value.status = 'break'
  }
}

/**
 * 清除选中的代码
 */
const clearSelected = (): void => {
  selectedCode.value = ''
  selectedLanguage.value = ''
  resources.value = resources.value.filter((r) => r.type !== 'code')
  isShowCodeSelect.value = false
  postMessage(OP.HICODE_CLEAR_SELECTION, {})
  nextTick(() => {
    getChatBoxStyle()
  })
}

/**
 * 处理资源移除
 */
const handleResourceRemoved = (resourceId: string): void => {
  const resource = resources.value.find((r) => r.id === resourceId)
  if (resource && resource.type === 'code') {
    // 如果是代码资源被移除，同时清除选中代码的显示
    selectedCode.value = ''
    selectedLanguage.value = ''
    isShowCodeSelect.value = false
    postMessage(OP.HICODE_CLEAR_SELECTION, {})
    nextTick(() => {
      getChatBoxStyle()
    })
  }
  // 从资源列表中移除
  resources.value = resources.value.filter((r) => r.id !== resourceId)
}

/**
 * 处理 Enter 键
 */
const handleEnterKey = (): void => {
  if (answerStatus.value) {
    ElMessage({
      type: 'error',
      message: '请等待回答结束后再发送',
    })
    return
  }

  if (questionInput.value) {
    questionInput.value.blur()
  }
  historyQuestion.value = question.value
  sendMessage()
  question.value = ''
}

/**
 * 处理 Ctrl/Cmd + Enter 键
 */
const handleCtrlEnterKey = (): void => {
  // 换行功能已由 ResourceInput 组件内部处理
}

/**
 * 处理上箭头键
 */
const handleArrowUpKey = (e: KeyboardEvent): void => {
  if (historyQuestion.value.trim() === '') {
    return
  }

  if (e.keyCode === 38) {
    if (question.value.trim() === '') {
      question.value = historyQuestion.value
      nextTick(() => {
        if (questionInput.value) {
          questionInput.value.focus()
          const textLength = question.value.length
          if (questionInput.value.setCursorPosition) {
            questionInput.value.setCursorPosition(textLength)
          }
        }
      })
    }
  }
}

/**
 * 发送消息
 */
const sendMessage = (): void => {
  if (answerStatus.value) {
    ElMessage({
      type: 'error',
      message: '请等待回答结束后再发送',
    })
    return
  }

  // 检查输入是否为空
  if (question.value.trim() === '' && resources.value.length === 0) {
    ElMessage({
      type: 'warning',
      message: '用户问题不可以为空',
    })
    return
  }

  // 构建包含资源的问题内容
  let questionText = question.value
  const codeResources = resources.value.filter((r) => r.type === 'code')
  if (codeResources.length > 0) {
    const codeBlocks = codeResources.map((resource) => {
      return getMarkedCode(
        resource.code || '',
        resource.language || resource.languageId || ''
      )
    })
    questionText = questionText
      ? `${questionText}\n${codeBlocks.join('\n')}\n`
      : codeBlocks.join('\n\n')
  }

  historyQuestion.value = questionText

  const editEnd = new Date().getTime()
  const editTime = editStart.value === 0 ? 0 : (editEnd - editStart.value) / 1000
  const chatId = guid()

  postMessage('sendMessage', {
    message: historyQuestion.value,
    editTime: editTime,
    chatId: chatId,
  })

  answerStatus.value = true
  getChatBoxStyle()
  addChatMessage(chatId, historyQuestion.value)

  nextTick(() => {
    question.value = ''
    resources.value = []
    clearSelected()
    if (chatBox.value) {
      startScroll()
    }
  })
}

/**
 * 处理模型切换
 */
const handleModelChange = (model: ChatModel): void => {
  modelPopoverVisible.value = false
  modelName.value = model.modelName
  currModel.value = model.modelName
  postMessage(OP.HICODE_CHANGE_MODEL_F2B_REQ, {
    modelName: model.modelName,
  })
}

/**
 * 处理系统模板选择
 */
const handleSysPromptClick = (promptId: string | number): void => {
  popoverVisible.value = false

  if (answerStatus.value) {
    ElMessage({
      type: 'error',
      message: '请等待回答结束后再发送',
    })
    return
  }

  let selectCode = ''
  if (question.value) {
    selectCode = question.value
  } else {
    selectCode = selectedCode.value
  }

  if (selectCode) {
    postMessage('sysPrompt', {
      code: selectCode,
      promptId: promptId,
      editTime: editStart.value === 0 ? 0 : (new Date().getTime() - editStart.value) / 1000,
    })
  } else {
    console.log('未选择代码')
  }
}

/**
 * 处理用户模板选择
 */
const handleUserPromptClick = (promptId: string | number): void => {
  popoverVisible.value = false

  if (answerStatus.value) {
    ElMessage({
      type: 'error',
      message: '请等待回答结束后再发送',
    })
    return
  }

  let selectCode = ''
  if (question.value) {
    selectCode = question.value
  } else {
    selectCode = selectedCode.value
  }

  if (selectCode) {
    postMessage('userPrompt', {
      code: selectCode,
      promptId: promptId,
      editTime: editStart.value === 0 ? 0 : (new Date().getTime() - editStart.value) / 1000,
    })
  } else {
    console.log('未选择代码')
  }
}

/**
 * 处理模型选择器打开
 */
const handleModelSelectorOpen = (): void => {
  postMessage(OP.HICODE_GET_MODELS_F2B_REQ, {})
}

/**
 * 处理模板选择器打开
 */
const handlePromptSelectorOpen = (): void => {
  postMessage('getPrompts', {})
}

/**
 * 处理输入框聚焦
 */
const handleFocus = (): void => {
  containerClass.value = 'chat-container-focus'
  codeSelectClass.value = 'code-select-focus'
  isFocused.value = true
}

/**
 * 处理输入框失焦
 */
const handleBlur = (): void => {
  containerClass.value = 'chat-container-blur'
  codeSelectClass.value = 'code-select-blur'
  isFocused.value = false
}

/**
 * 处理输入事件
 */
const handleInput = (): void => {
  if (question.value && question.value.trim().length > 0) {
    if (editStart.value === 0) {
      editStart.value = new Date().getTime()
    }
  } else {
    editStart.value = 0
  }
}

// 监听窗口大小变化
const handleResize = (): void => {
  getChatBoxStyle()
}

// 使用消息处理器
useMessageHandler(onMessage)

// 组件挂载
onMounted(() => {
  // 临时使用测试数据
  // chatList.value = testChatData as ChatMessageData[]
  window.addEventListener('resize', handleResize)
  nextTick(() => {
    getChatBoxStyle()
    postMessage(OP.HICODE_GET_MODELS_F2B_REQ, {})
  })
})

// 组件卸载
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="view-background">
    <div class="view-content">
      <!-- 欢迎界面（无聊天记录时显示） -->
      <WelcomeView v-if="chatList.length <= 0" class="welcome-view" />

      <!-- 聊天消息列表 -->
      <div v-else ref="chatBox" class="chat-box">
        <ChatMessage v-for="(chat, index) in chatList" :key="`${chat.chatId}_${index}`" :data="chat"
          :curr-model="currModel" :chat-models="chatModels" :chat-status="answerStatus"
          :style="answerStatus ? 'margin-bottom: 10px;' : ''" />

        <!-- 停止回答按钮 -->
        <StopButton :visible="answerStatus" @stop="handleStopChat" />
      </div>

      <!-- 输入区域（移到 chat-box 外部，固定在底部） -->
      <div ref="chatOptions" class="chat-options">
        <!-- 代码选择展示 -->
        <CodeSelect :code="selectedCode" :language="selectedLanguage" :visible="isShowCodeSelect" :focused="isFocused"
          @clear="clearSelected" />

        <!-- 输入容器 -->
        <div :class="containerClass" :style="containerStyle">
          <div class="input-div">
            <ResourceInput ref="questionInput" v-model="question" :placeholder="'输入问题，ctrl/⌘↵换行，↵发送，↑展示上一次编辑内容'"
              :resources="resources" @focus="handleFocus" @blur="handleBlur" @input="handleInput"
              @enter="handleEnterKey" @ctrl-enter="handleCtrlEnterKey" @arrow-up="handleArrowUpKey"
              @resource-removed="handleResourceRemoved" />
          </div>

          <!-- 输入工具栏 -->
          <InputToolbar :models="chatModels" :current-model="currModel" :system-prompts="sysPrompts"
            :user-prompts="userPrompts" :model-popover-visible="modelPopoverVisible"
            :prompt-popover-visible="popoverVisible" :option-id="optionId" :model-option-id="modelOptionId"
            @model-change="handleModelChange" @system-prompt-select="handleSysPromptClick"
            @user-prompt-select="handleUserPromptClick" @send="sendMessage"
            @update:modelPopoverVisible="modelPopoverVisible = $event"
            @update:promptPopoverVisible="popoverVisible = $event" @model-selector-open="handleModelSelectorOpen"
            @prompt-selector-open="handlePromptSelectorOpen" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.view-background {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: $background-color;
}

.view-content {
  padding: 0 10px;
  max-height: calc(100vh - 127px);
  overflow-x: hidden;
  overflow-y: auto;
}

.welcome-view {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.chat-box {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  flex: 1;
}

.chat-options {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  // flex-shrink: 0;
  width: 100%;
  // min-height: 127px;
  padding: 10px;
  background-color: $vscode-editor-background;
  border-top: 1px solid $vscode-panel-border;
}

.input-div {
  width: 100%;
}

.chat-container-blur,
.chat-container-focus {
  max-height: 296px !important;
  border-radius: 4px;
  background: $vscode-input-background;
  padding: 5px 11px;
}

.chat-container-blur {
  border-top: 1px solid $vscode-input-background;
  border-right: 1px solid $vscode-input-background;
  border-bottom: 1px solid $vscode-input-background;
  border-left: 1px solid $vscode-input-background;
}

.chat-container-focus {
  border-top: 1px solid $vscode-textLink-foreground;
  border-right: 1px solid $vscode-textLink-foreground;
  border-bottom: 1px solid $vscode-textLink-foreground;
  border-left: 1px solid $vscode-textLink-foreground;
  border-radius: 3px;
}
</style>
