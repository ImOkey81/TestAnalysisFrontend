export const APP_NAME = 'Центр тестирования'

export const NAV_ITEMS = [
  { href: '/', label: 'Главная' },
  { href: '/swagger', label: 'Swagger' },
  { href: '/screenshot', label: 'Скриншоты' },
  { href: '/video', label: 'Видео' },
  { href: '/repo-review', label: 'Репозиторий' },
] as const

export const TEST_LANGUAGES = [
  'java',
  'python',
  'javascript',
  'typescript-angular',
  'csharp',
  'go',
] as const
