<script setup lang="ts">
/**
 * PromptSelector 组件 - 模板选择器组件（业务组件）
 * 职责：模板选择入口
 * - 触发模板选择弹窗
 * - 管理模板选择器的显示状态
 */
import { ref, watch } from 'vue'
import { ElPopover } from 'element-plus'
import PromptTabs from '@/components/base/PromptTabs.vue'
import PromptList from '@/components/base/PromptList.vue'

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
  /** 系统模板列表 */
  systemPrompts: PromptItem[]
  /** 用户模板列表 */
  userPrompts: PromptItem[]
  /** 是否显示弹出框 */
  visible?: boolean
  /** 容器ID（用于刷新定位） */
  containerId?: string
}

/**
 * 组件 Emits 定义
 */
interface Emits {
  /** 更新显示状态事件 */
  (e: 'update:visible', visible: boolean): void
  /** 系统模板选择事件 */
  (e: 'system-prompt-select', promptId: string | number): void
  /** 用户模板选择事件 */
  (e: 'user-prompt-select', promptId: string | number): void
  /** 打开弹出框事件（用于触发数据加载） */
  (e: 'open'): void
}

const props = withDefaults(defineProps<Props>(), {
  systemPrompts: () => [],
  userPrompts: () => [],
  visible: false,
  containerId: '',
})

const emit = defineEmits<Emits>()

/** 弹出框显示状态 */
const popoverVisible = ref(props.visible)
/** 当前激活的标签页 */
const activeTab = ref('system')

/**
 * 处理选择器点击
 */
const handleSelectClick = (): void => {
  popoverVisible.value = !popoverVisible.value
  emit('update:visible', popoverVisible.value)
  if (popoverVisible.value) {
    emit('open')
  }
}

/**
 * 处理标签页切换
 */
const handleTabChange = (value: string): void => {
  activeTab.value = value
}

/**
 * 处理系统模板点击
 */
const handleSystemPromptClick = (promptId: string | number): void => {
  popoverVisible.value = false
  emit('update:visible', false)
  emit('system-prompt-select', promptId)
}

/**
 * 处理用户模板点击
 */
const handleUserPromptClick = (promptId: string | number): void => {
  popoverVisible.value = false
  emit('update:visible', false)
  emit('user-prompt-select', promptId)
}

/**
 * 处理鼠标离开弹出框
 */
const handleMouseLeave = (): void => {
  popoverVisible.value = false
  emit('update:visible', false)
}

// 监听外部 visible 变化
watch(
  () => props.visible,
  (newVal) => {
    popoverVisible.value = newVal
  }
)
</script>

<template>
  <el-popover v-model:visible="popoverVisible" placement="top" trigger="click" :width="'calc(100% - 40px)'"
    :show-arrow="false" popper-class="prompt-popover-class" @update:visible="(val) => emit('update:visible', val)">
    <template #reference>
      <div class="model-select" @click="handleSelectClick">
        <i class="iconfont icon-moban"></i>
        <span>选择模板</span>
      </div>
    </template>
    <div @mouseleave="handleMouseLeave">
      <PromptTabs v-model="activeTab" @tab-change="handleTabChange" />
      <PromptList v-if="activeTab === 'system'" :id="`sys_${containerId || 'prompt'}`" :prompts="systemPrompts"
        type="system" :show-shortcut="true" :container-id="`sys_${containerId || 'prompt'}`"
        @prompt-click="handleSystemPromptClick" />
      <PromptList v-if="activeTab === 'custom'" :id="`user_${containerId || 'prompt'}`" :prompts="userPrompts"
        type="custom" :show-shortcut="false" :container-id="`user_${containerId || 'prompt'}`"
        @prompt-click="handleUserPromptClick" />
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.model-select {
  display: flex;
  align-items: center;
  max-width: 126px;
  min-width: fit-content;
  height: 18px;
  color: $vscode-input-foreground;
  font-weight: $font-weight-normal;
  font-size: $font-size-base;
  letter-spacing: 0;
  cursor: pointer;
  flex-shrink: 1;

  .iconfont {
    margin-right: 4px;
    font-size: $font-size-base;
    line-height: 1;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  span {
    line-height: 1;
    flex-shrink: 1;
    min-width: 0;
  }
}

// 使用容器查询：当父容器宽度小于 200px 时隐藏文本
@container input-toolbar (max-width: 200px) {
  .model-select {
    span {
      display: none;
    }

    .iconfont {
      margin-right: 0;
    }
  }
}
</style>

<style lang="scss">
// 全局样式，用于弹出框
.prompt-popover-class {
  background-color: $background-menu !important;
  color: $foreground-menu !important;
  border: 1px solid $border-menu !important;
  overflow: auto;
  position: absolute;
  left: 20px !important;
  width: calc(100% - 40px) !important;
  max-height: 198px !important;
  margin-bottom: 10px !important;
  // margin-left: 15px !important;
  padding: 8px 0px !important;
  border-radius: 3px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.16);
}
</style>
