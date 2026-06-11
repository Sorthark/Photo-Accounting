import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'photo-accounting-auth'

interface AuthUser {
  username: string
  studioName: string
}

const DEMO_USERS: Record<string, { password: string; studioName: string }> = {
  admin: { password: '123456', studioName: '摄影工作室' },
  studio: { password: 'studio123', studioName: '摄影工作室' },
}

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(loadSession())

  const isLoggedIn = computed(() => user.value !== null)
  const studioName = computed(() => user.value?.studioName ?? '')

  function login(username: string, password: string): boolean {
    const account = DEMO_USERS[username.trim()]
    if (!account || account.password !== password) return false

    user.value = {
      username: username.trim(),
      studioName: account.studioName,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
    return true
  }

  function logout() {
    user.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  function updateStudioName(name: string) {
    if (!user.value) return
    user.value = { ...user.value, studioName: name }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  }

  return {
    user,
    isLoggedIn,
    studioName,
    login,
    logout,
    updateStudioName,
  }
})
