<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useAccountingStore } from '../stores/accounting'
import { useRecordActions } from '../composables/useRecordActions'
import { formatRecordPrice } from '../utils/amount'

const store = useAccountingStore()
const { handleEdit, confirmDelete } = useRecordActions()

const dateLabel = computed(() => dayjs(store.selectedDate).format('YYYY年MM月DD日'))
</script>

<template>
  <div class="day-detail card">
    <div class="detail-header">
      <h3>{{ dateLabel }}</h3>
      <span class="count">{{ store.selectedDateRecords.length }} 条事项</span>
    </div>

    <div v-if="store.selectedDateRecords.length === 0" class="empty">
      当日暂无事项，点击日期可查看其他日期
    </div>

    <div v-else class="record-list">
      <div
        v-for="record in store.selectedDateRecords"
        :key="record.id"
        class="record-item"
      >
        <div class="record-main">
          <span
            class="project-dot"
            :style="{ background: store.getProjectById(record.projectId)?.color }"
          />
          <div class="record-info">
            <div class="record-client">
              {{ record.client }}
              <span v-if="record.cn" class="record-cn">({{ record.cn }})</span>
            </div>
            <div class="record-meta">
              {{ store.getProjectById(record.projectId)?.name }}
              · {{ formatRecordPrice(record, store.getProjectById(record.projectId)) }}
              · {{ record.time || '—' }}
            </div>
          </div>
        </div>
        <div class="record-actions">
          <el-button link type="primary" size="small" @click="handleEdit(record.id)">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="confirmDelete(record.id, record.client)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.day-detail {
  height: fit-content;
}

.detail-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: $color-text;
  }

  .count {
    font-size: 12px;
    color: $color-text-secondary;
  }
}

.empty {
  text-align: center;
  padding: 32px 16px;
  color: $color-text-secondary;
  font-size: 13px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #faf8f5;
  border-radius: $radius-sm;
}

.record-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.record-info {
  min-width: 0;
}

.record-client {
  font-weight: 500;
  margin-bottom: 4px;
}

.record-meta {
  font-size: 12px;
  color: $color-text-secondary;
}

.record-cn {
  font-weight: 400;
  color: $color-text-secondary;
  font-size: 12px;
  margin-left: 4px;
}

.record-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}
</style>
