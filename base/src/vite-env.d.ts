/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UPDATER_ENABLED?: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
