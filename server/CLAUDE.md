@AGENTS.md

# Server Backend

The backend (server/index.ts) is a minimal Bun HTTP server that acts as a proxy for AI APIs (Anthropic Claude and Google Gemini). It enforces strict code generation constraints via SYSTEM_PROMPT and handles authentication, error handling, and code post-processing.

## Routes

- **GET /api/config** — Returns which API keys are configured in .env
- **POST /api/generate** — Accepts { prompt, apiKey?, provider }, returns { code } or { error }

## Key Functions

- **callAnthropic(prompt, apiKey)** — Calls Claude Haiku API with SYSTEM_PROMPT
- **callGoogle(prompt, apiKey)** — Calls Gemini API with SYSTEM_PROMPT; detects MAX_TOKENS finish reason
- **stripCodeFences(text)** — Removes markdown code fences from AI response
- **ensureRenderCall(code)** — Appends render() call if missing
- **resolveApiKey(provider, clientKey)** — Resolves key from client input or .env

## SYSTEM_PROMPT

Defines strict rules for generated components:
- Plain JavaScript only (no TypeScript syntax)
- Inline styles only
- No import statements (React is global)
- Must call render() with component name
- Use React hooks if needed
- Descriptive variable names, clean formatting

This is the core constraint enforcer; do not soften it without coordination.
