'use client'

import Image from 'next/image'
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
import { ScreenshotResponse } from '@/types/api'

export function ScreenshotPage() {
  const [file, setFile] = useState<File | null>(null)
  const [gherkin, setGherkin] = useState('')
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
      setError('Сначала выберите изображение.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Разрешены только изображения.')
      return
    }

    setError(null)
    setIsLoading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await apiJson<ScreenshotResponse>('photo', '/upload-image', {
        method: 'POST',
        body: formData,
      })
      setGherkin(response.gherkin)
      toast.success('Скриншот обработан')
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
      const response = await apiJson<{ status: string; gherkin?: string; message?: string }>('photo', '/get-test-cases')
      if (response.status !== 'success' || !response.gherkin) {
        throw new Error(response.message ?? 'Последний результат недоступен.')
      }
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
        eyebrow="Скриншоты"
        title="Анализ изображения"
        description="Загрузите изображение, запустите анализ и сохраните результат в формате Gherkin."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <ResultCard title="Файл" description="Загрузите изображение интерфейса.">
          <div className="space-y-4">
            <Dropzone
              accept="image/*"
              onFileSelect={(selectedFile) => {
                setFile(selectedFile)
                setError(null)
              }}
              title="Перетащите изображение сюда"
              description="Поддерживаются файлы с типом `image/*`."
            />
            {file && previewUrl ? (
              <Card className="overflow-hidden p-4">
                <div className="relative mb-4 h-64 overflow-hidden rounded-2xl border border-border/70">
                  <Image src={previewUrl} alt={file.name} fill className="object-contain" unoptimized />
                </div>
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
          description="Скопируйте текст, скачайте `.feature` или загрузите последний результат сервиса."
          actions={
            gherkin ? (
              <div className="flex gap-2">
                <CopyButton value={gherkin} />
                <DownloadButton onClick={() => downloadTextFile('screenshot-analysis.feature', gherkin)}>
                  Скачать .feature
                </DownloadButton>
              </div>
            ) : null
          }
        >
          <div className="mb-4">
            <Button variant="outline" onClick={fetchLatest} disabled={isLoading}>
              Загрузить последний результат
            </Button>
          </div>
          {isLoading ? (
            <LoadingState title="Выполняем анализ..." />
          ) : gherkin ? (
            <pre className="max-h-[560px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
              <code>{gherkin}</code>
            </pre>
          ) : (
            <EmptyState title="Результата пока нет" description="Загрузите изображение и запустите анализ." />
          )}
        </ResultCard>
      </div>
    </div>
  )
}
