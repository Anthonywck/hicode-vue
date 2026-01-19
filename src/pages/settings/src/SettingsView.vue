<script setup lang="ts">
/**
 * SettingsView 组件 - 设置页面视图
 * 职责：实现设置页面的系统配置功能
 * - 使用 LoginForm、ModelConfig、FillModelConfig 业务组件
 * - 保持与 light-code-html 相同的样式和结构
 */

import { ref, onMounted } from 'vue'
import LoginForm from '@/components/business/LoginForm.vue'
import ModelConfig from '@/components/business/ModelConfig.vue'
import FillModelConfig from '@/components/business/FillModelConfig.vue'
import CodeCompletion from '@/components/business/CodeCompletion.vue'
import PromptTemplate from '@/components/business/PromptTemplate.vue'
import AdditionalSpecification from '@/components/business/AdditionalSpecification.vue'
import { useMessageHandler } from '@/composables/useMessageHandler'
import type { MessageEvent } from '@/composables/useMessageHandler'
import { HICODE_GET_SETTINGS_B2F_RES, HICODE_REFRESH_MODELS_B2F_RES } from '@/utils/messageType'
import { usePostMessage } from '@/composables/usePostMessage'
import { HICODE_GET_SETTINGS_F2B_REQ } from '@/utils/messageType'

// 模型数据接口定义
interface ModelData {
  id?: string
  modelId: string
  modelName: string
  displayName?: string
  maxContextTokens?: number
  maxOutputTokens?: number
  temperature?: number
  supportMultimodal?: boolean
  vendor: string
  modelDescription?: string
  apiKey?: string
  apiBaseUrl?: string
}

const loginFormRef = ref<InstanceType<typeof LoginForm>>()
const modelConfigRef = ref<InstanceType<typeof ModelConfig>>()
const fillModelConfigRef = ref<InstanceType<typeof FillModelConfig>>()
const codeCompletionRef = ref<InstanceType<typeof CodeCompletion>>()
const promptTemplateRef = ref<InstanceType<typeof PromptTemplate>>()
const additionalSpecificationRef = ref<InstanceType<typeof AdditionalSpecification>>()
const { postMessage } = usePostMessage()

// 在父组件中管理模型数据，供两个子组件共享
const modelList = ref<ModelData[]>([])

// Prompt 模板数据接口定义
interface PromptData {
  id?: string
  title: string
  prompt: string
  modelParams?: string
  model: string
  isSystemPrompt?: boolean
}

// 附加规范数据接口定义
interface SpecificationData {
  id?: string
  name: string
  regex: string
  content: string
  action: string
  state: boolean
}

// 处理设置数据初始化
const handleSettingsInit = (event: MessageEvent) => {
  const { message, data } = event.data

  if (message === HICODE_GET_SETTINGS_B2F_RES) {
    const settingsData = data as {
      userName?: string
      password?: string
      loginStatus?: boolean
      modelOptions?: ModelData[]
      fillModel?: string
      complete?: string
      prompts?: PromptData[]
      specifications?: SpecificationData[]
    }

    // 初始化登录状态
    loginFormRef.value?.initLoginState({
      userName: settingsData.userName || '',
      password: settingsData.password || '',
      loginStatus: settingsData.loginStatus || false,
    })

    // 初始化模型列表（在父组件中管理）
    modelList.value = JSON.parse(JSON.stringify(settingsData.modelOptions || []))

    // 初始化补全大模型配置（只传递当前选中的模型，选项从模型列表获取）
    if (fillModelConfigRef.value) {
      fillModelConfigRef.value.initFillModel({
        fillModel: settingsData.fillModel,
      })
    }

    // 初始化代码补全配置
    if (codeCompletionRef.value) {
      codeCompletionRef.value.initComplete({
        complete: settingsData.complete,
      })
    }

    // 初始化 Prompt 模板列表
    if (promptTemplateRef.value) {
      promptTemplateRef.value.initPrompts(settingsData.prompts as PromptData[])
    }

    // 初始化附加规范列表
    if (additionalSpecificationRef.value) {
      additionalSpecificationRef.value.initSpecifications(
        settingsData.specifications as SpecificationData[]
      )
    }
  } else if (message === HICODE_REFRESH_MODELS_B2F_RES) {
    // 当模型配置更新时，同步更新父组件的模型列表
    const refreshData = data as { type: string; models: ModelData[] }
    if (refreshData.models) {
      modelList.value = JSON.parse(JSON.stringify(refreshData.models))
    }
  }
}

// 注册消息监听
useMessageHandler(handleSettingsInit)

// 组件挂载时请求设置数据
onMounted(() => {
  postMessage(HICODE_GET_SETTINGS_F2B_REQ, {})
})
</script>

<template>
  <div ref="setPage" class="settings-background">
    <span class="setting-title">系统配置</span>
    <div class="setting-form" style="margin-top: 12px">
      <LoginForm ref="loginFormRef" />
    </div>
    <div class="setting-form">
      <ModelConfig ref="modelConfigRef" :models="modelList" @update:models="modelList = $event" />
    </div>
    <div class="setting-form">
      <FillModelConfig ref="fillModelConfigRef" :models="modelList" />
    </div>
    <div class="setting-title" style="margin: 28px 0 12px 0">常用设置</div>
    <div class="setting-form">
      <CodeCompletion ref="codeCompletionRef" />
    </div>
    <div class="setting-form">
      <PromptTemplate ref="promptTemplateRef" :models="modelList" />
    </div>
    <div class="setting-form">
      <AdditionalSpecification ref="additionalSpecificationRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.settings-background {
  height: unset;
  padding: 24px 20px 40px 20px;
  background-color: $vscode-editor-background;
}

.setting-title {
  display: flex;
  align-items: center;
  height: 37px;
  font-weight: 600;
  font-size: 26px;
  line-height: 37px;
}

.setting-form {
  padding: 12px 20px;

  &:hover {
    border: 0px !important;
    background-color: $vscode-sideBar-background !important;
    box-shadow: none !important;
  }
}
</style>
