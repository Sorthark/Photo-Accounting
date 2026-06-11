<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { getErrorMessage } from '../../utils/error'

const authStore = useAuthStore()

const form = reactive({
  studioName: authStore.studioName,
  defaultLocation: '影棚',
})

async function handleSave() {
  if (!form.studioName.trim()) {
    ElMessage.warning('请输入工作室名称')
    return
  }
  try {
    await authStore.updateStudioName(form.studioName.trim())
    ElMessage.success('设置已保存')
  } catch (err) {
    ElMessage.error(getErrorMessage(err))
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header card">
      <h2>设置</h2>
      <p>工作室基本信息与偏好设置</p>
    </div>

    <div class="settings-panel card">
      <h3>基本信息</h3>
      <div class="settings-form">
        <div class="field">
          <label>工作室名称</label>
          <el-input v-model="form.studioName" placeholder="摄影工作室" />
        </div>
        <div class="field">
          <label>默认地点</label>
          <el-input v-model="form.defaultLocation" placeholder="影棚 / 外景" />
        </div>
        <div class="field">
          <label>当前账号</label>
          <el-input :model-value="authStore.user?.username" disabled />
        </div>
        <el-button class="btn-primary" @click="handleSave">保存设置</el-button>
      </div>
    </div>

    <div class="settings-panel card">
      <h3>关于</h3>
      <p class="about-text">Photo Accounting v1.0 — Photography studio bookkeeping platform</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.page-header {
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  p {
    font-size: 13px;
    color: $color-text-secondary;
  }
}

.settings-panel {
  max-width: 480px;
  margin-bottom: 16px;

  h3 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  color: $color-text-secondary;
  margin-bottom: 8px;
}

.about-text {
  font-size: 13px;
  color: $color-text-secondary;
  line-height: 1.6;
}
</style>
