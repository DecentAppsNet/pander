# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Pander is a browser-based game where players pander to a simulated crowd by saying things audience members like/dislike, affecting their happiness. It's a "Decent App" — a PWA that sends no user data to a server, using all local capabilities (WebGPU LLM inference, local NLP, IndexedDB persistence).

## Commands

- `npm run dev` — Start dev server on port 3000
- `npm run build` — Type-check + Vite build + copy manifest
- `npm run lint` — ESLint (zero warnings allowed)
- `npm test` — Run tests once (Vitest, node environment)
- `npm run test:watch` — Watch mode
- `npm run test:coverage` — Coverage (excludes `*.tsx` and `interactions/**`)

## Architecture

**Game engine is headless.** `GameSession` (src/game/GameSession.ts) manages all game state and logic with no DOM dependencies. The UI subscribes via callbacks (`setHappiness`, `onAverageHappinessChange`, `onDeckChanged`, `onEndLevel`). This separation means game logic is testable without a browser.

**Single-page app with screen states**, not routes. `HomeScreen` is the main game UI; `LoadScreen` shows while the embeddings model loads.

**Content is markdown-driven.** Levels and characters are defined in `/public/levels/levels.md` and `/public/characters/characters.md`, parsed by `levelFileUtil.ts` and `characterFileUtil.ts`.

**Game turn flow:**
1. Player enters text (chat or speech) → `GameSession.prompt()`
2. Words analyzed against audience member likes/dislikes with cooldown tracking
3. Happiness updates published via callbacks
4. Card keyword goals checked → advance to next card when complete
5. Turn timer can also auto-advance cards

**Key subsystems:**
- `src/embeddings/` + `src/transformersJs/` — Sentence embeddings via transformers.js, cached in IndexedDB
- `src/speech/` — Web Speech API wrapper + wink-nlp coherence analysis
- `src/persistence/` — IndexedDB key-value store with lazy schema upgrades
- `src/components/audienceView/` — Canvas-based crowd rendering with sprite sheets
- `src/game/wordAnalysisUtil.ts` — Word cooldown system (3s zero-impact, then 10s ramp to full)

## Conventions

- Path alias: `@/*` maps to `src/*`
- CSS Modules with local scope for component styling
- Private members prefixed with `_`
- Utility functions in `*Util.ts` files
- Type definitions in co-located `types/` subdirectories
- Tests in `__tests__/` subdirectories (utilities only, not components)
- Node v22.17.0 (see .nvmrc)
