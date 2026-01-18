<script setup lang="ts">
/**
 * LoginForm 组件 - 登录业务组件
 * 职责：实现域账号登录认证功能
 * - 使用基础组件 HicodeInput
 * - 保持与 light-code-html 相同的样式和交互效果
 * - 使用新的消息类型定义
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import HicodeInput from '@/components/base/HicodeInput.vue'
import { usePostMessage } from '@/composables/usePostMessage'
import { useMessageHandler } from '@/composables/useMessageHandler'
import { HICODE_LOGIN_F2B_REQ, HICODE_LOGIN_B2F_RES } from '@/utils/messageType'
import type { MessageEvent } from '@/composables/useMessageHandler'

// 登录状态：-1 未登录，0 正在登录，1 已登录
const loginFlag = ref<-1 | 0 | 1>(-1)
const loginStatus = ref(false)
const userName = ref('')
const password = ref('')

const { postMessage } = usePostMessage()

// 处理登录响应
const handleLoginResponse = (event: MessageEvent) => {
  const { message, data } = event.data
  
  if (message === HICODE_LOGIN_B2F_RES) {
    const loginData = data as { status: boolean; message?: string }
    
    if (loginData.status) {
      loginStatus.value = true
      loginFlag.value = 1
      
      ElMessage({
        message: '认证成功',
        type: 'success',
      })
    } else {
      loginStatus.value = false
      loginFlag.value = -1
      
      ElMessage({
        message: loginData.message || '认证失败',
        type: 'error',
      })
    }
  }
}

// 注册消息监听
useMessageHandler(handleLoginResponse)

// 初始化登录状态（从设置数据中获取）
const initLoginState = (data?: { userName?: string; password?: string; loginStatus?: boolean }) => {
  if (data) {
    userName.value = data.userName || ''
    password.value = data.password || ''
    loginStatus.value = data.loginStatus || false
    
    if (loginStatus.value) {
      loginFlag.value = 1 // 已登录
    } else {
      loginFlag.value = -1 // 未登录
    }
  }
}

// 暴露初始化方法供父组件调用
defineExpose({
  initLoginState,
})

// 开始登录（显示输入框）
const startLogin = () => {
  loginFlag.value = 0
}

// 取消登录
const cancelLogin = () => {
  if (loginStatus.value) {
    loginFlag.value = 1
  } else {
    loginFlag.value = -1
  }
}

// 执行登录
const handleLogin = () => {
  if (userName.value && password.value) {
    postMessage(HICODE_LOGIN_F2B_REQ, {
      userName: userName.value,
      password: password.value,
    })
  } else {
    ElMessage({
      message: '用户名或密码不能为空',
      type: 'warning',
    })
  }
}

// 重新认证
const reLogin = () => {
  loginFlag.value = 0
}
</script>

<template>
  <div class="login-form">
    <span class="form-title">域账号</span>
    <br />
    <span v-if="loginFlag !== 1" class="form-subtitle">
      使用域账号密码认证，认证后才能正常使用。
    </span>
    <span v-else class="form-subtitle">已认证，可以正常使用。</span>
    
    <!-- 未登录状态：显示认证按钮 -->
    <div v-if="loginFlag === -1" class="login-option">
      <el-button type="primary" size="small" @click="startLogin">认证</el-button>
    </div>
    
    <!-- 正在登录状态：显示输入框 -->
    <div v-else-if="loginFlag === 0" class="login-option">
      <HicodeInput
        v-model="userName"
        class="user-info"
        placeholder="域账号"
        size="small"
      />
      <HicodeInput
        v-model="password"
        class="user-info"
        type="password"
        placeholder="密码"
        show-password
        size="small"
        style="margin-left: 9px"
      />
      <el-button type="primary" size="small" style="margin-left: 10px" @click="handleLogin">
        认证
      </el-button>
      <el-button size="small" style="margin-left: 6px" @click="cancelLogin">
        取消
      </el-button>
    </div>
    
    <!-- 已登录状态：显示已认证信息 -->
    <div v-if="loginFlag === 1" class="login-option" style="display: block !important">
      <div style="display: flex">
        <HicodeInput
          v-model="userName"
          class="user-info"
          placeholder="域账号"
          size="small"
          disabled
        />
        <HicodeInput
          v-model="password"
          class="user-info"
          type="password"
          placeholder="密码"
          show-password
          size="small"
          style="margin-left: 9px"
          disabled
        />
        <el-icon style="height: 24px; margin-left: 10px; color: #40c8ae">
          <Check />
        </el-icon>
        <br />
      </div>
      <el-button type="primary" size="small" style="margin-top: 10px" @click="reLogin">
        重新认证
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.login-form {
  .form-title {
    font-weight: 400;
    font-size: 14px;
  }

  .form-subtitle {
    color: #a0a0a0;
    font-weight: 400;
    font-size: 14px;
  }

  .login-option {
    display: flex;
    margin: 10px 0 0 0;
    
    .user-info {
      width: 175px !important;
      border: none;
      
      :deep(.el-input__wrapper) {
        border: 0;
        box-shadow: none;
      }
    }
  }
}
</style>

