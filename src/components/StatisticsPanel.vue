<script setup lang="ts">
import { computed } from 'vue'
import { useAccountingStore } from '../stores/accounting'
import { formatMoney, PROJECT_TYPE_LABEL } from '../utils/amount'

const store = useAccountingStore()

const monthLabel = computed(() => store.calendarDate.format('YYYY年MM月'))
</script>

<template>
  <aside class="stats-panel">
    <div class="stats-card card">
      <div class="stats-title">本月收支统计</div>
      <div class="stats-subtitle">{{ monthLabel }}</div>

      <div class="summary-row">
        <div class="summary-item income">
          <span class="label">收入</span>
          <span class="value">{{ formatMoney(store.monthlyStats.income) }}</span>
        </div>
        <div class="summary-item expense">
          <span class="label">支出</span>
          <span class="value">{{ formatMoney(store.monthlyStats.expense) }}</span>
        </div>
      </div>

      <div class="stats-list">
        <div
          v-for="item in store.monthlyStats.stats.filter((s) => s.count > 0)"
          :key="item.id"
          class="stats-row"
        >
          <span class="stats-label">
            <span class="project-dot" :style="{ background: item.color }" />
            {{ item.name }}
            <span class="type-tag">{{ PROJECT_TYPE_LABEL[item.type] }}</span>
          </span>
          <span
            class="stats-amount"
            :class="item.type === 'expense' ? 'expense' : 'income'"
          >
            {{ item.type === 'expense' ? '-' : '' }}¥{{ item.amount.toLocaleString() }}
          </span>
        </div>
      </div>

      <div class="stats-total">
        <span>净收入</span>
        <span class="total-amount" :class="{ negative: store.monthlyStats.net < 0 }">
          {{ formatMoney(store.monthlyStats.net, true) }}
        </span>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.stats-panel {
  width: $stats-width;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  padding: 20px 16px;
  overflow-y: auto;
}

.stats-card {
  position: sticky;
  top: 20px;
}

.stats-title {
  font-size: 15px;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 4px;
}

.stats-subtitle {
  font-size: 12px;
  color: $color-text-secondary;
  margin-bottom: 16px;
}

.summary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.summary-item {
  padding: 10px;
  border-radius: $radius-sm;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.income {
    background: rgba(#6ba06b, 0.1);
  }

  &.expense {
    background: rgba(#e57373, 0.1);
  }

  .label {
    font-size: 11px;
    color: $color-text-secondary;
  }

  .value {
    font-size: 15px;
    font-weight: 600;
  }

  &.income .value {
    color: #6ba06b;
  }

  &.expense .value {
    color: #e57373;
  }
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: $color-text;
  gap: 4px;
}

.type-tag {
  font-size: 11px;
  color: $color-text-secondary;
}

.stats-amount {
  font-size: 14px;
  font-weight: 500;

  &.income {
    color: #6ba06b;
  }

  &.expense {
    color: #e57373;
  }
}

.stats-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid $color-border;
  font-size: 14px;
  font-weight: 600;
  color: $color-text;

  .total-amount {
    font-size: 20px;
    color: $color-brown;

    &.negative {
      color: #e57373;
    }
  }
}
</style>
