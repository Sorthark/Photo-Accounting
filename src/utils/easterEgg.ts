/** 当月录入超过该数量时，月历触发隐藏彩蛋（每自然月仅一次） */
export const EASTER_EGG_THRESHOLD = 8

const STORAGE_PREFIX = 'photo-accounting-easter-egg'

export function getEasterEggStorageKey(monthKey: string) {
  return `${STORAGE_PREFIX}-${monthKey}`
}

export function hasEasterEggShown(monthKey: string) {
  return localStorage.getItem(getEasterEggStorageKey(monthKey)) === '1'
}

export function markEasterEggShown(monthKey: string) {
  localStorage.setItem(getEasterEggStorageKey(monthKey), '1')
}

export function getMonthRecordCount(
  records: { date: string }[],
  monthKey: string,
) {
  return records.filter((r) => r.date.startsWith(monthKey)).length
}

export function shouldTriggerEasterEgg(
  records: { date: string }[],
  monthKey: string,
) {
  return (
    getMonthRecordCount(records, monthKey) > EASTER_EGG_THRESHOLD &&
    !hasEasterEggShown(monthKey)
  )
}
