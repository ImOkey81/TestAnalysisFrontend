export const SERVICE_URLS = {
  swagger: 'http://x10group.digital:8082',
  photo:   'http://x10group.digital:8001',
  video:   'http://x10group.digital:5000',
  repoReview: 'http://x10group.digital:8083',
}

export type ServiceKey = keyof typeof SERVICE_URLS
