Server Backend Agent Rules

Module Context

Backend server (server/index.ts) acts as AI API proxy, handling component generation requests and managing authentication, error handling, and code post-processing. Runs on Bun on port 3002; receives POST /api/generate requests with user prompts and returns plain JavaScript code.

Tech Stack & Constraints

- Bun only — do not switch to Node.js or other runtimes
- No external HTTP libraries — use Bun's native fetch API exclusively
- Claude: claude-haiku-4-5-20251001 (locked; do not change minor versions)
- Gemini: gemini-2.5-flash (locked; do not change)
- No type dependencies beyond built-in Bun types

Implementation Patterns

API Request Flow:
1. POST /api/generate receives { prompt, apiKey?, provider }
2. resolveApiKey() checks client-provided key first, then .env, then null
3. Call provider function (callAnthropic or callGoogle)
4. stripCodeFences() removes markdown backticks from AI response
5. ensureRenderCall() appends render() if not present
6. Return { code } or { error }

Error Handling:
- 503 overload → Korean message: 'API 서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.'
- 429 rate limit → Korean message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
- All errors include CORS headers
- Anthropic errors are caught as "Claude API error: {status}"
- Gemini MAX_TOKENS error is caught and returns localized message

CORS Policy:
- Allow-Origin: * (any frontend origin)
- Methods: GET, POST, OPTIONS
- Headers: Content-Type only
- Always include CORS_HEADERS in all responses

Local Golden Rules

SYSTEM_PROMPT (Immutable Core):
- Define SYSTEM_PROMPT as a const at file top
- Do NOT modify or soften the rules within it — they enforce plain JS generation
- The prompt is the source of truth for component generation constraints
- Any change to SYSTEM_PROMPT affects all future generations; coordinate with frontend team before modifying

API Key Management:
- Never log API keys (sanitize before any logging)
- Client-provided keys (UI input) take precedence over .env for single request
- .env keys are fallback only; do not assume they always exist
- Validate key presence before calling provider

Model Versions:
- Anthropic: always use claude-haiku-4-5-20251001 (specified in CLAUDE.md)
- Gemini: always use gemini-2.5-flash (specified in CLAUDE.md)
- Do not drift to newer/older models without explicit coordination

Code Post-Processing:
- stripCodeFences must handle all markdown variants: ```js, ```jsx, ```ts, ```tsx, ```javascript, ```typescript
- ensureRenderCall must detect existing render() calls (regex: /\brender\s*\(/) before appending
- If component name detection fails (no const/function declaration), return code as-is without render call

Provider Fallback:
- Default provider in server is 'anthropic' (line 169: provider = 'anthropic')
- But frontend defaults to 'google' — both behaviors are intentional; do not "fix" this inconsistency
- Ensure both providers handle the same SYSTEM_PROMPT equally
