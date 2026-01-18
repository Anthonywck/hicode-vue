/**
 * useMessageHandler - 消息处理 Composable
 * 用于处理前端与后端（VS Code Extension）之间的消息通信
 */
import { onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * 消息数据类型定义
 */
export interface MessageData {
  message: string
  data?: unknown
  token?: string
  error?: string
  [key: string]: unknown
}

/**
 * 消息事件类型定义
 */
export interface MessageEvent {
  data: MessageData
}

/**
 * 消息处理器函数类型
 */
export type MessageHandler = (event: MessageEvent) => void | Promise<void>

/**
 * 消息处理配置
 */
export interface UseMessageHandlerOptions {
  /** 是否在控制台输出日志 */
  enableLog?: boolean
}

/**
 * 消息处理 Composable
 * 
 * @param handler 消息处理函数
 * @param options 配置选项
 * @returns 清理函数
 */
export function useMessageHandler(
  handler: MessageHandler,
  options: UseMessageHandlerOptions = {}
): () => void {
  const { enableLog = false } = options

  /**
   * 内部消息处理函数
   */
  const messageHandler = async (event: MessageEvent): Promise<void> => {
    if (enableLog) {
      console.log('收到消息:', event.data)
    }

    try {
      await handler(event)
    } catch (error) {
      console.error('消息处理失败:', error)
    }
  }

  // 组件挂载时注册消息监听
  onMounted(() => {
    window.addEventListener('message', messageHandler as EventListener)
  })

  // 组件卸载时移除消息监听
  onBeforeUnmount(() => {
    window.removeEventListener('message', messageHandler as EventListener)
  })

  // 返回清理函数
  return () => {
    window.removeEventListener('message', messageHandler as EventListener)
  }
}

