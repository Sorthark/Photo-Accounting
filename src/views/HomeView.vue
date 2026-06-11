<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import DesktopViewport from '../components/DesktopViewport.vue'
import StatisticsPanel from '../components/StatisticsPanel.vue'
import { useAccountingStore } from '../stores/accounting'
import HomePage from './pages/HomePage.vue'
import EntryPage from './pages/EntryPage.vue'
import ProjectPage from './pages/ProjectPage.vue'
import StatsPage from './pages/StatsPage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import ExportPage from './pages/ExportPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import type { NavItem } from '../types'

const store = useAccountingStore()

const pageMap: Record<NavItem, Component> = {
  home: HomePage,
  entry: EntryPage,
  project: ProjectPage,
  stats: StatsPage,
  calendar: CalendarPage,
  export: ExportPage,
  settings: SettingsPage,
}

const currentPage = computed(() => pageMap[store.activeNav])
const showStatsPanel = computed(() => store.activeNav === 'home')
</script>

<template>
  <DesktopViewport>
    <div class="home-layout">
      <AppSidebar />
      <main class="main-content" :class="{ 'with-stats': showStatsPanel }">
        <component :is="currentPage" />
      </main>
      <StatisticsPanel v-if="showStatsPanel" />
    </div>
  </DesktopViewport>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.home-layout {
  min-width: $layout-min-width;
  min-height: 100vh;
  background: $color-bg;
}

.main-content {
  margin-left: $sidebar-width;
  padding: 20px 20px 40px;
  min-height: 100vh;

  &.with-stats {
    margin-right: $stats-width;
  }
}

</style>
