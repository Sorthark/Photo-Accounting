<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useAccountingStore } from '../stores/accounting'
import { useRecordActions } from '../composables/useRecordActions'
import { formatRecordPrice } from '../utils/amount'
import {
  getMonthRecordCount,
  markEasterEggShown,
  shouldTriggerEasterEgg,
} from '../utils/easterEgg'
import CalendarEasterEgg from './CalendarEasterEgg.vue'
import type { CalendarViewMode } from '../types'

dayjs.locale('zh-cn')

const props = withDefaults(
  defineProps<{
    expanded?: boolean
    interactive?: boolean
  }>(),
  {
    expanded: false,
    interactive: false,
  },
)

const store = useAccountingStore()
const { handleEdit, confirmDelete } = useRecordActions()
const viewMode = ref<CalendarViewMode>('month')
const showEasterEgg = ref(false)

const monthKey = computed(() => store.calendarDate.format('YYYY-MM'))
const monthRecordCount = computed(() =>
  getMonthRecordCount(store.records, monthKey.value),
)

function tryTriggerEasterEgg() {
  if (viewMode.value !== 'month') return
  if (showEasterEgg.value) return
  if (!shouldTriggerEasterEgg(store.records, monthKey.value)) return
  markEasterEggShown(monthKey.value)
  showEasterEgg.value = true
}

function onEasterEggClose() {
  showEasterEgg.value = false
}

watch([() => store.records.length, monthKey, viewMode], () => {
  tryTriggerEasterEgg()
})

onMounted(() => {
  tryTriggerEasterEgg()
})

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

const currentMonth = computed(() => store.calendarDate.format('YYYY年MM月'))

const calendarDays = computed(() => {
  const current = store.calendarDate
  const allRecords = store.records
  const startOfMonth = current.startOf('month')
  const endOfMonth = current.endOf('month')

  let startDay: number = startOfMonth.day()
  if (startDay === 0) startDay = 7
  const gridStart = startOfMonth.subtract(startDay - 1, 'day')

  let endDay: number = endOfMonth.day()
  if (endDay === 0) endDay = 7
  const gridEnd = endOfMonth.add(7 - endDay, 'day')

  const days: {
    date: string
    day: number
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
    records: typeof allRecords
  }[] = []

  let cursor = gridStart
  while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, 'day')) {
    const dateStr = cursor.format('YYYY-MM-DD')
    days.push({
      date: dateStr,
      day: cursor.date(),
      isCurrentMonth: cursor.month() === current.month(),
      isToday: cursor.isSame(dayjs(), 'day'),
      isSelected: dateStr === store.selectedDate,
      records: allRecords.filter((r) => r.date === dateStr),
    })
    cursor = cursor.add(1, 'day')
  }

  return days
})

function prevMonth() {
  store.setCalendarDate(store.calendarDate.subtract(1, 'month'))
}

function nextMonth() {
  store.setCalendarDate(store.calendarDate.add(1, 'month'))
}

function goToday() {
  const today = dayjs().format('YYYY-MM-DD')
  store.setCalendarDate(dayjs())
  store.setSelectedDate(today)
}

function selectDay(date: string) {
  if (!props.interactive) return
  store.setSelectedDate(date)
}

function getProjectColor(projectId: string) {
  return store.getProjectById(projectId)?.color ?? '#999'
}

function displayName(record: { client: string; cn: string }) {
  return record.cn || record.client
}

async function onDeleteEvent(id: string, client: string, e: Event) {
  e.stopPropagation()
  await confirmDelete(id, client)
}
</script>

<template>
  <div class="calendar-view card" :class="{ expanded }">
    <div class="calendar-header">
      <div class="calendar-nav">
        <el-button :icon="ArrowLeft" circle size="small" @click="prevMonth" />
        <span class="month-label">{{ currentMonth }}</span>
        <el-button :icon="ArrowRight" circle size="small" @click="nextMonth" />
        <el-button size="small" class="today-btn" @click="goToday">今天</el-button>
      </div>
      <div class="view-switcher">
        <button
          v-for="mode in (['month', 'week', 'day'] as CalendarViewMode[])"
          :key="mode"
          class="view-btn"
          :class="{ active: viewMode === mode }"
          @click="viewMode = mode"
        >
          {{ mode === 'month' ? '月' : mode === 'week' ? '周' : '日' }}
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'month'" class="calendar-grid">
      <div v-for="wd in WEEKDAYS" :key="wd" class="weekday">{{ wd }}</div>
      <div
        v-for="cell in calendarDays"
        :key="cell.date"
        class="day-cell"
        :class="{
          'other-month': !cell.isCurrentMonth,
          today: cell.isToday,
          selected: cell.isSelected && interactive,
          interactive,
        }"
        @click="selectDay(cell.date)"
      >
        <span class="day-number">{{ cell.day }}</span>
        <div class="day-events">
          <template v-if="interactive">
            <el-popover
              v-for="record in cell.records"
              :key="record.id"
              placement="right"
              :width="220"
              trigger="click"
            >
              <template #reference>
                <span
                  class="event-badge clickable"
                  :style="{ background: getProjectColor(record.projectId) }"
                  @click.stop
                >
                  {{ displayName(record) }}
                </span>
              </template>
              <div class="event-popover">
                <div class="popover-title">{{ record.client }}</div>
                <div v-if="record.cn" class="popover-info">CN：{{ record.cn }}</div>
                <div class="popover-info">
                  {{ store.getProjectById(record.projectId)?.name }}
                  · {{ formatRecordPrice(record, store.getProjectById(record.projectId)) }}
                </div>
                <div class="popover-info">{{ record.time }} · {{ record.location }}</div>
                <div class="popover-actions">
                  <el-button size="small" @click="handleEdit(record.id)">编辑</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="onDeleteEvent(record.id, record.client, $event)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </el-popover>
          </template>
          <template v-else>
            <span
              v-for="record in cell.records.slice(0, expanded ? 4 : 2)"
              :key="record.id"
              class="event-badge"
              :style="{ background: getProjectColor(record.projectId) }"
            >
              {{ displayName(record) }}
            </span>
            <span
              v-if="cell.records.length > (expanded ? 4 : 2)"
              class="more-badge"
            >
              +{{ cell.records.length - (expanded ? 4 : 2) }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="view-placeholder">
      {{ viewMode === 'week' ? '周视图' : '日视图' }}开发中，请使用月视图
    </div>

    <CalendarEasterEgg
      v-if="showEasterEgg"
      :count="monthRecordCount"
      :month-label="currentMonth"
      @close="onEasterEggClose"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.calendar-view {
  margin-bottom: 16px;

  &.expanded .day-cell {
    min-height: 110px;
  }
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;

  .month-label {
    font-size: 16px;
    font-weight: 600;
    min-width: 120px;
    text-align: center;
  }

  .today-btn {
    margin-left: 8px;
    color: $color-brown;
    border-color: $color-brown-light;
  }
}

.view-switcher {
  display: flex;
  gap: 4px;
  background: #f0ece5;
  border-radius: $radius-sm;
  padding: 3px;
}

.view-btn {
  padding: 4px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: $color-text-secondary;
  transition: all 0.2s;

  &.active {
    background: $color-card;
    color: $color-brown;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: $color-border;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  overflow: hidden;
}

.weekday {
  background: #faf8f5;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  color: $color-text-secondary;
  font-weight: 500;
}

.day-cell {
  background: $color-card;
  min-height: 80px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.interactive {
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #faf8f5;
    }
  }

  &.selected {
    background: rgba($color-brown-light, 0.15);
    box-shadow: inset 0 0 0 2px rgba($color-brown, 0.35);
  }

  &.other-month {
    background: #faf8f5;

    .day-number {
      color: #ccc;
    }

    &.selected {
      background: rgba($color-brown-light, 0.1);
    }
  }

  &.today .day-number {
    background: $color-brown;
    color: #fff;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.day-number {
  font-size: 13px;
  font-weight: 500;
  color: $color-text;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-badge {
  font-size: 11px;
  color: #fff;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  &.clickable {
    cursor: pointer;

    &:hover {
      opacity: 0.85;
    }
  }
}

.more-badge {
  font-size: 10px;
  color: $color-text-secondary;
}

.event-popover {
  .popover-title {
    font-weight: 600;
    margin-bottom: 6px;
  }

  .popover-info {
    font-size: 12px;
    color: $color-text-secondary;
    margin-bottom: 4px;
  }

  .popover-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
}

.view-placeholder {
  text-align: center;
  padding: 40px;
  color: $color-text-secondary;
}
</style>
