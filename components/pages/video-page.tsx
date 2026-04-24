'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CopyButton } from '@/components/common/copy-button'
import { DownloadButton } from '@/components/common/download-button'
import { Dropzone } from '@/components/common/dropzone'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorAlert } from '@/components/common/error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { PageHeader } from '@/components/common/page-header'
import { ResultCard } from '@/components/common/result-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { apiJson } from '@/lib/api-client'
import { downloadTextFile, formatBytes, normalizeApiError } from '@/lib/utils'
import { VideoResponse } from '@/types/api'

export function VideoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [gherkin, setGherkin] = useState('')
  const [framesExtracted, setFramesExtracted] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleAnalyze = async () => {
    if (!file) {
      setError('Сначала выберите mp4-файл.')
      return
    }

    if (!file.name.toLowerCase().endsWith('.mp4')) {
      setError('Разрешены только файлы `.mp4`.')
      return
    }

    setError(null)
    setIsLoading(true)
    const formData = new FormData()
    formData.append('video', file)

    try {
      const response = await apiJson<VideoResponse>('video', '/upload-video', {
        method: 'POST',
        body: formData,
      })
      setFramesExtracted(response.frames_extracted)
      setGherkin(response.gherkin)
      toast.success('Видео обработано')
    } catch (error) {
      setError(normalizeApiError(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLatest = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiJson<{ status: string; gherkin?: string; message?: string }>('video', '/get-test-cases')
      if (response.status !== 'success' || !response.gherkin) {
        throw new Error(response.message ?? 'Последний результат недоступен.')
      }
      setFramesExtracted(null)
      setGherkin(response.gherkin)
      toast.success('Последний результат загружен')
    } catch (error) {
      setError(normalizeApiError(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Видео"
        title="Анализ видео"
        description="Загрузите mp4, дождитесь обработки и сохраните результат в формате Gherkin."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <ResultCard title="Файл" description="Загрузите видео интерфейса в формате mp4.">
          <div className="space-y-4">
            <Dropzone
              accept="video/mp4"
              onFileSelect={(selectedFile) => {
                setFile(selectedFile)
                setError(null)
              }}
              title="Перетащите mp4 сюда"
              description="Поддерживаются только файлы `video/mp4`."
            />
            {file && previewUrl ? (
              <Card className="overflow-hidden p-4">
                <video src={previewUrl} controls className="mb-4 h-64 w-full rounded-2xl border border-border/70 bg-black object-contain" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                      Анализировать
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFile(null)
                        setGherkin('')
                        setFramesExtracted(null)
                        setError(null)
                      }}
                    >
                      Очистить
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}
            {error ? <ErrorAlert message={error} /> : null}
          </div>
        </ResultCard>
        <ResultCard
          title="Результат"
          description="Проверьте число извлечённых кадров, скопируйте текст или скачайте `.feature`."
          actions={
            gherkin ? (
              <div className="flex gap-2">
                <CopyButton value={gherkin} />
                <DownloadButton onClick={() => downloadTextFile('video-analysis.feature', gherkin)}>
                  Скачать .feature
                </DownloadButton>
              </div>
            ) : null
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={fetchLatest} disabled={isLoading}>
              Загрузить последний результат
            </Button>
            <div className="rounded-full border border-border/70 px-3 py-1 text-sm text-muted-foreground">
              Извлечено кадров: <span className="font-medium text-foreground">{framesExtracted ?? 'нет данных'}</span>
            </div>
          </div>
          {isLoading ? (
            <LoadingState title="Выполняем анализ..." />
          ) : gherkin ? (
            <pre className="max-h-[560px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
              <code>{gherkin}</code>
            </pre>
          ) : (
            <EmptyState title="Результата пока нет" description="Загрузите mp4 и запустите анализ." />
          )}
        </ResultCard>
      </div>
    </div>
  )
}
