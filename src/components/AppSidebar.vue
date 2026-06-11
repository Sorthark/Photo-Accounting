<script setup lang="ts">
import {
  Calendar,
  Camera,
  DataAnalysis,
  Document,
  HomeFilled,
  Setting,
  SwitchButton,
  Tickets,
  User,
} from '@element-plus/icons-vue'
import { useAccountingStore } from '../stores/accounting'
import { useAuthStore } from '../stores/auth'
import type { NavItem } from '../types'

const store = useAccountingStore()
const authStore = useAuthStore()

const menuItems: { key: NavItem; label: string; icon: typeof HomeFilled }[] = [
  { key: 'home', label: '首页', icon: HomeFilled },
  { key: 'entry', label: '事项录入', icon: Tickets },
  { key: 'project', label: '项目管理', icon: Camera },
  { key: 'stats', label: '账目统计', icon: DataAnalysis },
  { key: 'calendar', label: '月历视图', icon: Calendar },
  { key: 'export', label: '报表导出', icon: Document },
  { key: 'settings', label: '设置', icon: Setting },
]

function handleNav(key: NavItem) {
  store.setActiveNav(key)
}

function handleLogout() {
  authStore.logout()
  store.resetData()
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <el-icon :size="22" class="logo-icon"><Camera /></el-icon>
      <span class="logo-text">Photo Accounting</span>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="item in menuItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: store.activeNav === item.key }"
        @click="handleNav(item.key)"
      >
        <el-icon :size="18"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <el-icon :size="20"><User /></el-icon>
        </div>
        <span class="user-name">{{ authStore.studioName }}</span>
      </div>
      <button class="logout-btn" title="退出登录" @click="handleLogout">
        <el-icon :size="18"><SwitchButton /></el-icon>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.sidebar {
  width: $sidebar-width;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: $color-card;
  border-right: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid $color-border;

  .logo-icon {
    color: $color-brown;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    color: $color-text;
    letter-spacing: 1px;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: none;
  background: transparent;
  border-radius: $radius-sm;
  cursor: pointer;
  font-size: 14px;
  color: $color-text-secondary;
  transition: all 0.2s;
  text-align: left;
  width: 100%;

  &:hover {
    background: #faf8f5;
    color: $color-text;
  }

  &.active {
    background: rgba($color-brown-light, 0.25);
    color: $color-brown;
    font-weight: 500;
  }
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid $color-border;

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba($color-brown-light, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-brown;
  }

  .user-name {
    font-size: 13px;
    color: $color-text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: $radius-sm;
    cursor: pointer;
    color: $color-text-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: #faf8f5;
      color: $color-brown;
    }
  }
}
</style>
