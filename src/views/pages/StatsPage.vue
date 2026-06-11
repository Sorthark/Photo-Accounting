<script setup lang="ts">
import { computed } from 'vue'
import { useAccountingStore } from '../../stores/accounting'
import { formatMoney, PROJECT_TYPE_LABEL } from '../../utils/amount'

const store = useAccountingStore()

const monthLabel = computed(() => store.calendarDate.format('YYYY年MM月'))

const summaryCards = computed(() => [
  {
    label: '本月收入',
    value: formatMoney(store.monthlyStats.income),
    sub: monthLabel.value,
    type: 'income',
  },
  {
    label: '本月支出',
    value: formatMoney(store.monthlyStats.expense),
    sub: monthLabel.value,
    type: 'expense',
  },
  {
    label: '本月净收入',
    value: formatMoney(store.monthlyStats.net, true),
    sub: `${store.monthlyStats.totalCount} 条事项`,
    type: 'net',
  },
  {
    label: '累计净收入',
    value: formatMoney(store.overallStats.net, true),
    sub: `共 ${store.overallStats.count} 条`,
    type: 'net',
  },
])
</script>

<template>
  <div class="page">
    <div class="page-header card">
      <h2>账目统计</h2>
      <p>{{ monthLabel }} 收支数据概览</p>
    </div>

    <div class="summary-grid">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="summary-card card"
        :class="card.type"
      >
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value">{{ card.value }}</div>
        <div class="summary-sub">{{ card.sub }}</div>
      </div>
    </div>

    <div class="stats-table card">
      <h3>本月项目明细</h3>
      <el-table :data="store.monthlyStats.stats" stripe style="width: 100%">
        <el-table-column label="项目" min-width="120">
          <template #default="{ row }">
            <span class="project-cell">
              <span class="project-dot" :style="{ background: row.color }" />
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'expense' ? 'danger' : 'success'">
              {{ PROJECT_TYPE_LABEL[row.type as keyof typeof PROJECT_TYPE_LABEL] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="事项数" width="90" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span :class="row.type === 'expense' ? 'expense' : 'income'">
              {{ row.type === 'expense' ? '-' : '' }}¥{{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="占比" width="100">
          <template #default="{ row }">
            {{
              store.monthlyStats.income > 0 && row.type === 'income'
                ? `${Math.round((row.amount / store.monthlyStats.income) * 100)}%`
                : store.monthlyStats.expense > 0 && row.type === 'expense'
                  ? `${Math.round((row.amount / store.monthlyStats.expense) * 100)}%`
                  : '0%'
            }}
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <div class="footer-item">
          <span>收入合计</span>
          <span class="income">{{ formatMoney(store.monthlyStats.income) }}</span>
        </div>
        <div class="footer-item">
          <span>支出合计</span>
          <span class="expense">{{ formatMoney(store.monthlyStats.expense) }}</span>
        </div>
        <div class="footer-item total">
          <span>净收入</span>
          <span :class="{ negative: store.monthlyStats.net < 0 }">
            {{ formatMoney(store.monthlyStats.net, true) }}
          </span>
        </div>
      </div>
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  .summary-label {
    font-size: 13px;
    color: $color-text-secondary;
    margin-bottom: 8px;
  }

  .summary-value {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .summary-sub {
    font-size: 12px;
    color: $color-text-secondary;
  }

  &.income .summary-value {
    color: #6ba06b;
  }

  &.expense .summary-value {
    color: #e57373;
  }

  &.net .summary-value {
    color: $color-brown;
  }
}

.stats-table {
  h3 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.project-cell {
  display: flex;
  align-items: center;
}

.income {
  color: #6ba06b;
  font-weight: 500;
}

.expense {
  color: #e57373;
  font-weight: 500;
}

.table-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid $color-border;
}

.footer-item {
  display: flex;
  justify-content: space-between;
  font-weight: 500;

  &.total {
    font-weight: 600;
    font-size: 16px;
    padding-top: 8px;
    border-top: 1px dashed $color-border;

    .negative {
      color: #e57373;
    }
  }
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
