<script setup lang="ts">
/**
 * InputToolbar 组件 - 输入工具栏组件（业务组件，容器组件）
 * 职责：工具栏布局和组合
 * - 组合 Agent 模式选择器、模型选择器和模板选择器
 * - 包含发送按钮
 * - 管理整体布局
 */
import AgentModeSelector from './AgentModeSelector.vue'
import ModelSelector from './ModelSelector.vue'
import PromptSelector from './PromptSelector.vue'

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
 * 组件 Props 定义
 */
interface Props {
  /** 当前选中的 Agent 模式 */
  currentAgentMode?: 'chat' | 'agent'
  /** 模型列表 */
  models: ChatModel[]
  /** 当前选中的模型名称 */
  currentModel: string
  /** 系统模板列表 */
  systemPrompts: PromptItem[]
  /** 用户模板列表 */
  userPrompts: PromptItem[]
  /** Agent 模式选择器显示状态 */
  agentModePopoverVisible?: boolean
  /** 模型选择器显示状态 */
  modelPopoverVisible?: boolean
  /** 模板选择器显示状态 */
  promptPopoverVisible?: boolean
  /** 容器ID（用于刷新定位） */
  optionId?: string | number
  /** 模型选择器容器ID */
  modelOptionId?: string | number
  /** Agent 模式选择器容器ID */
  agentModeOptionId?: string | number
}

/**
 * 组件 Emits 定义
 */
interface Emits {
  /** Agent 模式切换事件 */
  (e: 'agent-mode-change', mode: 'chat' | 'agent'): void
  /** 模型切换事件 */
  (e: 'model-change', model: ChatModel): void
  /** 系统模板选择事件 */
  (e: 'system-prompt-select', promptId: string | number): void
  /** 用户模板选择事件 */
  (e: 'user-prompt-select', promptId: string | number): void
  /** 发送消息事件 */
  (e: 'send'): void
  /** 更新 Agent 模式选择器显示状态 */
  (e: 'update:agentModePopoverVisible', visible: boolean): void
  /** 更新模型选择器显示状态 */
  (e: 'update:modelPopoverVisible', visible: boolean): void
  /** 更新模板选择器显示状态 */
  (e: 'update:promptPopoverVisible', visible: boolean): void
  /** Agent 模式选择器打开事件（用于触发数据加载） */
  (e: 'agent-mode-selector-open'): void
  /** 模型选择器打开事件（用于触发数据加载） */
  (e: 'model-selector-open'): void
  /** 模板选择器打开事件（用于触发数据加载） */
  (e: 'prompt-selector-open'): void
}

const props = withDefaults(defineProps<Props>(), {
  currentAgentMode: 'chat',
  models: () => [],
  currentModel: '',
  systemPrompts: () => [],
  userPrompts: () => [],
  agentModePopoverVisible: false,
  modelPopoverVisible: false,
  promptPopoverVisible: false,
  optionId: 0,
  modelOptionId: 0,
  agentModeOptionId: 0,
})

const emit = defineEmits<Emits>()

/**
 * 处理 Agent 模式切换
 */
const handleAgentModeChange = (mode: 'chat' | 'agent'): void => {
  emit('agent-mode-change', mode)
}

/**
 * 处理模型切换
 */
const handleModelChange = (model: ChatModel): void => {
  emit('model-change', model)
}

/**
 * 处理系统模板选择
 */
const handleSystemPromptSelect = (promptId: string | number): void => {
  emit('system-prompt-select', promptId)
}

/**
 * 处理用户模板选择
 */
const handleUserPromptSelect = (promptId: string | number): void => {
  emit('user-prompt-select', promptId)
}

/**
 * 处理发送消息
 */
const handleSend = (): void => {
  emit('send')
}

/**
 * 处理 Agent 模式选择器打开
 */
const handleAgentModeSelectorOpen = (): void => {
  emit('agent-mode-selector-open')
}

/**
 * 处理模型选择器打开
 */
const handleModelSelectorOpen = (): void => {
  emit('model-selector-open')
}

/**
 * 处理模板选择器打开
 */
const handlePromptSelectorOpen = (): void => {
  emit('prompt-selector-open')
}

/**
 * 处理 Agent 模式选择器显示状态更新
 */
const handleAgentModePopoverVisibleUpdate = (visible: boolean): void => {
  emit('update:agentModePopoverVisible', visible)
}

/**
 * 处理模型选择器显示状态更新
 */
const handleModelPopoverVisibleUpdate = (visible: boolean): void => {
  emit('update:modelPopoverVisible', visible)
}

/**
 * 处理模板选择器显示状态更新
 */
const handlePromptPopoverVisibleUpdate = (visible: boolean): void => {
  emit('update:promptPopoverVisible', visible)
}
</script>

<template>
  <div class="input-tool">
    <AgentModeSelector :current-mode="currentAgentMode" :visible="agentModePopoverVisible"
      :container-id="`agent_mode_${agentModeOptionId}`" @update:visible="handleAgentModePopoverVisibleUpdate"
      @mode-change="handleAgentModeChange" @open="handleAgentModeSelectorOpen" />
    <ModelSelector :models="models" :current-model="currentModel" :visible="modelPopoverVisible"
      :container-id="`model_${modelOptionId}`" @update:visible="handleModelPopoverVisibleUpdate"
      @model-change="handleModelChange" @open="handleModelSelectorOpen" />
    <PromptSelector :system-prompts="systemPrompts" :user-prompts="userPrompts" :visible="promptPopoverVisible"
      :container-id="String(optionId)" @update:visible="handlePromptPopoverVisibleUpdate"
      @system-prompt-select="handleSystemPromptSelect" @user-prompt-select="handleUserPromptSelect"
      @open="handlePromptSelectorOpen" />
    <i class="iconfont icon-fasong send-button" @click="handleSend"></i>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.input-tool {
  display: flex;
  align-items: center;
  container-type: inline-size;
  container-name: input-toolbar;
  gap: 10px;
}

.send-button {
  margin-left: auto;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  color: $vscode-foreground;
  transition: color 0.2s ease;

  &:hover {
    color: $vscode-textLink-foreground;
  }
}
</style>
