<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import { useAccountingStore } from './stores/accounting'
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'

const authStore = useAuthStore()
const accountingStore = useAccountingStore()
const { isLoggedIn } = storeToRefs(authStore)
const ready = ref(false)

async function loadUserData() {
  await accountingStore.fetchAll()
}

onMounted(async () => {
  const ok = await authStore.restoreSession()
  if (ok) await loadUserData()
  ready.value = true
})

watch(isLoggedIn, (loggedIn) => {
  if (!loggedIn) accountingStore.resetData()
})
</script>

<template>
  <div v-if="!ready" class="boot-screen">
    <div class="boot-card">Photo Accounting 加载中…</div>
  </div>
  <LoginView v-else-if="!isLoggedIn" @success="loadUserData" />
  <HomeView v-else v-loading="accountingStore.loading" />
</template>

<style scoped>
.boot-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f4ef;
}

.boot-card {
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  color: #8a8278;
  box-shadow: 0 2px 12px rgba(61, 56, 48, 0.06);
}
</style>
