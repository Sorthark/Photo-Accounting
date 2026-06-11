<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAccountingStore } from '../stores/accounting'
import { TIME_SLOTS } from '../utils/timeSlots'
import { PROJECT_TYPE_LABEL } from '../utils/amount'
import { getErrorMessage } from '../utils/error'
import type { EntryFormData } from '../types'

const store = useAccountingStore()

const form = reactive<EntryFormData>(store.createEmptyForm())

const selectedProject = computed(() =>
  form.projectId ? store.getProjectById(form.projectId) : null,
)

const priceLabel = computed(() =>
  selectedProject.value?.type === 'expense' ? '支出金额' : '收入金额',
)

const editingSerialNo = computed(() => {
  if (!store.editingId) return ''
  return store.records.find((r) => r.id === store.editingId)?.serialNo ?? ''
})

watch(
  () => store.editingId,
  (id) => {
    if (id) {
      const record = store.records.find((r) => r.id === id)
      if (record) {
        Object.assign(form, {
          date: record.date,
          time: record.time,
          client: record.client,
          cn: record.cn,
          projectId: record.projectId,
          price: record.price,
          location: record.location,
          postProcessingQty: record.postProcessingQty,
          remarks: record.remarks,
        })
      }
    } else {
      resetForm()
    }
  },
)

watch(
  () => form.projectId,
  (id) => {
    if (!id || store.editingId) return
    const project = store.getProjectById(id)
    if (project) {
      form.price = project.defaultPrice
      form.postProcessingQty = project.defaultPostProcessingQty
    }
  },
)

function resetForm() {
  Object.assign(form, store.createEmptyForm())
}

function validate(): boolean {
  if (!form.date) {
    ElMessage.warning('请选择日期')
    return false
  }
  if (!form.time) {
    ElMessage.warning('请选择时间（整点或整点半）')
    return false
  }
  if (!form.client.trim()) {
    ElMessage.warning('请输入 IP（客户名）')
    return false
  }
  if (!form.projectId) {
    ElMessage.warning('请选择项目')
    return false
  }
  if (form.price === null || form.price < 0) {
    ElMessage.warning('请输入有效金额')
    return false
  }
  return true
}

function handleSave() {
  if (!validate()) return

  const run = async () => {
    try {
      if (store.editingId) {
        await store.updateRecord(store.editingId, { ...form })
        store.setEditingId(null)
        ElMessage.success('记录已更新，序号已重新排序')
      } else {
        await store.addRecord({ ...form })
        ElMessage.success('记录已保存，序号已自动生成')
      }
      resetForm()
    } catch (err) {
      ElMessage.error(getErrorMessage(err))
    }
  }
  run()
}

function handleClear() {
  store.setEditingId(null)
  resetForm()
}
</script>

<template>
  <div class="entry-form card">
    <div class="form-title">{{ store.editingId ? '编辑记录' : '快速录入' }}</div>
    <div class="form-grid">
      <div class="form-item">
        <label>序号</label>
        <el-input
          :model-value="editingSerialNo || '保存后自动生成'"
          disabled
          placeholder="自动生成"
          size="default"
        />
      </div>
      <div class="form-item">
        <label>日期</label>
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          size="default"
          style="width: 100%"
        />
      </div>
      <div class="form-item">
        <label>时间</label>
        <el-select
          v-model="form.time"
          placeholder="整点 / 整点半"
          size="default"
          style="width: 100%"
          filterable
        >
          <el-option v-for="t in TIME_SLOTS" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
      <div class="form-item">
        <label>IP</label>
        <el-input v-model="form.client" placeholder="客户名" size="default" />
      </div>
      <div class="form-item">
        <label>CN</label>
        <el-input v-model="form.cn" placeholder="角色/CN 名" size="default" />
      </div>
      <div class="form-item">
        <label>项目</label>
        <el-select v-model="form.projectId" placeholder="选择项目" size="default" style="width: 100%">
          <el-option v-for="p in store.projects" :key="p.id" :label="p.name" :value="p.id">
            <span class="project-dot" :style="{ background: p.color }" />
            {{ p.name }}
            <span class="option-type">({{ PROJECT_TYPE_LABEL[p.type] }})</span>
          </el-option>
        </el-select>
      </div>
      <div class="form-item">
        <label>{{ priceLabel }}</label>
        <el-input-number
          v-model="form.price"
          :min="0"
          :precision="0"
          controls-position="right"
          size="default"
          style="width: 100%"
        />
      </div>
      <div class="form-item">
        <label>地点</label>
        <el-input v-model="form.location" placeholder="影棚/外景" size="default" />
      </div>
      <div class="form-item">
        <label>后期数量</label>
        <el-input-number
          v-model="form.postProcessingQty"
          :min="0"
          :precision="0"
          controls-position="right"
          size="default"
          style="width: 100%"
        />
      </div>
      <div class="form-item form-item-wide">
        <label>备注</label>
        <el-input v-model="form.remarks" placeholder="备注信息" size="default" />
      </div>
    </div>
    <p v-if="selectedProject" class="project-hint">
      已关联项目默认值：{{ PROJECT_TYPE_LABEL[selectedProject.type] }} ¥{{
        selectedProject.defaultPrice
      }}，后期 {{ selectedProject.defaultPostProcessingQty }} 张
    </p>
    <div class="form-actions">
      <el-button class="btn-primary" @click="handleSave">
        {{ store.editingId ? '更新' : '保存' }}
      </el-button>
      <el-button class="btn-secondary" @click="handleClear">清空</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.entry-form {
  margin-bottom: 16px;
}

.form-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: $color-text;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    color: $color-text-secondary;
  }

  &.form-item-wide {
    grid-column: span 2;
  }
}

.option-type {
  margin-left: 6px;
  font-size: 12px;
  color: $color-text-secondary;
}

.project-hint {
  margin-top: 12px;
  font-size: 12px;
  color: $color-text-secondary;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: flex-end;
}

@media (max-width: 1400px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
