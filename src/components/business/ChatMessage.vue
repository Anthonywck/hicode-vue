<script setup lang="ts">
/**
 * ChatMessage 组件 - 聊天消息展示组件
 * 用于展示用户问题和AI回答，支持代码块操作（插入、比较、复制）等功能
 */
import { ref, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { ElMessage, ElAvatar, ElIcon, ElDivider } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import type { Marked } from 'marked'
import { HICODE_INSERT_CODE_F2B_REQ } from '@/utils/messageType'

/**
 * 聊天消息数据类型定义
 */
interface ChatMessageData {
  chatId: string | number
  display_question?: string
  display_answer?: string
  model_name?: string
  status?: 'loading' | 'finished' | 'break'
}

/**
 * 聊天模型类型定义
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
 * 组件 Props 定义
 */
interface Props {
  /** 聊天消息数据 */
  data: ChatMessageData
  /** 当前使用的模型 */
  currModel?: string
  /** 可用的聊天模型列表 */
  chatModels?: ChatModel[]
  /** 聊天状态，是否正在回答中 */
  chatStatus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currModel: '机器人',
  chatModels: () => [],
  chatStatus: false,
})

/**
 * 组件实例，用于访问全局属性
 */
const instance = getCurrentInstance()

/**
 * 响应式数据
 */
const questionHtml = ref<string>('')
const modelName = ref<string>('机器人')
const currCopyContent = ref<string>('')
// 存储每个 code 块的展开/收起状态，key 为 code 元素的唯一标识
const codeExpandStates = ref<Map<string, boolean>>(new Map())

/**
 * DOM 元素引用
 */
let questionDiv: HTMLElement | null = null
let answerDiv: HTMLElement | null = null

/**
 * 获取 postMessage 方法
 * 用于与 VSCode 插件通信
 */
const getPostMessage = () => {
  if (instance?.appContext.config.globalProperties.$postMessage) {
    return instance.appContext.config.globalProperties.$postMessage
  }
  // 如果没有全局方法，返回一个默认的 console.log 函数
  return (...args: unknown[]) => {
    console.log('postMessage:', ...args)
  }
}

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
 * 处理复制事件
 * 当用户复制内容时，将复制的内容发送给插件
 */
const handleCopy = async () => {
  console.log('handleCopy...')
  try {
    // 读取剪贴板内容
    const copyText = await navigator.clipboard.readText()
    
    // 如果两次复制内容相同，防止重复提交
    if (currCopyContent.value === copyText) {
      return
    }
    
    // 发送消息给插件
    const postMessage = getPostMessage()
    postMessage('selectAnswer', {
      content: copyText,
      chatId: props.data.chatId,
    })
    
    // 更新当前复制内容
    currCopyContent.value = copyText
  } catch (error) {
    console.error('复制失败:', error)
  }
}

/**
 * 获取模型显示名称
 * 根据消息中的模型名称或当前模型，从模型列表中查找对应的显示名称
 */
const getModelName = () => {
  if (props.data.model_name) {
    const model = props.chatModels.find((item) => item.modelName === props.data.model_name)
    modelName.value = model?.displayName || '机器人'
  } else {
    const model = props.chatModels.find((item) => item.modelName === props.currModel)
    modelName.value = model?.displayName || '机器人'
  }
}

/**
 * 处理回答复制事件
 * 复制AI回答的内容
 */
const handleAnswerCopy = () => {
  if (props.data.display_answer) {
    navigator.clipboard.writeText(props.data.display_answer)
    const postMessage = getPostMessage()
    postMessage('copyAnswer', {
      content: props.data.display_answer,
      chatId: props.data.chatId,
    })
  }
}

/**
 * 处理重新回答事件
 * 请求AI重新回答当前问题
 */
const handleReanswer = () => {
  // 如果正在回答中，提示用户等待
  if (props.chatStatus) {
    ElMessage.warning('正在回答中，请稍等')
    return
  }
  
  // 发送重新回答请求
  if (props.data.chatId) {
    const postMessage = getPostMessage()
    postMessage('reanswer', {
      question: props.data.display_question,
      chatId: props.data.chatId,
    })
  }
}

/**
 * 切换代码块的展开/收起状态
 */
const toggleCodeExpand = (codeId: string): void => {
  const currentState = codeExpandStates.value.get(codeId) || false
  codeExpandStates.value.set(codeId, !currentState)
  
  // 更新 DOM 中的 code 元素样式
  const codeElement = document.getElementById(codeId)
  if (codeElement) {
    if (!currentState) {
      // 展开：移除高度限制
      codeElement.style.maxHeight = 'none'
      codeElement.style.overflowY = 'visible'
    } else {
      // 收起：恢复高度限制
      codeElement.style.maxHeight = '220px'
      codeElement.style.overflowY = 'auto'
    }
  }
  
  // 更新按钮图标
  const toggleBtn = document.getElementById(`toggle-btn-${codeId}`)
  if (toggleBtn) {
    const iconElement = toggleBtn.querySelector('.toggle-icon')
    if (iconElement) {
      // 展开状态显示向上箭头（收起），收起状态显示向下箭头（展开）
      iconElement.innerHTML = !currentState 
        ? '<i class="iconfont icon-shangjiantou"></i>'
        : '<i class="iconfont icon-xiajiantou"></i>'
    }
  }
}

/**
 * 解析消息内容为 HTML
 * 使用 marked 将 markdown 格式的消息内容转换为 HTML
 * 
 * @param value - 要解析的消息内容
 * @param type - 消息类型：'question' | 'answer' | 'finished'
 */
const parserMessageHTML = async (value: string, type: 'question' | 'answer' | 'finished') => {
  if (!value) return
  
  try {
    // 使用 marked 解析 markdown 内容
    const html = await getMarked().parse(value)
    questionHtml.value = html
    
    // 根据类型获取对应的 DOM 元素
    let codeDiv: HTMLElement | null = null
    const answerId = `ans_${props.data.chatId}`
    const questionId = `que_${props.data.chatId}`
    
    if (type === 'question') {
      codeDiv = document.getElementById(questionId)
    } else {
      codeDiv = document.getElementById(answerId)
    }
    
    if (!codeDiv) {
      console.warn(`未找到元素: ${type === 'question' ? questionId : answerId}`)
      return
    }
    
    // 设置 HTML 内容
    codeDiv.innerHTML = html
    
    // 如果是完成状态或问题类型，为代码块添加操作按钮
    if (type === 'finished' || type === 'question') {
      const preBlocks = codeDiv.querySelectorAll('pre')
      
      preBlocks.forEach((preBlock, index) => {
        // 检查是否已经添加过操作按钮，避免重复添加
        if (preBlock.querySelector('.code-option')) {
          return
        }
        
        const codeElement = preBlock.querySelector('code.hljs') as HTMLElement
        if (!codeElement) {
          return
        }
        
        // 为每个 code 元素生成唯一 ID
        const codeId = `code-${props.data.chatId}-${type}-${index}`
        codeElement.id = codeId
        
        // 初始化展开状态为 false（收起状态）
        if (!codeExpandStates.value.has(codeId)) {
          codeExpandStates.value.set(codeId, false)
        }
        
        // 检查 code 块的实际高度，如果超过 220px 才显示展开/收起按钮
        const codeHeight = codeElement.scrollHeight
        const shouldShowToggle = codeHeight > 220
        
        // 设置默认样式：限制高度 220px，overflow-y: auto
        if (shouldShowToggle && !codeExpandStates.value.get(codeId)) {
          codeElement.style.maxHeight = '220px'
          codeElement.style.overflowY = 'auto'
        }
        
        // 添加展开/收起按钮（在 code 标签下，pre 标签内）
        if (shouldShowToggle) {
          // 为 code 元素添加类名，表示它有展开/收起按钮
          codeElement.classList.add('has-toggle-btn')
          
          const toggleButton = document.createElement('div')
          toggleButton.id = `toggle-btn-${codeId}`
          toggleButton.className = 'code-toggle-btn'
          // 初始状态为收起，显示向下箭头（表示可以展开）
          toggleButton.innerHTML = `
            <div class="toggle-icon">
              <i class="iconfont icon-xiajiantou"></i>
            </div>
          `
          toggleButton.addEventListener('click', () => {
            toggleCodeExpand(codeId)
          })
          // 将按钮插入到 code 元素之后
          codeElement.insertAdjacentElement('afterend', toggleButton)
        }
        
        // 添加代码操作按钮
        preBlock.insertAdjacentHTML(
          'beforeend',
          `<div class="code-option">
            <span id="i-btn-${codeId}" class="code-btn">
              <i class="iconfont icon-charu"></i>
              <span style="height: 19px; line-height: 19px;">插入</span>
            </span>
            <span id="compare-btn-${codeId}" class="code-btn" style="margin-left: 20px;">
              <i class="iconfont icon-bijiao"></i>
              <span style="height: 19px; line-height: 19px;">比较</span>
            </span>
            <span id="c-btn-${codeId}" class="code-btn" style="margin-left: 20px;">
              <i class="iconfont icon-fuzhi"></i>
              <span style="height: 19px; line-height: 19px;">复制</span>
            </span>
          </div>`
        )
        
        // 获取操作按钮元素
        const copyBtn = preBlock.querySelector(`#c-btn-${codeId}`) as HTMLElement
        const insertBtn = preBlock.querySelector(`#i-btn-${codeId}`) as HTMLElement
        const compareBtn = preBlock.querySelector(`#compare-btn-${codeId}`) as HTMLElement
        
        // 复制按钮点击事件
        copyBtn?.addEventListener('click', () => {
          const code = codeElement.innerText
          console.log('copy code:', code)
          navigator.clipboard.writeText(code)
          const postMessage = getPostMessage()
          postMessage('copyAnswer', {
            content: code,
            chatId: props.data.chatId,
          })
        })
        
        // 比较按钮点击事件
        compareBtn?.addEventListener('click', () => {
          const code = codeElement.innerText
          console.log('compare code:', code)
          const postMessage = getPostMessage()
          postMessage('compareAnswer', {
            content: code,
            chatId: props.data.chatId,
          })
        })
        
        // 插入按钮点击事件
        insertBtn?.addEventListener('click', () => {
          const code = codeElement.innerText
          console.log('insert code:', code)
          const postMessage = getPostMessage()
          postMessage(HICODE_INSERT_CODE_F2B_REQ, {
            content: code,
            chatId: props.data.chatId,
          })
        })
      })
    }
  } catch (error) {
    console.error('解析消息 HTML 失败:', error)
  }
}

/**
 * 监听问题内容变化
 * 当问题内容更新时，解析并显示
 */
watch(
  () => props.data.display_question,
  async (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      await parserMessageHTML(newValue, 'question')
      getModelName()
    }
  },
  { immediate: true, deep: true }
)

/**
 * 监听回答内容变化
 * 当回答内容更新时，解析并显示
 */
watch(
  () => props.data.display_answer,
  async (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      // 如果状态是加载中，添加加载动画标识
      let displayValue = newValue
      if (props.data.status === 'loading') {
        displayValue = newValue + ' ▂'
      }
      await parserMessageHTML(displayValue, 'answer')
    }
  },
  { immediate: true, deep: true }
)

/**
 * 监听状态变化
 * 当状态变为完成时，重新解析回答内容并添加代码操作按钮
 */
watch(
  () => props.data.status,
  async (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      if (newValue !== 'loading' && props.data.display_answer) {
        await parserMessageHTML(props.data.display_answer, 'finished')
      }
    }
  },
  { immediate: true, deep: true }
)

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 获取 DOM 元素引用
  questionDiv = document.getElementById(`q-content`)
  answerDiv = document.getElementById(`a-content`)
  
  // 添加复制事件监听
  questionDiv?.addEventListener('copy', handleCopy)
  answerDiv?.addEventListener('copy', handleCopy)
})

/**
 * 组件卸载前的清理
 */
onBeforeUnmount(() => {
  // 移除事件监听
  questionDiv?.removeEventListener('copy', handleCopy)
  answerDiv?.removeEventListener('copy', handleCopy)
})
</script>

<template>
  <div class="message-background" style="height: auto !important">
    <!-- 用户消息区域 -->
    <div class="user-chat">
      <div class="chat-header">
        <el-avatar size="small" class="user-avatar">
          <template #default>
            <i class="iconfont icon-yonghu" style="width: 24px; height: 24px;"></i>
          </template>
        </el-avatar>
        <span>You</span>
      </div>
      <div id="q-content" class="q-content" @copy="handleCopy">
        <span :id="'que_' + data.chatId" class="message-wrapper"></span>
      </div>
    </div>

    <!-- AI 回答区域 -->
    <div class="robot-chat">
      <div class="chat-header">
        <el-avatar class="robot-avatar" size="small">
          <template #default>
            <i class="iconfont icon-hicode-logo" style="width: 24px; height: 24px; color: #ffffff;"></i>
          </template>
        </el-avatar>
        <span>{{ modelName || '大模型' }}</span>
      </div>
      <div id="a-content" class="a-content" @copy="handleCopy">
        <!-- 加载中状态 -->
        <el-icon v-if="!data.display_answer && data.status === 'loading'" class="is-loading">
          <Loading class="loading-class" />
        </el-icon>
        
        <!-- 用户取消状态 -->
        <div v-else-if="!data.display_answer && data.status === 'break'" class="user-cancel">
          用户取消了请求。
        </div>
        
        <!-- 回答内容 -->
        <span :id="'ans_' + data.chatId" class="message-wrapper"></span>
        
        <!-- 回答底部操作栏 -->
        <div
          class="a-footer"
          :style="data.status !== 'loading' ? 'display: flex;' : 'display: none;'"
        >
          <div class="footer-option">
            <span style="display: flex; height: 20px; line-height: 20px">
              <!-- 复制按钮 -->
              <el-icon class="option-icon" @click="handleAnswerCopy">
                <i class="iconfont icon-fuzhi" />
              </el-icon>
              <el-divider
                style="height: 14px; margin: 3px 8px; border-left: 1px solid #ccc"
                direction="vertical"
              />
              <!-- 重新回答按钮 -->
              <el-icon class="option-icon" @click="handleReanswer">
                <i class="iconfont icon-zhongxin" />
              </el-icon>
              <span class="option-btn" @click="handleReanswer">重新回答</span>
            </span>
          </div>
          <!-- 停止生成标识 -->
          <div v-if="data.status === 'break' && data.display_answer" class="stop-flag">
            回答停止生成
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.message-background {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: $vscode-editor-background;
}
// 隐藏 iconfont 的默认 before 伪元素
.icon-lightcode::before {
  display: none;
}

// 注意：icon-yonghu 需要显示，所以不隐藏 before 伪元素
// .icon-yonghu::before {
//   display: none;
// }

// 用户消息区域样式
.user-chat {
  padding: 10px 15px;
}

.q-content {
  width: 100%;

  code {
    width: 100%;
  }
}

// AI 回答区域样式
.robot-chat {
  padding: 10px 15px;
  background-color: $vscode-input-background;
}

// 聊天头部样式
.chat-header {
  display: flex;
  align-items: center;

  // 用户头像样式
  .user-avatar {
    --el-avatar-bg-color: #{$vscode-input-background};
    background-color: $vscode-input-background !important;
    color: $vscode-foreground !important;
    
    :deep(.iconfont) {
      color: $vscode-foreground !important;
      font-size: 24px !important;
      line-height: 1 !important;
      display: inline-block !important;
    }
    
    // 确保 icon-yonghu 的 before 伪元素显示（覆盖全局的 display: none）
    :deep(.icon-yonghu) {
      &::before {
        display: inline-block !important;
        color: $vscode-foreground !important;
      }
    }
  }

  // AI 机器人头像样式
  .robot-avatar {
    --el-avatar-bg-color: #3794ff;
    background-color: #3794ff !important;
    color: #ffffff !important;
    
    :deep(.iconfont) {
      color: #ffffff !important;
    }
  }
  span {
    height: 24px;
    margin-right: 10px;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: $text-color;
  }
}

// 加载动画样式
.is-loading {
  margin-top: 22px;
  color: #316bf2;
  font-size: 24px;
}

// 用户取消提示样式
.user-cancel {
  margin-top: 20px;
  color: #f14c4c;
  font-weight: 400;
  font-size: 14px;
}

// 回答底部操作栏样式
.a-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;

  .footer-option {
    display: flex;
    vertical-align: middle;
    height: 20px;
    line-height: 20px;

    .option-icon {
      vertical-align: middle;
      height: 20px;
      color: #ccc;
      font-weight: 400;
      line-height: 20px;
      cursor: pointer;

      .iconfont {
        display: block !important;
        height: 16px;
        line-height: 16px;
      }
    }

    .option-btn {
      vertical-align: middle;
      height: 20px;
      margin-left: 5px;
      color: #ccc;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
    }
  }

  .stop-flag {
    color: #606060;
    font-weight: 400;
    font-size: 14px;
  }
}
</style>
<style lang="scss">
// 消息内容包装器样式
.message-wrapper {
  table,
  th,
  td {
    border: 1px solid #d9d9d9;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 8px;
  }

  pre {
    width: 100%;

    p {
      white-space: normal;
    }
  }

  pre code {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    border-bottom-right-radius: var(--common-radius, $border-radius-md);
    border-bottom-left-radius: var(--common-radius, $border-radius-md);
    white-space: unset !important;
    word-wrap: break-word !important;
  }

  // hljs 代码高亮样式
  .hljs {
    // overflow-y: auto;
    overflow: hidden;
    width: 100%;
    max-height: 220px;
    border: 1px solid $vscode-panel-border;
    border-radius: 3px;
    background-color: $background-editor;
    white-space: unset !important;
    box-sizing: border-box;
    &:hover {
      overflow: auto;
    }
    &:not(:hover) {
      overflow: hidden;
    }
  }

  pre code.hljs {
    display: block;
    // overflow-y: auto;
    overflow: hidden;
    padding: 1em;
    width: 100%;
    max-height: 220px;
    background-color: $background-editor;
    white-space: unset !important;
    box-sizing: border-box;
    &:hover {
      overflow: auto;
    }
    &:not(:hover) {
      overflow: hidden;
    }
  }
  
  // 当有展开/收起按钮时，code 的底部圆角移除
  code.hljs.has-toggle-btn {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
  }

  code {
    white-space: unset !important;
    word-wrap: break-word !important;
  }

  ol {
    display: flex;
    flex-direction: column;
    list-style-type: decimal;

    li {
      margin: 0;
      list-style-position: inside;
      line-height: 2;
      white-space: normal; // 不加这个会导致序号和内容换行了

      p {
        display: inline;
        white-space: pre-wrap;
      }
    }
  }
}
// 代码操作选项样式
.code-option {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100px;
  margin-right: auto;
  margin-left: 0;
  padding: 5px 10px;
}
// 展开/收起按钮样式
.code-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 16px !important;
    margin-top: 0;
    cursor: pointer;
    background-color: $background-editor !important;
    border: 1px solid $vscode-panel-border;
    border-top: none;
    border-radius: 0 0 3px 3px;
    box-sizing: border-box;
    
    .toggle-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: $vscode-foreground;
      transition: color 0.2s ease;
      
      .iconfont {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        line-height: 1;
      }
    }
    
    &:hover {
      .toggle-icon {
        color: $text-selected;
      }
    }
  }

.code-btn {
  display: flex;
  align-items: center;
  vertical-align: middle;
  color: #3794ff;
  font-weight: 400;
  font-size: 14px;
  cursor: pointer;

  .iconfont {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    height: 19px;
    font-size: 19px;
    line-height: 19px;
    margin-right: 4px;
  }

  > span {
    display: flex;
    align-items: center;
    height: 19px;
    line-height: 19px;
  }
}
</style>

