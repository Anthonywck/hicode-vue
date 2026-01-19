<script setup lang="ts">
/**
 * AgentModeSelector 组件 - Agent 模式选择器组件（业务组件）
 * 职责：Agent 模式选择
 * - 显示当前选中模式
 * - 下拉列表展示所有模式
 * - 支持模式切换
 */
import { ref, computed, watch } from 'vue'
import { ElPopover } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

/**
 * Agent 模式数据类型定义
 */
interface AgentMode {
  /** 模式值 */
  value: 'chat' | 'agent'
  /** 模式显示名称 */
  displayName: string
}

/**
 * 组件 Props 定义
 */
interface Props {
  /** 当前选中的模式值 */
  currentMode: 'chat' | 'agent'
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
  /** 模式切换事件 */
  (e: 'mode-change', mode: 'chat' | 'agent'): void
  /** 打开弹出框事件（用于触发数据加载） */
  (e: 'open'): void
}

const props = withDefaults(defineProps<Props>(), {
  currentMode: 'chat',
  visible: false,
  containerId: '',
})

const emit = defineEmits<Emits>()

/** Agent 模式列表 */
const agentModes: AgentMode[] = [
  { value: 'chat', displayName: 'Chat' },
  { value: 'agent', displayName: 'Agent' },
]

/** 弹出框显示状态 */
const popoverVisible = ref(props.visible)

/**
 * 当前选中模式的显示名称
 */
const displayModeName = computed(() => {
  const foundMode = agentModes.find((item) => item.value === props.currentMode)
  return foundMode ? foundMode.displayName : 'Chat'
})

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
 * 处理模式切换
 */
const handleModeChange = (mode: 'chat' | 'agent'): void => {
  popoverVisible.value = false
  emit('update:visible', false)
  emit('mode-change', mode)
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
  <el-popover v-model:visible="popoverVisible" placement="top" trigger="click" width="220px" :show-arrow="false"
    popper-class="agent-mode-popover-class" @update:visible="(val) => emit('update:visible', val)">
    <template #reference>
      <div class="agent-mode-select" @click="handleSelectClick">
        <i class="iconfont icon-moxing"></i>
        <span class="select-tag">{{ displayModeName }}</span>
        <el-icon class="arrow-icon">
          <ArrowDown v-if="!popoverVisible" />
          <ArrowUp v-else />
        </el-icon>
      </div>
    </template>
    <div @mouseleave="handleMouseLeave">
      <div :id="containerId || 'agent-mode-selector'" class="agent-mode-tab-page">
        <div
          v-for="item in agentModes"
          :key="item.value"
          :class="item.value === currentMode
            ? 'agent-mode-option-item-active'
            : 'agent-mode-option-item'
          "
          @click="handleModeChange(item.value)"
        >
          <span class="agent-mode-title">{{ item.displayName }}</span>
          <i v-if="item.value === currentMode" class="iconfont icon-gou"></i>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.agent-mode-select {
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

  .select-tag {
    overflow: hidden;
    max-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
    flex-shrink: 1;
    min-width: 0;
  }

  .arrow-icon {
    margin-left: 4px;
    display: flex;
    align-items: center;
    font-size: $font-size-base;
    flex-shrink: 0;
  }
}

// 使用容器查询：当父容器宽度小于 200px 时隐藏 select-tag
@container input-toolbar (max-width: 200px) {
  .agent-mode-select {
    .select-tag {
      display: none;
    }

    .iconfont {
      margin-right: 0;
    }
  }
}

.agent-mode-tab-page {
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  height: 180px;

  .agent-mode-option-item {
    align-items: center;
    width: 100%;
    height: 30px;
    padding: 0 20px;
    background-color: $vscode-list-background;
    color: $vscode-list-activeSelectionForeground;
    font-weight: $font-weight-normal;
    font-size: $font-size-small;
    letter-spacing: 0;
    text-align: justify;
    cursor: pointer;
    transition: background-color $transition-fast, color $transition-fast;

    span {
      height: 30px;
      line-height: 30px;
    }

    .agent-mode-title {
      display: inline-flex;
      overflow: hidden;
      width: calc(100% - 20px) !important;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .agent-mode-option-item:hover {
    background-color: $background-menu !important;
    color: $foreground-menu !important;
  }

  .agent-mode-option-item-active {
    background-color: $background-menu-selection !important;
    color: $text-selected !important;
    align-items: center;
    width: 100%;
    height: 30px;
    padding: 0 20px;
    font-weight: $font-weight-normal;
    font-size: $font-size-small;
    letter-spacing: 0;
    text-align: justify;
    cursor: pointer;

    span {
      height: 30px;
      line-height: 30px;
    }

    .agent-mode-title {
      display: inline-flex;
      overflow: hidden;
      width: calc(100% - 20px) !important;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

<style lang="scss">
// 全局样式，用于弹出框
.agent-mode-popover-class {
  background-color: $background-menu !important;
  color: $foreground-menu !important;
  border: 1px solid $border-menu !important;
  overflow: auto;
  position: absolute;
  left: 5px !important;
  width: 220px !important;
  max-height: 198px !important;
  margin-bottom: 10px !important;
  margin-left: 15px !important;
  padding: 8px 0px !important;
  border-radius: 3px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.16);
}
</style>
