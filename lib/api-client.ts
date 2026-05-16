import { ApiError } from '@/types/api'
import { SERVICE_URLS, type ServiceKey } from '@/lib/service-config'
import { authFetch } from '@/lib/auth-fetch'

function getStatusMessage(status: number) {
  if (status === 415) {
    return 'Неверный формат запроса.'
  }

  if (status === 500) {
    return 'Внутренняя ошибка сервиса.'
  }

  return `Запрос завершился с ошибкой: ${status}`
}

function buildUrl(service: ServiceKey, path: string) {
  const baseUrl = SERVICE_URLS[service]
  return new URL(path, `${baseUrl}/`).toString()
}

async function parseError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const data = (await response.json()) as Record<string, unknown>
    const nestedError =
      typeof data.error === 'object' && data.error !== null ? (data.error as Record<string, unknown>) : null
    const backendMessage =
      typeof nestedError?.message === 'string'
        ? nestedError.message
        : typeof data.message === 'string'
          ? data.message
          : typeof data.detail === 'string'
            ? data.detail
            : getStatusMessage(response.status)

    return {
      message: backendMessage,
      status: response.status,
      details: data,
    }
  }

  const text = await response.text()
  return {
    message: text || getStatusMessage(response.status),
    status: response.status,
  }
}

async function fetchApi(service: ServiceKey, path: string, init?: RequestInit) {
  const response = await authFetch(buildUrl(service, path), init)
  if (!response.ok) throw await parseError(response)
  return response
}

export async function apiJson<T>(service: ServiceKey, path: string, init?: RequestInit): Promise<T> {
  const response = await fetchApi(service, path, init)
  return (await response.json()) as T
}

export async function apiText(service: ServiceKey, path: string, init?: RequestInit): Promise<string> {
  const response = await fetchApi(service, path, init)
  return response.text()
}

export async function apiBlob(service: ServiceKey, path: string, init?: RequestInit): Promise<Blob> {
  const response = await fetchApi(service, path, init)
  return response.blob()
}
