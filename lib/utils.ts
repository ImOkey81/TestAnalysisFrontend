import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApiError } from '@/types/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  downloadBlobFile(filename, blob)
}

export function downloadBlobFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function formatBytes(size: number) {
  if (!size) return '0 Б'

  const units = ['Б', 'КБ', 'МБ', 'ГБ']
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** index

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message }
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const candidate = error as Record<string, unknown>
    return {
      message: String(candidate.message ?? 'Непредвиденная ошибка'),
      status: typeof candidate.status === 'number' ? candidate.status : undefined,
      details: candidate.details,
    }
  }

  return { message: 'Непредвиденная ошибка' }
}
