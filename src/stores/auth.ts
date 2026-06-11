import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchMeApi,
  loginApi,
  registerApi,
  updateProfileApi,
  type AuthUser,
} from '../api/auth'
import { setToken, getToken } from '../api/client'

const USER_KEY = 'photo-accounting-user'

function loadCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function cacheUser(user: AuthUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(getToken() ? loadCachedUser() : null)
  const bootstrapping = ref(false)

  const isLoggedIn = computed(() => user.value !== null)
  const studioName = computed(() => user.value?.studioName ?? '')

  async function login(username: string, password: string) {
    const profile = await loginApi(username, password)
    user.value = profile
    cacheUser(profile)
    return true
  }

  async function register(username: string, password: string, studioNameValue: string) {
    const profile = await registerApi(username, password, studioNameValue)
    user.value = profile
    cacheUser(profile)
    return true
  }

  async function restoreSession() {
    if (!getToken()) return false
    bootstrapping.value = true
    try {
      const profile = await fetchMeApi()
      user.value = profile
      cacheUser(profile)
      return true
    } catch {
      logout()
      return false
    } finally {
      bootstrapping.value = false
    }
  }

  function logout() {
    user.value = null
    setToken(null)
    cacheUser(null)
  }

  async function updateStudioName(name: string) {
    await updateProfileApi(name)
    if (user.value) {
      user.value = { ...user.value, studioName: name }
      cacheUser(user.value)
    }
  }

  return {
    user,
    bootstrapping,
    isLoggedIn,
    studioName,
    login,
    register,
    restoreSession,
    logout,
    updateStudioName,
  }
})
