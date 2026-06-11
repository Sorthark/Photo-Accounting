<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { getErrorMessage } from '../utils/error'

const emit = defineEmits<{ success: [] }>()

const authStore = useAuthStore()
const loading = ref(false)
const mode = ref<'login' | 'register'>('login')

const form = reactive({
  username: '',
  password: '',
  studioName: 'Photo Studio',
})

async function handleSubmit() {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (mode.value === 'register' && form.password.length < 6) {
    ElMessage.warning('密码至少 6 位')
    return
  }

  loading.value = true
  try {
    if (mode.value === 'login') {
      await authStore.login(form.username, form.password)
      ElMessage.success('登录成功')
    } else {
      await authStore.register(form.username, form.password, form.studioName)
      ElMessage.success('注册成功')
    }
    emit('success')
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '登录失败'))
  } finally {
    loading.value = false
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

      <div class="mode-tabs">
        <button
          class="mode-tab"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          class="mode-tab"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <el-form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label>用户名</label>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </div>
        <div v-if="mode === 'register'" class="form-field">
          <label>工作室名称</label>
          <el-input
            v-model="form.studioName"
            placeholder="Photo Studio"
            size="large"
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
            @keyup.enter="handleSubmit"
          />
        </div>
        <el-button
          class="login-btn btn-primary"
          size="large"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ mode === 'login' ? '登 录' : '注 册' }}
        </el-button>
      </el-form>

      <div class="login-hint">
        <span v-if="mode === 'login'">默认管理员：admin / 123456</span>
        <span v-else>注册后数据保存在服务器，可远程多人各自使用</span>
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
  margin-bottom: 24px;

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

.mode-tabs {
  display: flex;
  gap: 4px;
  background: #f0ece5;
  border-radius: $radius-sm;
  padding: 3px;
  margin-bottom: 20px;
}

.mode-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: $color-text-secondary;

  &.active {
    background: $color-card;
    color: $color-brown;
    font-weight: 500;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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
