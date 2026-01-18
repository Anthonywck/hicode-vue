<script setup lang="ts">
// UnauthorizedView 业务组件 - 未登录/未认证界面
// 参考 light-code-html/src/components/unauthorized/index.vue
import { ElResult } from 'element-plus'
</script>

<template>
  <div class="unauthorized-view">
    <div class="view-prefix"></div>
    <el-result class="not-login" title="欢迎使用HiCode" sub-title="开发者辅助AI工具">
      <template #icon>
        <div class="icon-placeholder">
          <i class="iconfont icon-hicode-logo"></i>
        </div>
      </template>
    </el-result>
    <div class="view-center"></div>
    <div class="login-tips">
      <span>未认证</span>
      <br />
      <span>请在右上角"设置"进行域账号密码认证</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.unauthorized-view {
  width: 100%;
  height: calc(100% - 20px);
  padding: 10px 20px 20px 20px;
  display: flex;
  flex-direction: column;
}

.view-prefix {
  height: calc(13.5vh);
}

.view-center {
  height: calc(15vh);
}

.not-login {
  text-align: center;

  .icon-placeholder {
    display: block;
    width: 50px;
    height: 50px;
    margin: 0 auto;
    color: $primary-color;
    font-size: 50px;
    line-height: 50px;
    text-align: center;

    .iconfont {
      font-size: 50px;
    }
  }

  :deep(.el-result__title) {
    font-weight: 600;
    font-size: 18px;
    font-family: $font-family;

    p {
      margin: 20px 0 8px 0;
      color: $text-color !important;
    }
  }

  :deep(.el-result__subtitle) {
    color: $text-color;
    font-weight: 400;
    font-size: 12px;
    font-family: $font-family;
    opacity: 0.7;

    p {
      margin: 8px 0;
    }
  }
}

.login-tips {
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  color: $text-color;
  margin-top: $spacing-lg;
}
</style>

