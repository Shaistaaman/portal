/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL for `/auth/*` and `/v1/*`. Leave unset for mock auth (no
   * backend). Set to an empty string when CloudFront serves the API on the
   * same origin as the portal, or to a full URL for local backend testing.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
