<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  await new Promise((r) => setTimeout(r, 300))

  const ok = authStore.login(form.username, form.password)
  loading.value = false

  if (ok) {
    ElMessage.success('登录成功')
  } else {
    ElMessage.error('用户名或密码错误')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrap">
          <el-icon :size="32"><Camera /></el-icon>
        </div>
        <h1>Photo Accounting</h1>
        <p>Photography studio bookkeeping platform</p>
      </div>

      <el-form class="login-form" @submit.prevent="handleLogin">
        <div class="form-field">
          <label>用户名</label>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </div>
        <div class="form-field">
          <label>密码</label>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </div>
        <el-button
          class="login-btn btn-primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>

      <div class="login-hint">
        <span>演示账号：admin / 123456</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  padding: 40px 36px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo-wrap {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: rgba($color-brown-light, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-brown;
  }

  h1 {
    font-size: 22px;
    font-weight: 600;
    color: $color-text;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  p {
    font-size: 13px;
    color: $color-text-secondary;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    color: $color-text-secondary;
  }
}

.login-btn {
  width: 100%;
  margin-top: 4px;
  height: 44px;
  font-size: 15px;
  letter-spacing: 4px;
}

.login-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: $color-text-secondary;
  padding-top: 20px;
  border-top: 1px solid $color-border;
}
</style>
