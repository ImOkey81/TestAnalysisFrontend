'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CopyButton } from '@/components/common/copy-button'
import { CodeBlock } from '@/components/common/code-block'
import { DownloadButton } from '@/components/common/download-button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorAlert } from '@/components/common/error-alert'
import { FormSection } from '@/components/common/form-section'
import { LoadingState } from '@/components/common/loading-state'
import { PageHeader } from '@/components/common/page-header'
import { ResultCard } from '@/components/common/result-card'
import { SectionTabs } from '@/components/common/section-tabs'
import { FieldWrapper } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiJson } from '@/lib/api-client'
import { downloadTextFile, normalizeApiError } from '@/lib/utils'
import { repoReviewSchema, type RepoReviewValues } from '@/schemas/forms'
import { RepoAnalysisResponse } from '@/types/api'

function normalizeRepoCloneUrl(input: string) {
  const value = input.trim()

  try {
    const url = new URL(value)

    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean)

      if (parts.length >= 2) {
        const owner = parts[0]
        const repo = parts[1].replace(/\.git$/, '')
        return `https://github.com/${owner}/${repo}.git`
      }
    }
  } catch {
    return value
  }

  return value
}

export function RepoReviewPage() {
  const [result, setResult] = useState<RepoAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RepoReviewValues>({
    resolver: zodResolver(repoReviewSchema),
    defaultValues: { repo_url: '' },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    setError(null)
    setIsLoading(true)

    try {
      const repoUrl = normalizeRepoCloneUrl(values.repo_url)
      const response = await apiJson<RepoAnalysisResponse>('repoReview', '/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      })
      setResult(response)
      toast.success('Репозиторий проанализирован')
    } catch (error) {
      setError(normalizeApiError(error).message)
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Репозиторий"
        title="Анализ репозитория"
        description="Вставьте URL репозитория. Для GitHub обычная ссылка на репозиторий будет автоматически приведена к формату `git clone`."
      />
      <FormSection
        title="Проверить репозиторий"
        description="Используйте ссылку на репозиторий, а не на файл или папку. Пример: `https://github.com/user/repo` или `https://github.com/user/repo.git`."
      >
        <form className="flex flex-col gap-4 xl:flex-row" onSubmit={handleSubmit}>
          <div className="flex-1">
            <FieldWrapper id="repo-url" label="repo_url" error={form.formState.errors.repo_url?.message}>
              <Input id="repo-url" placeholder="https://github.com/user/repo.git" {...form.register('repo_url')} />
            </FieldWrapper>
          </div>
          <div className="flex items-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Анализировать
            </Button>
          </div>
        </form>
      </FormSection>
      {error ? <ErrorAlert message={error} /> : null}
      {isLoading ? (
        <LoadingState title="Анализируем репозиторий..." />
      ) : result ? (
        <SectionTabs
          defaultValue="summary"
          tabs={[
            {
              value: 'summary',
              label: 'Сводка',
              content: (
                <ResultCard
                  title="Сводка"
                  description="Краткое описание репозитория."
                  actions={
                    <div className="flex gap-2">
                      <CopyButton value={result.summary} />
                      <DownloadButton onClick={() => downloadTextFile('repo-summary.md', result.summary)}>
                        Скачать .md
                      </DownloadButton>
                    </div>
                  }
                >
                  <CodeBlock code={result.summary} />
                </ResultCard>
              ),
            },
            {
              value: 'generated-tests',
              label: 'Тесты',
              content: (
                <ResultCard
                  title="Сгенерированные тесты"
                  description="Тесты, подготовленные по результатам анализа."
                  actions={
                    <div className="flex gap-2">
                      <CopyButton value={result.generated_tests} />
                      <DownloadButton onClick={() => downloadTextFile('generated-tests.md', result.generated_tests)}>
                        Скачать .md
                      </DownloadButton>
                    </div>
                  }
                >
                  <CodeBlock code={result.generated_tests} />
                </ResultCard>
              ),
            },
            {
              value: 'review',
              label: 'Ревью',
              content: (
                <ResultCard
                  title="Ревью кода"
                  description="Замечания по результатам анализа."
                  actions={
                    <div className="flex gap-2">
                      <CopyButton value={result.review} />
                      <DownloadButton onClick={() => downloadTextFile('code-review.md', result.review)}>
                        Скачать .md
                      </DownloadButton>
                    </div>
                  }
                >
                  <CodeBlock code={result.review} />
                </ResultCard>
              ),
            },
          ]}
        />
      ) : (
        <EmptyState title="Анализ ещё не запускался" description="Укажите URL репозитория и запустите анализ." />
      )}
    </div>
  )
}
