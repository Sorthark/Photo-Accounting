<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useAccountingStore } from '../../stores/accounting'
import { formatRecordPrice, PROJECT_TYPE_LABEL, getRecordSignedAmount } from '../../utils/amount'

const store = useAccountingStore()

const dateRange = ref<[string, string] | null>(null)

const previewRecords = computed(() => {
  const [start, end] = dateRange.value ?? ['', '']
  return store.exportRecords(start || undefined, end || undefined)
})

const previewTotals = computed(() => {
  let income = 0
  let expense = 0
  for (const r of previewRecords.value) {
    const signed = getRecordSignedAmount(r, store.getProjectById(r.projectId))
    if (signed >= 0) income += signed
    else expense += Math.abs(signed)
  }
  return { income, expense, net: income - expense }
})

function downloadCsv() {
  const list = previewRecords.value
  if (list.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const headers = [
    '序号',
    '日期',
    '时间',
    'IP',
    'CN',
    '项目',
    '收支',
    '金额',
    '地点',
    '后期数量',
    '备注',
  ]
  const rows = list.map((r) => {
    const project = store.getProjectById(r.projectId)
    return [
      r.serialNo,
      r.date,
      r.time,
      r.client,
      r.cn,
      project?.name ?? '',
      PROJECT_TYPE_LABEL[project?.type ?? 'income'],
      getRecordSignedAmount(r, project),
      r.location,
      r.postProcessingQty,
      r.remarks,
    ]
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Photo_Accounting_Report_${dayjs().format('YYYYMMDD')}.csv`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${list.length} 条记录`)
}
</script>

<template>
  <div class="page">
    <div class="page-header card">
      <h2>报表导出</h2>
      <p>按日期范围导出 CSV 格式报表</p>
    </div>

    <div class="export-panel card">
      <div class="export-form">
        <div class="field">
          <label>日期范围</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>
        <div class="export-info">
          <span>预览：<strong>{{ previewRecords.length }}</strong> 条记录</span>
          <span>收入：<strong class="income">¥{{ previewTotals.income.toLocaleString() }}</strong></span>
          <span>支出：<strong class="expense">¥{{ previewTotals.expense.toLocaleString() }}</strong></span>
          <span>净收入：<strong>¥{{ previewTotals.net.toLocaleString() }}</strong></span>
        </div>
        <el-button class="btn-primary" :icon="Download" @click="downloadCsv">
          导出 CSV
        </el-button>
      </div>

      <el-table
        v-if="previewRecords.length > 0"
        :data="previewRecords.slice(0, 10)"
        stripe
        size="small"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="serialNo" label="序号" width="60" />
        <el-table-column prop="date" label="日期" width="100" />
        <el-table-column prop="cn" label="CN" width="80" />
        <el-table-column label="项目" width="80">
          <template #default="{ row }">
            {{ store.getProjectById(row.projectId)?.name }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="90">
          <template #default="{ row }">
            {{ formatRecordPrice(row, store.getProjectById(row.projectId)) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" />
      </el-table>
      <p v-if="previewRecords.length > 10" class="preview-hint">
        预览仅显示前 10 条，导出将包含全部 {{ previewRecords.length }} 条
      </p>
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

.export-panel {
  max-width: 800px;
}

.export-form {
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

.export-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  font-size: 14px;
  color: $color-text-secondary;

  strong {
    color: $color-brown;

    &.income {
      color: #6ba06b;
    }

    &.expense {
      color: #e57373;
    }
  }
}

.preview-hint {
  margin-top: 12px;
  font-size: 12px;
  color: $color-text-secondary;
}
</style>
