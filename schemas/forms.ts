import { z } from 'zod'
import { TEST_LANGUAGES } from '@/lib/config'

const urlSchema = z
  .string()
  .trim()
  .min(1, 'Укажите URL')
  .url('Введите корректный URL')

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

export const swaggerGherkinSchema = z.object({
  repoUrl: urlSchema,
  filePath: optionalText,
})

export const swaggerTestsSchema = z.object({
  repoUrl: urlSchema,
  filePath: optionalText,
  language: z.enum(TEST_LANGUAGES),
})

export const repoReviewSchema = z.object({
  repo_url: urlSchema,
})

export type SwaggerGherkinValues = z.infer<typeof swaggerGherkinSchema>
export type SwaggerTestsValues = z.infer<typeof swaggerTestsSchema>
export type RepoReviewValues = z.infer<typeof repoReviewSchema>
