@AGENTS.md — React Component Generator Agent Rules

Operational Commands (CRITICAL)

Use Bun exclusively for all package management and script execution:
- `bun install` — Install dependencies
- `bun run dev` — Start frontend (5173) + backend (3002) concurrently
- `bun run server` — Run backend only in watch mode
- `bun run build` — Build frontend for production
- `bun run lint` — Run ESLint on source files
- `bun run preview` — Preview production build locally

Do NOT use npm, yarn, or pnpm. Bun is the canonical package manager for this project.

Golden Rules (Immutable Constraints)

Generated Component Code (server/index.ts enforcement):
- Must be plain JavaScript only — no TypeScript syntax, type annotations, interfaces, or "as" casts
- Inline styles only — no CSS imports, modules, or external stylesheets
- No import statements — React must be referenced as a global
- Must end with exactly `render(<ComponentName />);` call
- Single, self-contained functional component per generation

Provider Behavior:
- Default provider is Google Gemini (gemini-2.5-flash)
- Fallback/override provider is Anthropic Claude (claude-haiku-4-5-20251001)
- Both are called via their official SDKs

API Keys:
- May be supplied via .env (ANTHROPIC_API_KEY, GOOGLE_API_KEY) or UI input
- Never hardcode keys in source code or version control
- Server validates provider availability via GET /api/config endpoint

Frontend/Backend Communication:
- Backend serves frontend as proxy for AI APIs
- CORS headers configured to allow any origin
- Error responses include Korean-localized messages for 429 (rate limit) and 503 (overload)

Project Context

AI-powered React component generator with real-time preview. Users input natural-language descriptions; the server calls Claude or Gemini to generate plain JavaScript components; the frontend renders them live via react-live.

Tech Stack: React 19, TypeScript, Vite, Bun, react-live (preview), Zod (validation)

Standards & References

Commit Convention:
- Format: `<type>(<scope>): <message>` in English or Korean (consistent within PR)
- Types: feat, fix, refactor, style, test, docs, chore
- Scope examples: design, api, frontend, backend, server
- Example: `feat(server): add Gemini provider support`

Code Style:
- Follow ESLint rules (run `bun run lint` before commit)
- File naming: camelCase for .ts/.tsx, index files for exports
- React: functional components only, hooks for state management

UI/Design:
- Retro visual direction (per recent commits; check src/App.css and inline styles)
- All styles must be inline or within `<style>` tags (no external CSS imports in generated code)

Context Map

- **[Backend Server (API Proxy)](./server/AGENTS.md)** — Modifying AI provider calls, SYSTEM_PROMPT tuning, route handling, error localization

Maintenance Policy

- If rules conflict with observed code, prioritize the code as source of truth and propose an update to this file
- This document is binding only when consistent with the codebase
