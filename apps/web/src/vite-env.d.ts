/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_PLAYER_MSE_SEEK_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
