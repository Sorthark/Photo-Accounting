import { apiRequest, setToken } from './client'
import type { AccountingRecord, ProjectCategory } from '../types'

export interface AuthUser {
  username: string
  studioName: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

export async function loginApi(username: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setToken(data.token)
  return data.user
}

export async function registerApi(
  username: string,
  password: string,
  studioName: string,
) {
  const data = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, studioName }),
  })
  setToken(data.token)
  return data.user
}

export async function fetchMeApi() {
  return apiRequest<AuthUser>('/auth/me')
}

export async function updateProfileApi(studioName: string) {
  return apiRequest<{ studioName: string }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ studioName }),
  })
}

export async function fetchBootstrapApi() {
  return apiRequest<{ projects: ProjectCategory[]; records: AccountingRecord[] }>(
    '/bootstrap',
  )
}

export async function createProjectApi(body: Record<string, unknown>) {
  return apiRequest<ProjectCategory>('/projects', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateProjectApi(id: string, body: Record<string, unknown>) {
  return apiRequest<ProjectCategory>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteProjectApi(id: string) {
  await apiRequest<void>(`/projects/${id}`, { method: 'DELETE' })
}

export async function createRecordApi(body: Record<string, unknown>) {
  return apiRequest<AccountingRecord>('/records', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateRecordApi(id: string, body: Record<string, unknown>) {
  return apiRequest<AccountingRecord>(`/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteRecordApi(id: string) {
  await apiRequest<void>(`/records/${id}`, { method: 'DELETE' })
}

export async function batchDeleteRecordsApi(ids: string[]) {
  await apiRequest<void>('/records/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}
