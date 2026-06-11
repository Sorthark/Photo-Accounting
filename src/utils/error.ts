import { ApiError } from '../api/client'

export function getErrorMessage(err: unknown, fallback = '操作失败') {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return fallback
}
