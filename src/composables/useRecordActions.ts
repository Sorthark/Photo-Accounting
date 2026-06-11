import { ElMessage, ElMessageBox } from 'element-plus'
import { useAccountingStore } from '../stores/accounting'

export function useRecordActions() {
  const store = useAccountingStore()

  function handleEdit(id: string) {
    store.setActiveNav('entry')
    store.setEditingId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function confirmDelete(id: string, label?: string) {
    const name = label ? `「${label}」` : '该事项'
    try {
      await ElMessageBox.confirm(`确定删除${name}吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      })
      store.deleteRecord(id)
      ElMessage.success('事项已删除')
      return true
    } catch {
      return false
    }
  }

  async function confirmBatchDelete(ids: string[]) {
    if (ids.length === 0) {
      ElMessage.warning('请先选择要删除的事项')
      return false
    }
    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${ids.length} 条事项吗？删除后不可恢复。`,
        '批量删除确认',
        {
          confirmButtonText: '全部删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
        },
      )
      store.deleteRecords(ids)
      ElMessage.success(`已删除 ${ids.length} 条事项`)
      return true
    } catch {
      return false
    }
  }

  return { handleEdit, confirmDelete, confirmBatchDelete }
}
