import Link from 'next/link'
import { Camera, FileCode2, Github, Video } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
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
      <PageHeader
        eyebrow="Инструменты"
        title="Рабочие сценарии"
        description="Выберите нужный раздел, заполните входные данные и сохраните полученный результат."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <tool.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.steps}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
