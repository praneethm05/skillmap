/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_ENABLE_INSIGHTS?: string;
  readonly VITE_ENABLE_EXPORT?: string;
  readonly VITE_ENABLE_SOCIAL?: string;
  readonly VITE_ENABLE_SHARING?: string;
  readonly VITE_ENABLE_ACCOUNTABILITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
