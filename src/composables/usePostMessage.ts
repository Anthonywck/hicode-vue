/**
 * usePostMessage - 消息发送 Composable
 * 用于向前端发送消息到后端（VS Code Extension）
 */
import { ref } from 'vue'

/**
 * 检测运行环境：VS Code
 */
const isVsCode = typeof acquireVsCodeApi === 'function'

/**
 * 检测运行环境：IntelliJ IDEA
 */
const isIntelliJ =
  typeof window.__IntelliJTools !== 'undefined' &&
  typeof window.__IntelliJTools.postMessage === 'function'

/**
 * 获取宿主环境的全局对象
 */
function getGlobal() {
  if (typeof getGlobal.__cached !== 'undefined') {
    return getGlobal.__cached
  }

  let global: {
    postMessage?: (message: unknown, targetOrigin?: string) => void
  }

  // VS Code 环境
  if (isVsCode) {
    global = acquireVsCodeApi()
  }
  // IntelliJ IDEA 环境
  else if (isIntelliJ) {
    global = window.__IntelliJTools
  }
  // 其他环境（如浏览器调试）
  else if (window) {
    global = window
  } else {
    throw new Error('不支持的环境：无法获取宿主 API')
  }

  // 缓存结果
  getGlobal.__cached = global
  return global
}

/**
 * 生成唯一 ID
 */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 消息发送 Composable
 * 
 * @returns 消息发送函数
 */
export function usePostMessage() {
  const global = getGlobal()

  /**
   * 向后端发送消息（不等待响应）
   * 
   * @param messageType 消息类型
   * @param data 消息数据
   */
  const postMessage = (messageType: string, data: unknown = null): void => {
    try {
      global.postMessage?.(
        {
          token: uuid(),
          message: messageType,
          command: messageType, // 兼容旧格式
          data,
        },
        '*'
      )
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  return {
    postMessage,
  }
}

