<script setup lang="ts">
// Chat 页面入口组件
import ChatView from './src/ChatView.vue'
</script>

<template>
  <ChatView />
</template>
<style lang="scss">
@use '@/assets/styles/variables.scss';
body {
  border-right: 1px solid $border-color;
  padding: 0;
}
html {
  scrollbar-color: unset !important;
}
::-webkit-scrollbar-corner {
    background-color: unset !important;
}
*::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}
</style>

