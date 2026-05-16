import Link from 'next/link'
import { Camera, FileCode2, Github, Video } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tools = [
  {
    href: '/swagger',
    icon: FileCode2,
    title: 'Swagger',
    description: 'Передайте ссылку на OpenAPI-файл и получите Gherkin или готовый тестовый проект.',
    steps: 'Как работать: вставьте repoUrl, при необходимости filePath, затем запустите генерацию.',
  },
  {
    href: '/screenshot',
    icon: Camera,
    title: 'Скриншоты',
    description: 'Загрузите изображение интерфейса и получите Gherkin-сценарии.',
    steps: 'Как работать: выберите файл изображения, нажмите "Анализировать" и сохраните результат.',
  },
  {
    href: '/video',
    icon: Video,
    title: 'Видео',
    description: 'Загрузите mp4 и получите сценарии по пользовательскому потоку.',
    steps: 'Как работать: загрузите mp4, дождитесь обработки и скачайте `.feature`.',
  },
  {
    href: '/repo-review',
    icon: Github,
    title: 'Репозиторий',
    description: 'Проверьте репозиторий по URL для `git clone` и получите сводку, тесты и ревью.',
    steps: 'Как работать: вставьте clone URL, запустите анализ и откройте нужную вкладку с результатом.',
  },
] as const

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header — no title, description only */}
      <div className="mb-2">
        <div className="mb-3 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Инструменты
        </div>
        <p className="max-w-2xl text-xl leading-relaxed text-foreground/80">
          Выберите нужный раздел, заполните входные данные и сохраните полученный результат.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader className="space-y-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <p className="text-sm text-muted-foreground">{tool.steps}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
