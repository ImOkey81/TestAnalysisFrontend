# Центр тестирования

Интерфейс для:

- генерации Gherkin по OpenAPI;
- генерации тестового проекта по OpenAPI;
- анализа скриншотов;
- анализа видео;
- анализа репозитория.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

## Адреса сервисов

Адреса заданы явно в [lib/service-config.ts](/C:/Users/artem/OneDrive/Desktop/TestAnalysisFrontend/lib/service-config.ts:1).

```ts
export const SERVICE_URLS = {
  swagger: 'http://localhost:8082',
  photo: 'http://localhost:8001',
  video: 'http://localhost:5000',
  repoReview: 'http://localhost:8083',
}
```

При необходимости измените их под свои сервисы.

## Как пользоваться

- `Swagger`: укажите `repoUrl`, при необходимости `filePath`, затем сгенерируйте Gherkin или тестовый проект.
- `Скриншоты`: загрузите изображение и получите Gherkin.
- `Видео`: загрузите `.mp4` и получите Gherkin.
- `Репозиторий`: укажите URL для `git clone` и получите сводку, тесты и ревью.
