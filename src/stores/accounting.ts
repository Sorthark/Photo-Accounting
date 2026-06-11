import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { getRecordSignedAmount, getSignedAmount } from '../utils/amount'
import type {
  AccountingRecord,
  EntryFormData,
  NavItem,
  ProjectCategory,
  ProjectFormData,
} from '../types'

const DEFAULT_PROJECTS: ProjectCategory[] = [
  {
    id: 'portrait',
    name: '写真',
    color: '#4A7CF7',
    type: 'income',
    defaultPrice: 800,
    defaultPostProcessingQty: 10,
  },
  {
    id: 'ancient',
    name: '古风',
    color: '#6BA06B',
    type: 'income',
    defaultPrice: 1200,
    defaultPostProcessingQty: 15,
  },
  {
    id: 'couple',
    name: '情侣',
    color: '#E6A144',
    type: 'income',
    defaultPrice: 700,
    defaultPostProcessingQty: 8,
  },
  {
    id: 'hanfu',
    name: '汉服',
    color: '#A68AD4',
    type: 'income',
    defaultPrice: 500,
    defaultPostProcessingQty: 5,
  },
  {
    id: 'commercial',
    name: '商拍',
    color: '#C8B28A',
    type: 'income',
    defaultPrice: 150,
    defaultPostProcessingQty: 2,
  },
  {
    id: 'expense-props',
    name: '道具采购',
    color: '#E57373',
    type: 'expense',
    defaultPrice: 200,
    defaultPostProcessingQty: 0,
  },
]

const INITIAL_RECORDS: AccountingRecord[] = [
  {
    id: '1',
    serialNo: '001',
    date: '2026-01-10',
    time: '10:00',
    client: '沈清秋',
    cn: '沈清秋',
    projectId: 'portrait',
    price: 800,
    location: '影棚',
    postProcessingQty: 10,
    remarks: '',
  },
  {
    id: '2',
    serialNo: '002',
    date: '2026-01-15',
    time: '14:00',
    client: '小王爷',
    cn: '小王爷',
    projectId: 'ancient',
    price: 1200,
    location: '外景',
    postProcessingQty: 15,
    remarks: '',
  },
  {
    id: '3',
    serialNo: '003',
    date: '2026-01-22',
    time: '09:30',
    client: '苏苏',
    cn: '苏苏',
    projectId: 'couple',
    price: 700,
    location: '室内',
    postProcessingQty: 8,
    remarks: '',
  },
  {
    id: '4',
    serialNo: '004',
    date: '2026-01-25',
    time: '16:00',
    client: '阿宁',
    cn: '阿宁',
    projectId: 'hanfu',
    price: 500,
    location: '外景',
    postProcessingQty: 5,
    remarks: '',
  },
  {
    id: '5',
    serialNo: '005',
    date: '2026-01-28',
    time: '11:00',
    client: '小月',
    cn: '小月',
    projectId: 'commercial',
    price: 150,
    location: '影棚',
    postProcessingQty: 2,
    remarks: '',
  },
]

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

function sortAndReindexRecords(list: AccountingRecord[]) {
  list.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date)
    if (dateCmp !== 0) return dateCmp
    return (a.time || '00:00').localeCompare(b.time || '00:00')
  })
  list.forEach((record, index) => {
    record.serialNo = String(index + 1).padStart(3, '0')
  })
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

export const useAccountingStore = defineStore('accounting', () => {
  const projects = ref<ProjectCategory[]>([...DEFAULT_PROJECTS])
  const records = ref<AccountingRecord[]>([...INITIAL_RECORDS])
  const activeNav = ref<NavItem>('home')
  const calendarDate = ref(dayjs())
  const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
  const editingId = ref<string | null>(null)

  sortAndReindexRecords(records.value)

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

    return {
      stats,
      ...totals,
      totalCount: monthRecords.length,
    }
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

  function addRecord(form: EntryFormData) {
    const record: AccountingRecord = {
      id: Date.now().toString(),
      serialNo: '',
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
    records.value.push(record)
    sortAndReindexRecords(records.value)
    navigateCalendarToDate(form.date)
  }

  function updateRecord(id: string, form: EntryFormData) {
    const index = records.value.findIndex((r) => r.id === id)
    if (index === -1) return
    records.value[index] = {
      ...records.value[index],
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
    sortAndReindexRecords(records.value)
    navigateCalendarToDate(form.date)
  }

  function deleteRecord(id: string) {
    records.value = records.value.filter((r) => r.id !== id)
    sortAndReindexRecords(records.value)
    if (editingId.value === id) editingId.value = null
  }

  function deleteRecords(ids: string[]) {
    const idSet = new Set(ids)
    records.value = records.value.filter((r) => !idSet.has(r.id))
    sortAndReindexRecords(records.value)
    if (editingId.value && idSet.has(editingId.value)) editingId.value = null
  }

  function addProject(data: ProjectFormData) {
    const id = `project-${Date.now()}`
    projects.value.push({ id, ...data })
    return id
  }

  function updateProject(id: string, data: Partial<ProjectFormData>) {
    const index = projects.value.findIndex((p) => p.id === id)
    if (index === -1) return
    projects.value[index] = { ...projects.value[index], ...data }
  }

  function deleteProject(id: string) {
    const inUse = records.value.some((r) => r.projectId === id)
    if (inUse) return false
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
    projectMap,
    monthlyStats,
    overallStats,
    selectedDateRecords,
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

export const PROJECTS = DEFAULT_PROJECTS
