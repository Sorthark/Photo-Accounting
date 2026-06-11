import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import {
  batchDeleteRecordsApi,
  createProjectApi,
  createRecordApi,
  deleteProjectApi,
  deleteRecordApi,
  fetchBootstrapApi,
  updateProjectApi,
  updateRecordApi,
} from '../api/auth'
import { getRecordSignedAmount, getSignedAmount } from '../utils/amount'
import type {
  AccountingRecord,
  EntryFormData,
  NavItem,
  ProjectCategory,
  ProjectFormData,
} from '../types'

function createEmptyForm(): EntryFormData {
  return {
    date: dayjs().format('YYYY-MM-DD'),
    time: '',
    client: '',
    cn: '',
    projectId: '',
    price: null,
    location: '',
    postProcessingQty: null,
    remarks: '',
  }
}

function calcTotals(
  recordList: AccountingRecord[],
  projectList: ProjectCategory[],
) {
  const projectMap = Object.fromEntries(projectList.map((p) => [p.id, p]))
  let income = 0
  let expense = 0

  for (const record of recordList) {
    const project = projectMap[record.projectId]
    const signed = getRecordSignedAmount(record, project)
    if (signed >= 0) income += signed
    else expense += Math.abs(signed)
  }

  return { income, expense, net: income - expense }
}

function formToPayload(form: EntryFormData) {
  return {
    date: form.date,
    time: form.time,
    client: form.client,
    cn: form.cn,
    projectId: form.projectId,
    price: Math.abs(form.price ?? 0),
    location: form.location,
    postProcessingQty: form.postProcessingQty ?? 0,
    remarks: form.remarks,
  }
}

export const useAccountingStore = defineStore('accounting', () => {
  const projects = ref<ProjectCategory[]>([])
  const records = ref<AccountingRecord[]>([])
  const activeNav = ref<NavItem>('home')
  const calendarDate = ref(dayjs())
  const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
  const editingId = ref<string | null>(null)
  const loading = ref(false)

  const projectMap = computed(() =>
    Object.fromEntries(projects.value.map((p) => [p.id, p])),
  )

  const monthlyStats = computed(() => {
    const month = calendarDate.value.format('YYYY-MM')
    const monthRecords = records.value.filter((r) => r.date.startsWith(month))
    const totals = calcTotals(monthRecords, projects.value)

    const stats = projects.value.map((project) => {
      const projectRecords = monthRecords.filter((r) => r.projectId === project.id)
      const amount = projectRecords.reduce((sum, r) => sum + r.price, 0)
      return {
        ...project,
        count: projectRecords.length,
        amount,
        signedAmount: getSignedAmount(amount, project.type),
      }
    })

    return { stats, ...totals, totalCount: monthRecords.length }
  })

  const overallStats = computed(() => {
    const totals = calcTotals(records.value, projects.value)
    const count = records.value.length
    const avg = count > 0 ? Math.round(totals.net / count) : 0
    return { ...totals, count, avg }
  })

  const selectedDateRecords = computed(() =>
    records.value.filter((r) => r.date === selectedDate.value),
  )

  async function fetchAll() {
    loading.value = true
    try {
      const data = await fetchBootstrapApi()
      projects.value = data.projects
      records.value = data.records
    } finally {
      loading.value = false
    }
  }

  function resetData() {
    projects.value = []
    records.value = []
    editingId.value = null
  }

  function getProjectById(id: string) {
    return projectMap.value[id]
  }

  function getRecordsByDate(date: string) {
    return records.value.filter((r) => r.date === date)
  }

  function navigateCalendarToDate(date: string) {
    calendarDate.value = dayjs(date)
    selectedDate.value = date
  }

  function setSelectedDate(date: string) {
    selectedDate.value = date
  }

  async function addRecord(form: EntryFormData) {
    const record = await createRecordApi(formToPayload(form))
    records.value = [...records.value, record].sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      return d !== 0 ? d : (a.time || '').localeCompare(b.time || '')
    })
    navigateCalendarToDate(form.date)
  }

  async function updateRecord(id: string, form: EntryFormData) {
    const record = await updateRecordApi(id, formToPayload(form))
    records.value = records.value
      .map((r) => (r.id === id ? record : r))
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date)
        return d !== 0 ? d : (a.time || '').localeCompare(b.time || '')
      })
    navigateCalendarToDate(form.date)
  }

  async function deleteRecord(id: string) {
    await deleteRecordApi(id)
    records.value = records.value.filter((r) => r.id !== id)
    if (editingId.value === id) editingId.value = null
  }

  async function deleteRecords(ids: string[]) {
    await batchDeleteRecordsApi(ids)
    const idSet = new Set(ids)
    records.value = records.value.filter((r) => !idSet.has(r.id))
    if (editingId.value && idSet.has(editingId.value)) editingId.value = null
  }

  async function addProject(data: ProjectFormData) {
    const project = await createProjectApi({
      name: data.name,
      color: data.color,
      type: data.type,
      defaultPrice: data.defaultPrice,
      defaultPostProcessingQty: data.defaultPostProcessingQty,
    })
    projects.value.push(project)
    return project.id
  }

  async function updateProject(id: string, data: Partial<ProjectFormData>) {
    const project = await updateProjectApi(id, {
      name: data.name,
      color: data.color,
      type: data.type,
      defaultPrice: data.defaultPrice,
      defaultPostProcessingQty: data.defaultPostProcessingQty,
    })
    const index = projects.value.findIndex((p) => p.id === id)
    if (index !== -1) projects.value[index] = project
  }

  async function deleteProject(id: string) {
    await deleteProjectApi(id)
    projects.value = projects.value.filter((p) => p.id !== id)
    return true
  }

  function getProjectRecordCount(id: string) {
    return records.value.filter((r) => r.projectId === id).length
  }

  function setActiveNav(nav: NavItem) {
    activeNav.value = nav
  }

  function setCalendarDate(date: dayjs.Dayjs) {
    calendarDate.value = date
  }

  function setEditingId(id: string | null) {
    editingId.value = id
  }

  function exportRecords(startDate?: string, endDate?: string) {
    let list = [...records.value]
    if (startDate) list = list.filter((r) => r.date >= startDate)
    if (endDate) list = list.filter((r) => r.date <= endDate)
    return list
  }

  return {
    projects,
    records,
    activeNav,
    calendarDate,
    selectedDate,
    editingId,
    loading,
    projectMap,
    monthlyStats,
    overallStats,
    selectedDateRecords,
    fetchAll,
    resetData,
    getProjectById,
    getRecordsByDate,
    getProjectRecordCount,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    addProject,
    updateProject,
    deleteProject,
    setActiveNav,
    setCalendarDate,
    navigateCalendarToDate,
    setSelectedDate,
    setEditingId,
    createEmptyForm,
    exportRecords,
  }
})
