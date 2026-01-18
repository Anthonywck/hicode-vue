<script setup lang="ts">
/**
 * StopButton 组件 - 停止回答按钮组件（业务组件）
 * 职责：停止当前AI回答
 * - 显示停止按钮（仅在回答状态时显示）
 * - 处理停止回答事件
 */
import { ElButton } from 'element-plus'

/**
 * 组件 Props 定义
 */
interface Props {
  /** 是否正在回答中（控制按钮显示） */
  visible?: boolean
  /** 是否禁用按钮 */
  disabled?: boolean
}

/**
 * 组件 Emits 定义
 */
interface Emits {
  /** 停止回答事件 */
  (e: 'stop'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

/**
 * 处理停止按钮点击
 */
const handleStop = (): void => {
  if (!props.disabled) {
    emit('stop')
  }
}
</script>

<template>
  <el-button
    v-if="visible"
    class="stop-btn"
    plain
    :disabled="disabled"
    @click="handleStop"
  >
    <template #icon>
      <i class="iconfont icon-zhongzhi"></i>
    </template>
    停止回答
  </el-button>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.stop-btn {
  width: 97px;
  margin-top: 10px;
  margin-bottom: 0;
  margin-left: 50%;
  border: 1px solid $vscode-input-background;
  background-color: $vscode-input-background;
  color: #3794ff;
  transform: translateX(-50%);
  transition: color $transition-fast;

  &:hover:not(:disabled) {
    color: #f14c4c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .iconfont {
    margin-right: 4px;
  }
}
</style>

