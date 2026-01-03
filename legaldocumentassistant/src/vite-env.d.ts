/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_CLAUSE_API_URL: string
    readonly VITE_DRAFT_API_URL: string
    readonly VITE_SUMMARY_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
