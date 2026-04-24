'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CopyButton } from '@/components/common/copy-button'
import { DownloadButton } from '@/components/common/download-button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorAlert } from '@/components/common/error-alert'
import { FileTree } from '@/components/common/file-tree'
import { FormSection } from '@/components/common/form-section'
import { LoadingState } from '@/components/common/loading-state'
import { PageHeader } from '@/components/common/page-header'
import { PreviewPanel } from '@/components/common/preview-panel'
import { ResultCard } from '@/components/common/result-card'
import { SectionTabs } from '@/components/common/section-tabs'
import { FieldWrapper } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiBlob, apiJson, apiText } from '@/lib/api-client'
import { TEST_LANGUAGES } from '@/lib/config'
import { downloadBlobFile, downloadTextFile, normalizeApiError } from '@/lib/utils'
import {
  swaggerGherkinSchema,
  swaggerTestsSchema,
  type SwaggerGherkinValues,
  type SwaggerTestsValues,
} from '@/schemas/forms'
import { SwaggerGenerateTestsResponse, SwaggerGenerationStatusResponse } from '@/types/api'

function buildSwaggerPayload(values: SwaggerGherkinValues | SwaggerTestsValues) {
  const { filePath, ...rest } = values

  return {
    ...rest,
    ...(filePath ? { filePath } : {}),
  }
}

const PENDING_STATUSES = new Set(['PENDING', 'PROCESSING'])
const SUCCESS_STATUSES = new Set(['DONE', 'COMPLETED', 'SUCCESS', 'READY'])
const FAILURE_STATUSES = new Set(['FAILED', 'ERROR'])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getGenerationStatus(response: SwaggerGenerationStatusResponse) {
  const rawStatus = response.status ?? response.state ?? response.generationStatus
  return typeof rawStatus === 'string' ? rawStatus.toUpperCase() : ''
}

export function SwaggerPage() {
  const [gherkin, setGherkin] = useState('')
  const [gherkinError, setGherkinError] = useState<string | null>(null)
  const [isGherkinLoading, setIsGherkinLoading] = useState(false)
  const [testsError, setTestsError] = useState<string | null>(null)
  const [isTestsLoading, setIsTestsLoading] = useState(false)
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const gherkinForm = useForm<SwaggerGherkinValues>({
    resolver: zodResolver(swaggerGherkinSchema),
    defaultValues: { repoUrl: '', filePath: '' },
  })

  const testsForm = useForm<SwaggerTestsValues>({
    resolver: zodResolver(swaggerTestsSchema),
    defaultValues: { repoUrl: '', filePath: '', language: 'java' },
  })

  const openFile = async (id: string, filePath: string) => {
    setSelectedFile(filePath)
    setIsPreviewLoading(true)

    try {
      const content = await apiText(
        'swagger',
        `/generated-tests/${id}/file?path=${encodeURIComponent(filePath)}&download=false`,
      )
      setPreviewContent(content)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const loadFiles = async (id: string) => {
    const fileList = await apiJson<string[]>('swagger', `/generated-tests/${id}/files`)
    setFiles(fileList)

    if (fileList[0]) {
      await openFile(id, fileList[0])
    }
  }

  const waitForGeneration = async (id: string) => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const response = await apiJson<SwaggerGenerationStatusResponse>('swagger', `/generated-tests/${id}/status`)
      const status = getGenerationStatus(response)

      if (SUCCESS_STATUSES.has(status)) {
        return
      }

      if (FAILURE_STATUSES.has(status)) {
        throw new Error(response.message || 'Генерация завершилась ошибкой.')
      }

      if (!PENDING_STATUSES.has(status) && status) {
        throw new Error(response.message || `Неожиданный статус генерации: ${status}`)
      }

      await sleep(1500)
    }

    throw new Error('Генерация заняла слишком много времени. Проверьте статус позже.')
  }

  const downloadCurrentFile = async () => {
    if (!generationId || !selectedFile) return

    const blob = await apiBlob(
      'swagger',
      `/generated-tests/${generationId}/file?path=${encodeURIComponent(selectedFile)}&download=true`,
    )
    downloadBlobFile(selectedFile.split('/').pop() ?? 'generated-file.txt', blob)
  }

  const downloadArchive = async () => {
    if (!generationId) return

    const blob = await apiBlob('swagger', `/generated-tests/${generationId}`)
    downloadBlobFile(`generated-tests-${generationId}.zip`, blob)
  }

  const handleGherkinSubmit = gherkinForm.handleSubmit(async (values) => {
    setGherkinError(null)
    setIsGherkinLoading(true)

    try {
      const responseText = await apiText('swagger', '/generate-gherkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildSwaggerPayload(values)),
      })
      setGherkin(responseText)
      toast.success('Gherkin сгенерирован')
    } catch (error) {
      setGherkinError(normalizeApiError(error).message)
    } finally {
      setIsGherkinLoading(false)
    }
  })

  const handleTestsSubmit = testsForm.handleSubmit(async (values) => {
    setTestsError(null)
    setIsTestsLoading(true)
    setFiles([])
    setSelectedFile(null)
    setPreviewContent('')

    try {
      const response = await apiJson<SwaggerGenerateTestsResponse>('swagger', '/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildSwaggerPayload(values)),
      })

      if (!response.generationId) {
        throw new Error('Сервис не вернул идентификатор генерации.')
      }

      setGenerationId(response.generationId)
      toast.success(response.message || 'Генерация запущена')
      await waitForGeneration(response.generationId)
      await loadFiles(response.generationId)
      toast.success('Тестовый проект готов')
    } catch (error) {
      setTestsError(normalizeApiError(error).message)
    } finally {
      setIsTestsLoading(false)
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Swagger"
        title="Генерация по OpenAPI"
        description="Укажите ссылку на OpenAPI-файл, запустите генерацию и сохраните результат."
      />
      <SectionTabs
        defaultValue="gherkin"
        tabs={[
          {
            value: 'gherkin',
            label: 'Gherkin',
            content: (
              <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
                <FormSection
                  title="Сгенерировать feature-файл"
                  description="Если `repoUrl` указывает на корень репозитория, дополнительно заполните `filePath`."
                >
                  <form className="space-y-4" onSubmit={handleGherkinSubmit}>
                    <FieldWrapper
                      id="swagger-repo-url"
                      label="repoUrl"
                      error={gherkinForm.formState.errors.repoUrl?.message}
                    >
                      <Input
                        id="swagger-repo-url"
                        placeholder="https://github.com/user/repo/blob/main/openapi.yaml"
                        {...gherkinForm.register('repoUrl')}
                      />
                    </FieldWrapper>
                    <FieldWrapper
                      id="swagger-file-path"
                      label="filePath"
                      error={gherkinForm.formState.errors.filePath?.message}
                    >
                      <Input
                        id="swagger-file-path"
                        placeholder="docs/openapi.yaml"
                        {...gherkinForm.register('filePath')}
                      />
                    </FieldWrapper>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={isGherkinLoading}>
                        {isGherkinLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Сгенерировать
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          gherkinForm.reset()
                          setGherkin('')
                          setGherkinError(null)
                        }}
                      >
                        Очистить
                      </Button>
                    </div>
                  </form>
                </FormSection>
                <ResultCard
                  title="Результат"
                  description="Скопируйте текст или скачайте `.feature`."
                  actions={
                    gherkin ? (
                      <div className="flex gap-2">
                        <CopyButton value={gherkin} />
                        <DownloadButton onClick={() => downloadTextFile('generated.feature', gherkin)}>
                          Скачать .feature
                        </DownloadButton>
                      </div>
                    ) : null
                  }
                >
                  {gherkinError ? <ErrorAlert message={gherkinError} /> : null}
                  {isGherkinLoading ? (
                    <LoadingState title="Генерируем Gherkin..." />
                  ) : gherkin ? (
                    <PreviewPanel filename="generated.feature" content={gherkin} />
                  ) : (
                    <EmptyState title="Результата пока нет" description="Заполните форму и запустите генерацию." />
                  )}
                </ResultCard>
              </div>
            ),
          },
          {
            value: 'tests',
            label: 'Тестовый проект',
            content: (
              <div className="grid gap-6">
                <FormSection
                  title="Сгенерировать тесты"
                  description="Укажите OpenAPI и выберите язык. После генерации можно просматривать файлы и скачать архив."
                >
                  <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleTestsSubmit}>
                    <FieldWrapper
                      id="tests-repo-url"
                      label="repoUrl"
                      error={testsForm.formState.errors.repoUrl?.message}
                    >
                      <Input
                        id="tests-repo-url"
                        placeholder="https://github.com/user/repo/blob/main/openapi.yaml"
                        {...testsForm.register('repoUrl')}
                      />
                    </FieldWrapper>
                    <FieldWrapper
                      id="tests-file-path"
                      label="filePath"
                      error={testsForm.formState.errors.filePath?.message}
                    >
                      <Input
                        id="tests-file-path"
                        placeholder="docs/openapi.yaml"
                        {...testsForm.register('filePath')}
                      />
                    </FieldWrapper>
                    <FieldWrapper
                      id="tests-language"
                      label="language"
                      error={testsForm.formState.errors.language?.message}
                    >
                      <Controller
                        control={testsForm.control}
                        name="language"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="tests-language">
                              <SelectValue placeholder="Выберите язык" />
                            </SelectTrigger>
                            <SelectContent>
                              {TEST_LANGUAGES.map((language) => (
                                <SelectItem key={language} value={language}>
                                  {language}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldWrapper>
                    <div className="flex items-end gap-3">
                      <Button type="submit" className="flex-1" disabled={isTestsLoading}>
                        {isTestsLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Сгенерировать
                      </Button>
                      {generationId ? (
                        <Button type="button" variant="outline" onClick={() => loadFiles(generationId)}>
                          <RefreshCcw className="h-4 w-4" />
                          Обновить
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </FormSection>
                {testsError ? <ErrorAlert message={testsError} /> : null}
                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                  <ResultCard
                    title="Файлы"
                    description="Выберите файл, чтобы открыть его содержимое."
                    actions={generationId ? <DownloadButton onClick={downloadArchive}>Скачать zip</DownloadButton> : null}
                  >
                    {isTestsLoading ? (
                      <LoadingState title="Генерируем тестовый проект..." />
                    ) : files.length ? (
                      <FileTree
                        files={files}
                        selectedFile={selectedFile}
                        onSelect={(file) => generationId && openFile(generationId, file)}
                      />
                    ) : (
                      <EmptyState title="Файлов пока нет" description="Сначала запустите генерацию тестов." />
                    )}
                  </ResultCard>
                  <ResultCard
                    title="Просмотр файла"
                    description="Откройте файл, скопируйте его или скачайте отдельно."
                    actions={
                      selectedFile ? (
                        <div className="flex gap-2">
                          <CopyButton value={previewContent} />
                          <DownloadButton onClick={downloadCurrentFile}>Скачать файл</DownloadButton>
                        </div>
                      ) : null
                    }
                  >
                    {isPreviewLoading ? (
                      <LoadingState title="Загружаем файл..." />
                    ) : selectedFile ? (
                      <PreviewPanel filename={selectedFile} content={previewContent} />
                    ) : (
                      <EmptyState title="Файл не выбран" description="Выберите файл в списке слева." />
                    )}
                  </ResultCard>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
