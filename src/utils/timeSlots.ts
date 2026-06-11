export function generateHalfHourSlots(start = 6, end = 23): string[] {
  const slots: string[] = []
  for (let h = start; h <= end; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < end || end === 23) {
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
  }
  return slots
}

export const TIME_SLOTS = generateHalfHourSlots(6, 23)
