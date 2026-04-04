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

## Supabase Database Schema

### `users`
| column | type | description |
|---|---|---|
| id | uuid | Supabase Auth UID |
| nickname | text | 사용자 닉네임 |
| favorite_team | text | 응원 구단 |
| created_at | timestamptz | |

### `posts`
| column | type | description |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → users.id |
| team | text | 게시판 구분 (팀명) |
| topic | text | 게시글 주제 (optional) |
| title | text | |
| content | text | |
| poll | jsonb | 투표 데이터 `{ options: string[], multiple: boolean }` (optional) |
| created_at | timestamptz | |

### `comments`
| column | type | description |
|---|---|---|
| id | uuid | |
| post_id | uuid | FK → posts.id |
| user_id | uuid | FK → users.id |
| parent_comment_id | uuid | 대댓글용 (optional) |
| content | text | |
| created_at | timestamptz | |

### `post_reactions`
| column | type | description |
|---|---|---|
| post_id | uuid | FK → posts.id |
| user_id | uuid | FK → users.id |
| type | text | `'like'` \| `'dislike'` |

### `comment_reactions`
| column | type | description |
|---|---|---|
| comment_id | uuid | FK → comments.id |
| user_id | uuid | FK → users.id |
| type | text | `'like'` \| `'dislike'` |

### `jikgwan_records`
| column | type | description |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → users.id |
| game_date | date | 직관 날짜 |
| photo_url | text | Storage public URL |
| created_at | timestamptz | |

### Storage Buckets
- `jikgwan` — 직관 인증 사진 업로드 (`{user_id}/{date}_{timestamp}.{ext}`)
