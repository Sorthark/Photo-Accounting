<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAccountingStore } from '../../stores/accounting'
import { PROJECT_TYPE_LABEL } from '../../utils/amount'
import type { ProjectFormData } from '../../types'

const store = useAccountingStore()

const dialogVisible = ref(false)
const editingProjectId = ref<string | null>(null)

const defaultForm = (): ProjectFormData => ({
  name: '',
  color: '#4A7CF7',
  type: 'income',
  defaultPrice: 0,
  defaultPostProcessingQty: 0,
})

const form = reactive<ProjectFormData>(defaultForm())

const PRESET_COLORS = ['#4A7CF7', '#6BA06B', '#E6A144', '#A68AD4', '#C8B28A', '#E57373', '#64B5F6']

function openAdd() {
  editingProjectId.value = null
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(id: string) {
  const project = store.getProjectById(id)
  if (!project) return
  editingProjectId.value = id
  Object.assign(form, {
    name: project.name,
    color: project.color,
    type: project.type,
    defaultPrice: project.defaultPrice,
    defaultPostProcessingQty: project.defaultPostProcessingQty,
  })
  dialogVisible.value = true
}

function handleSave() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }
  const payload: ProjectFormData = {
    name: form.name.trim(),
    color: form.color,
    type: form.type,
    defaultPrice: Math.abs(form.defaultPrice),
    defaultPostProcessingQty: Math.max(0, form.defaultPostProcessingQty),
  }
  if (editingProjectId.value) {
    store.updateProject(editingProjectId.value, payload)
    ElMessage.success('项目已更新')
  } else {
    store.addProject(payload)
    ElMessage.success('项目已添加')
  }
  dialogVisible.value = false
}

async function handleDelete(id: string, name: string) {
  const count = store.getProjectRecordCount(id)
  if (count > 0) {
    ElMessage.warning(`「${name}」下有 ${count} 条事项，无法删除`)
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除项目「${name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    store.deleteProject(id)
    ElMessage.success('项目已删除')
  } catch {
    // cancelled
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header card">
      <div>
        <h2>项目管理</h2>
        <p>管理项目分类、收支类型、默认价格与后期数量</p>
      </div>
      <el-button class="btn-primary" :icon="Plus" @click="openAdd">新增项目</el-button>
    </div>

    <div class="project-grid">
      <div v-for="project in store.projects" :key="project.id" class="project-card card">
        <div class="project-top">
          <span class="project-dot large" :style="{ background: project.color }" />
          <div class="project-meta">
            <div class="project-name-row">
              <span class="project-name">{{ project.name }}</span>
              <el-tag
                size="small"
                :type="project.type === 'expense' ? 'danger' : 'success'"
              >
                {{ PROJECT_TYPE_LABEL[project.type] }}
              </el-tag>
            </div>
            <div class="project-defaults">
              默认 ¥{{ project.defaultPrice }} · 后期 {{ project.defaultPostProcessingQty }} 张
            </div>
            <div class="project-count">{{ store.getProjectRecordCount(project.id) }} 条事项</div>
          </div>
        </div>
        <div class="color-bar" :style="{ background: project.color }" />
        <div class="project-actions">
          <el-button size="small" @click="openEdit(project.id)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(project.id, project.name)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingProjectId ? '编辑项目' : '新增项目'"
      width="440px"
    >
      <div class="dialog-form">
        <div class="field">
          <label>项目名称</label>
          <el-input v-model="form.name" placeholder="如：写真、道具采购" />
        </div>
        <div class="field">
          <label>收支类型</label>
          <el-radio-group v-model="form.type">
            <el-radio value="income">收入</el-radio>
            <el-radio value="expense">支出</el-radio>
          </el-radio-group>
        </div>
        <div class="field-row">
          <div class="field">
            <label>默认价格 (¥)</label>
            <el-input-number
              v-model="form.defaultPrice"
              :min="0"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </div>
          <div class="field">
            <label>默认后期数量</label>
            <el-input-number
              v-model="form.defaultPostProcessingQty"
              :min="0"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="field">
          <label>标识颜色</label>
          <div class="color-picker">
            <button
              v-for="c in PRESET_COLORS"
              :key="c"
              class="color-swatch"
              :class="{ active: form.color === c }"
              :style="{ background: c }"
              @click="form.color = c"
            />
            <el-color-picker v-model="form.color" size="small" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button class="btn-primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.project-dot.large {
  width: 14px;
  height: 14px;
  margin-top: 4px;
}

.project-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
}

.project-defaults {
  font-size: 13px;
  color: $color-brown;
  margin-bottom: 2px;
}

.project-count {
  font-size: 12px;
  color: $color-text-secondary;
}

.color-bar {
  height: 4px;
  border-radius: 2px;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .field label {
    display: block;
    font-size: 13px;
    color: $color-text-secondary;
    margin-bottom: 8px;
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;

  &.active {
    border-color: $color-text;
    box-shadow: 0 0 0 2px $color-card;
  }
}
</style>
