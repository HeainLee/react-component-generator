@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**React Component Generator** — An AI-powered web app that generates React components from natural language descriptions, with real-time preview and code display.

### Architecture

- **Frontend**: React 19 + TypeScript + Vite (port 5173)
- **Backend**: Bun server acting as API proxy (port 3002)
- **Multi-provider**: Anthropic Claude and Google Gemini support
- **Preview Engine**: react-live for runtime component rendering
- **Development**: Both frontend and backend run concurrently via `bun run dev`

### Key Technical Constraints

**Generated Code Requirements:**
- Must be plain JavaScript (no TypeScript syntax, type annotations, interfaces, or "as" casts)
- Inline styles only (no CSS imports, modules, or external stylesheets)
- No import statements (React available as global)
- Must end with `render(<ComponentName />);` call
- Component-centric: single, self-contained functional component per generation

## Development Commands

```bash
# Install dependencies
bun install

# Run frontend + backend concurrently
bun run dev
# Frontend: http://localhost:5173
# Backend API: http://localhost:3002

# Development tasks
bun run server       # Watch backend only
bun run build        # Build for production
bun run lint         # Run ESLint
bun run preview      # Preview production build
```

## Code Organization

### Frontend Structure
- **src/App.tsx**: Main app shell, header, provider/API key UI, results grid
- **src/components/**: UI components
  - `PromptInput.tsx`: Textarea + generate button
  - `LivePreview.tsx`: react-live preview renderer
  - `CodeView.tsx`: Code display with copy button
  - `ComponentCard.tsx`: Card wrapping preview + code + controls
- **src/hooks/useComponentGenerator.ts**: State management for component list, generation, errors
- **src/types/index.ts**: TypeScript definitions
- **src/App.css**: Retro design styles

### Backend (server/index.ts)

Routes:
- `GET /api/config`: Returns which API keys are configured in `.env`
- `POST /api/generate`: Accepts `{ prompt, apiKey?, provider }`, returns `{ code }` or `{ error }`

Key functions:
- `callAnthropic()`: Calls Claude API (claude-haiku-4-5-20251001)
- `callGoogle()`: Calls Gemini API (gemini-2.5-flash)
- `stripCodeFences()`: Removes markdown code blocks from AI output
- `ensureRenderCall()`: Appends render() if missing from generated code

## Configuration

**.env** (optional — API keys can also be provided via UI):
```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

## Important Notes

1. **System Prompt Tuning**: Server defines a strict system prompt (`SYSTEM_PROMPT` in server/index.ts). Generated code must be plain JS with inline styles — this is enforced at generation time.

2. **Provider Default**: App defaults to Google Gemini; can be toggled via dropdown.

3. **Retro Design**: Recent commits indicate a retro UI style is being applied. CSS should follow this visual direction.

4. **CORS Handling**: Backend provides CORS headers to allow frontend requests from any origin.

5. **Error Handling**: Server catches 503 (overload), 429 (rate limit), and generic errors, with localized Korean messages for user feedback.
