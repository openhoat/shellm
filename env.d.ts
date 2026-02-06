/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
