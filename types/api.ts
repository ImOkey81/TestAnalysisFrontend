export type SwaggerGenerateTestsResponse = {
  message: string
  generationId: string | null
  downloadPath: string | null
}

export type SwaggerGenerationStatusResponse = {
  status?: string
  state?: string
  generationStatus?: string
  message?: string
}

export type ScreenshotResponse = {
  status: 'success'
  gherkin: string
}

export type VideoResponse = {
  status: 'success'
  frames_extracted: number
  gherkin: string
}

export type RepoAnalysisResponse = {
  summary: string
  generated_tests: string
  review: string
}

export type ApiError = {
  message: string
  status?: number
  details?: unknown
}
