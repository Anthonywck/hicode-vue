<script setup lang="ts">
/**
 * Settings 页面入口组件
 * 职责：提供可滚动的容器，确保设置页面内容可以正常滚动
 */
import SettingsView from './src/SettingsView.vue'
</script>

<template>
  <div class="settings-app">
    <SettingsView />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.settings-app {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: $vscode-editor-background;
}
body {
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

