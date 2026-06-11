export type ProjectType = 'income' | 'expense'

export interface ProjectCategory {
  id: string
  name: string
  color: string
  type: ProjectType
  defaultPrice: number
  defaultPostProcessingQty: number
}

export interface AccountingRecord {
  id: string
  serialNo: string
  date: string
  time: string
  client: string
  cn: string
  projectId: string
  price: number
  location: string
  postProcessingQty: number
  remarks: string
}

export interface EntryFormData {
  date: string
  time: string
  client: string
  cn: string
  projectId: string
  price: number | null
  location: string
  postProcessingQty: number | null
  remarks: string
}

export type CalendarViewMode = 'month' | 'week' | 'day'

export type NavItem = 'home' | 'entry' | 'project' | 'stats' | 'calendar' | 'export' | 'settings'

export interface ProjectFormData {
  name: string
  color: string
  type: ProjectType
  defaultPrice: number
  defaultPostProcessingQty: number
}
