import type { AccountingRecord, ProjectCategory, ProjectType } from '../types'

export function getSignedAmount(price: number, type: ProjectType = 'income'): number {
  return type === 'expense' ? -Math.abs(price) : Math.abs(price)
}

export function getRecordSignedAmount(
  record: AccountingRecord,
  project?: ProjectCategory | null,
): number {
  return getSignedAmount(record.price, project?.type ?? 'income')
}

export function formatMoney(amount: number, showSign = false): string {
  const abs = Math.abs(amount).toLocaleString()
  if (showSign && amount < 0) return `-¥${abs}`
  if (showSign && amount > 0) return `+¥${abs}`
  return `¥${abs}`
}

export function formatRecordPrice(
  record: AccountingRecord,
  project?: ProjectCategory | null,
): string {
  const signed = getRecordSignedAmount(record, project)
  return formatMoney(signed, true)
}

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  income: '收入',
  expense: '支出',
}
