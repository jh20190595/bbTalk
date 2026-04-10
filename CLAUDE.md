# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**bbTalk** — KBO 팬 커뮤니티 모바일 웹앱.  
팀별 게시판, 직관 인증, KBO 경기 일정 확인, 팬들 간 소통을 제공한다.  
Supabase(Auth · DB · Storage · Edge Functions) + React SPA 구성.
kbo 달력을 통해 자신이 응원하는 팀의 달력을 볼 수 있고 홈 경기가 표시되어있음. 자세히 보기 클릭 시 다른 팀 경기 일정 확인가능
직관 페이지 - 직관 인증 시 그 날 경기의 승/패에 따라 직관 승률이 결정되고 홈 경기/원정 경기 직관 승률 세분화
           - 월 별 직관 승률, 경기장 별 직관 승률 확인 가능

---

## Absolute Rules

- `@/` 경로 별칭을 항상 사용한다. 상대 경로(`../../`) 금지.
- TypeScript strict 모드 준수. 미사용 변수/파라미터, `any` 타입 금지.
- `erasableSyntaxOnly` 활성화 → `enum` 사용 금지, `as const` 사용.
- Supabase 직접 호출은 `src/api/` 에만 작성한다. 컴포넌트/훅에서 직접 호출 금지.
- 서버 상태는 TanStack Query, 클라이언트 전역 상태는 Zustand만 사용한다.
- 새 파일 생성 전, 기존 파일 수정으로 해결 가능한지 먼저 검토한다.

---

## Build & Dev Commands

```bash
npm run dev       # Vite 개발 서버 (HMR)
npm run build     # tsc -b 타입 검사 → Vite 번들
npm run lint      # ESLint
npm run preview   # 프로덕션 빌드 로컬 미리보기
```

테스트 러너 미구성.

---

## Tech Stack

| 영역 | 라이브러리 |
|---|---|
| UI | React 19, TypeScript |
| 번들러 | Vite + vite-tsconfig-paths |
| 라우팅/네비 | @stackflow/react + plugin-history-sync + plugin-renderer-basic |
| 서버 상태 | @tanstack/react-query |
| 전역 상태 | zustand |
| HTTP | axios (현재 Supabase JS SDK가 우선) |
| 백엔드 | Supabase (Auth · PostgreSQL · Storage · Edge Functions) |
| 스타일 | CSS Modules / 전역 CSS |

---

## Architecture

```
src/
├── activities/     # 페이지 단위 컴포넌트 (Stackflow Activity)
├── api/            # Supabase 호출 함수 (순수 async 함수)
├── components/     # 재사용 UI 컴포넌트
├── constants/      # 상수 (KBO_TEAMS, TEAM_SHORT, HOME_STADIUM 등)
├── hooks/          # React Query 훅 래퍼
├── lib/            # 외부 클라이언트 초기화 (supabase.ts)
├── store/          # Zustand 스토어
├── types/          # TypeScript 타입 정의
├── utils/          # 순수 유틸리티 함수 (time.ts, calendar.ts 등)
├── App.tsx         # 루트 컴포넌트, 인증 초기화
├── stackflow.ts    # Stackflow 라우트/액티비티 등록
└── main.tsx        # 진입점, QueryClientProvider 등 Provider 래핑
```

### 레이어 규칙

```
Activity/Component
  └── hooks/          ← useQuery/useMutation 래핑
        └── api/      ← Supabase SDK 직접 호출
              └── lib/supabase.ts
```

---

## Domain Context

- **KBO 10개 구단** — `src/constants/teams.ts` 의 `KBO_TEAMS` 배열이 유일한 출처.
- **게시판(team)** — `posts.team` 컬럼 값은 `KboTeam` 타입과 일치해야 한다.
- **직관 인증(jikgwan)** — 사진을 Storage `jikgwan` 버킷에 업로드 후 `jikgwan_records` 에 저장.
- **KBO 일정** — Supabase Edge Function `kbo-schedule` 을 통해 제공 (`useKboSchedule` 훅 사용).
- **인증 흐름**
  1. Supabase Auth 로그인 → `session` 획득
  2. `users` 테이블에 프로필 존재 여부 확인
  3. 없으면 `ProfileSetupActivity` 로 리다이렉트 (`requiresProfileSetup: true`)

---

## Coding Conventions

- 파일명: 컴포넌트/Activity는 `PascalCase.tsx`, 훅은 `camelCase.ts`, API는 `camelCase.ts`.
- 훅은 `use` 접두사 필수.
- API 함수 네이밍: `fetchXxx` (조회), `createXxx` (생성), `updateXxx` (수정), `deleteXxx` (삭제).
- Supabase 쿼리 에러는 `if (error) throw error` 패턴으로 일관 처리.
- 비동기 `void` 억제가 필요한 경우 `void` 키워드 명시 (`void queryClient.invalidateQueries(...)`).
- 컴포넌트 내 인라인 스타일 최소화 — CSS 파일 또는 CSS Module 우선.

---

## Key Patterns

### React Query 훅 패턴

```ts
// src/hooks/usePosts.ts
export function usePosts(team?: string) {
  return useQuery({
    queryKey: ['posts', team ?? 'all'],
    queryFn: () => fetchPosts(team),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (post: Omit<Post, 'id' | 'created_at'>) => createPost(post),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['posts'] }) },
  })
}
```

### Zustand 스토어 패턴

```ts
// src/store/authStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
}))
```

### Stackflow 네비게이션

```ts
const { push, pop } = useFlow()
push('PostDetailActivity', { id: post.id })
pop()
```

새 화면 추가 시 `src/stackflow.ts` 에 액티비티와 라우트를 함께 등록해야 한다.

### Supabase Edge Function 호출

```ts
const res = await fetch(`${supabaseUrl}/functions/v1/<function-name>`, {
  headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
})
```
