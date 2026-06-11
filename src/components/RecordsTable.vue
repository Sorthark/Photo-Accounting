<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAccountingStore } from '../stores/accounting'
import { useRecordActions } from '../composables/useRecordActions'
import { formatRecordPrice, PROJECT_TYPE_LABEL } from '../utils/amount'

const props = withDefaults(
  defineProps<{
    title?: string
    selectable?: boolean
    maxHeight?: number | string
    limit?: number
  }>(),
  {
    title: '最近录入',
    selectable: false,
    maxHeight: 360,
    limit: 0,
  },
)

const store = useAccountingStore()
const { handleEdit, confirmDelete, confirmBatchDelete } = useRecordActions()
const selectedIds = ref<string[]>([])

const tableData = computed(() => {
  const list = store.records
  return props.limit > 0 ? list.slice(0, props.limit) : list
})

function onSelectionChange(rows: { id: string }[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handleBatchDelete() {
  const ok = await confirmBatchDelete(selectedIds.value)
  if (ok) selectedIds.value = []
}

function priceClass(row: { projectId: string; price: number }) {
  const project = store.getProjectById(row.projectId)
  return project?.type === 'expense' ? 'price-expense' : 'price-income'
}
</script>

<template>
  <div class="records-table card">
    <div class="table-header">
      <div class="table-title">{{ title }}</div>
      <el-button
        v-if="selectable && selectedIds.length > 0"
        type="danger"
        size="small"
        plain
        @click="handleBatchDelete"
      >
        删除选中 ({{ selectedIds.length }})
      </el-button>
    </div>
    <el-table
      :data="tableData"
      stripe
      style="width: 100%"
      :max-height="maxHeight"
      @selection-change="onSelectionChange"
    >
      <el-table-column v-if="selectable" type="selection" width="48" />
      <el-table-column prop="serialNo" label="序号" width="70" sortable />
      <el-table-column prop="date" label="日期" width="110" />
      <el-table-column prop="time" label="时间" width="80" />
      <el-table-column prop="client" label="IP" width="90" />
      <el-table-column prop="cn" label="CN" width="90" show-overflow-tooltip />
      <el-table-column label="项目" width="110">
        <template #default="{ row }">
          <span class="project-cell">
            <span
              class="project-dot"
              :style="{ background: store.getProjectById(row.projectId)?.color }"
            />
            {{ store.getProjectById(row.projectId)?.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="收支" width="70">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="store.getProjectById(row.projectId)?.type === 'expense' ? 'danger' : 'success'"
          >
            {{ PROJECT_TYPE_LABEL[store.getProjectById(row.projectId)?.type ?? 'income'] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }">
          <span :class="priceClass(row)">
            {{ formatRecordPrice(row, store.getProjectById(row.projectId)) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="地点" width="80" />
      <el-table-column prop="postProcessingQty" label="后期数量" width="90" />
      <el-table-column prop="remarks" label="备注" min-width="80" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="confirmDelete(row.id, row.client)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: $color-text;
}

.project-cell {
  display: flex;
  align-items: center;
}

.price-income {
  color: #6ba06b;
  font-weight: 500;
}

.price-expense {
  color: #e57373;
  font-weight: 500;
}
</style>
