export const SERVICE_URLS = {
  swagger: 'http://localhost:8082',
  photo: 'http://localhost:8001',
  video: 'http://localhost:5000',
  repoReview: 'http://localhost:8083',
} as const

export type ServiceKey = keyof typeof SERVICE_URLS
