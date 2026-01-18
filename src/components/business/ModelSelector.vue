<script setup lang="ts">
/**
 * ModelSelector 组件 - 模型选择器组件（业务组件）
 * 职责：模型选择
 * - 显示当前选中模型
 * - 下拉列表展示所有模型
 * - 支持模型切换
 * - 显示模型描述（tooltip）
 */
import { ref, computed, watch } from 'vue'
import { ElPopover, ElTooltip } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

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
 * 组件 Props 定义
 */
interface Props {
  /** 模型列表 */
  models: ChatModel[]
  /** 当前选中的模型名称 */
  currentModel: string
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
  /** 模型切换事件 */
  (e: 'model-change', model: ChatModel): void
  /** 打开弹出框事件（用于触发数据加载） */
  (e: 'open'): void
}

const props = withDefaults(defineProps<Props>(), {
  models: () => [],
  currentModel: '',
  visible: false,
  containerId: '',
})

const emit = defineEmits<Emits>()

/** 弹出框显示状态 */
const popoverVisible = ref(props.visible)

/**
 * 当前选中模型的显示名称
 */
const displayModelName = computed(() => {
  if (!props.currentModel) return ''
  const foundModel = props.models.find((item) => item.modelName === props.currentModel)
  return foundModel ? foundModel.displayName || foundModel.modelName : ''
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
 * 处理模型切换
 */
const handleModelChange = (model: ChatModel): void => {
  popoverVisible.value = false
  emit('update:visible', false)
  emit('model-change', model)
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
  <el-popover
    v-model:visible="popoverVisible"
    placement="top"
    trigger="click"
    width="220px"
    :show-arrow="false"
    popper-class="model-popover-class"
    @update:visible="(val) => emit('update:visible', val)"
  >
    <template #reference>
      <div class="model-select" @click="handleSelectClick">
        <i class="iconfont icon-moxing"></i>
        <span class="select-tag">{{ displayModelName || '选择模型' }}</span>
        <el-icon class="arrow-icon">
          <ArrowDown v-if="!popoverVisible" />
          <ArrowUp v-else />
        </el-icon>
      </div>
    </template>
    <div @mouseleave="handleMouseLeave">
      <div :id="containerId || 'model-selector'" class="model-tab-page">
        <el-tooltip
          v-for="item in models"
          :key="item.id || item.modelName"
          class="box-item"
          effect="light"
          :disabled="!item.modelDescription"
          placement="right"
          popper-class="model-popper"
        >
          <template #content>
            <span style="display: inline-block; word-wrap: break-word">
              {{ item.modelDescription }}
            </span>
          </template>
          <div
            :class="
              item.modelName === currentModel
                ? 'model-option-item-active'
                : 'model-option-item'
            "
            @click="handleModelChange(item)"
          >
            <span class="model-title">{{ item.displayName || item.modelName }}</span>
            <i v-if="item.modelName === currentModel" class="iconfont icon-gou"></i>
          </div>
        </el-tooltip>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.model-select {
  display: flex;
  align-items: center;
  width: 126px;
  height: 18px;
  color: $vscode-input-foreground;
  font-weight: $font-weight-normal;
  font-size: $font-size-base;
  letter-spacing: 0;
  cursor: pointer;

  .iconfont {
    margin-right: 4px;
    font-size: $font-size-base;
    line-height: 1;
    display: flex;
    align-items: center;
  }

  .select-tag {
    overflow: hidden;
    max-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
  }

  .arrow-icon {
    margin-left: 4px;
    display: flex;
    align-items: center;
    font-size: $font-size-base;
  }
}

.model-tab-page {
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  height: 180px;

  .model-option-item {
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

    .model-title {
      display: inline-flex;
      overflow: hidden;
      width: calc(100% - 20px) !important;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .model-option-item:hover {
    background-color: $background-menu !important;
    color: $foreground-menu !important;
  }

  .model-option-item-active {
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

    .model-title {
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
.model-popover-class {
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

.model-popper {
  max-width: calc(100% - 280px) !important;
  padding: 4px 6px;
  color: #606060;
}
</style>

