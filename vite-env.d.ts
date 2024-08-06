/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_NAME: string;
  readonly PACKAGE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
