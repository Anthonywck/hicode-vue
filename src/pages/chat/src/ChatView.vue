<script setup lang="ts">
/**
 * ChatView 组件 - 聊天页面视图组件
 * 根据登录状态和聊天列表决定显示哪个视图
 */
import { computed, ref } from 'vue'
import UnauthorizedView from '@/components/business/UnauthorizedView.vue'
import ChatPage from './ChatPage.vue'

// 模拟登录状态，后续可以从 store 或 composable 中获取
const isAuthenticated = ref(true) // 默认已登录，实际应该从 store 获取

// 根据登录状态决定显示哪个视图
const showUnauthorized = computed(() => !isAuthenticated.value)
</script>

<template>
  <div class="chat-page">
    <!-- 未登录状态显示未认证界面 -->
    <UnauthorizedView v-if="showUnauthorized" />

    <!-- 已登录状态显示聊天页面 -->
    <ChatPage v-else />
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $background-color;
}
</style>

