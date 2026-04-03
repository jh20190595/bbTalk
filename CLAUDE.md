# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test runner is configured yet.

## Architecture

This is a React 19 + TypeScript + Vite single-page application.

**Key libraries installed (not yet wired up):**
- `zustand` — global state management
- `@tanstack/react-query` — server state / data fetching
- `axios` — HTTP client

**Path aliases:** `@/` maps to `src/` (configured via `vite-tsconfig-paths` and `tsconfig.json`). Use `@/` imports rather than relative paths.

**TypeScript strictness:** `strict`, `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are all enabled in `tsconfig.app.json`. Keep all locals and parameters used.
