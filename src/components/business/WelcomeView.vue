<script setup lang="ts">
// WelcomeView 业务组件 - 欢迎界面
// 参考 light-code-html/src/views/chatPage/src/index.vue:11-53
</script>

<template>
  <div class="welcome-view">
    <div class="view-prefix">欢迎使用HiCode</div>
    <div class="view-center">
      <div class="tips-item">
        <span class="tip-arrow">→</span>
        <span>
          可在设置中自定义
          <span class="tip-important">prompt模板</span>
        </span>
      </div>
      <div class="tips-item">
        <span class="tip-arrow">→</span>
        <span>
          选中代码并点击
          <span class="tip-important">右键</span>
          ，可进行添加注释或代码翻译等操作
        </span>
      </div>
      <div class="tips-item">
        <span class="tip-arrow">→</span>
        <span>
          在对话栏中可直接向
          <span class="tip-important">HiCode</span>
          提问
        </span>
      </div>
      <div class="tips-item">
        <span class="tip-arrow">→</span>
        <span>
          右上角帮助可查看详细
          <span class="tip-important">使用帮助</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0 0;
}

.view-prefix {
  height: calc(14.8vh);
  font-weight: 600;
  font-size: 26px;
  color: $text-color;
}

.view-center {
  .tips-item {
    margin-bottom: 20px;
    font-weight: 400;
    font-size: 14px;
    color: $text-color;

    span {
      height: 20px;
      line-height: 20px;
    }

    .tip-arrow {
      margin-right: 5px;
      color: #40c821;
      font-weight: 600;
    }

    .tip-important {
      color: #40c821;
      font-weight: 500;
    }
  }
}
</style>
