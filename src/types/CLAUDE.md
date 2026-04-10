# src/types — DB 타입 정의

이 폴더는 Supabase DB 스키마와 1:1 대응하는 TypeScript 인터페이스를 관리한다.  
실제 타입 코드는 `supabase.ts` 에 있다.

---

## 테이블별 인터페이스

### `users` → `User`

```ts
interface User {
  id: string           // uuid — Supabase Auth UID (PK)
  nickname: string     // 사용자 닉네임
  favorite_team: string // 응원 구단 (KboTeam)
  created_at: string   // timestamptz
}
```

### `posts` → `Post`

```ts
interface Post {
  id: string
  user_id: string        // FK → users.id
  team: string           // 게시판 구분 — KboTeam 값
  topic?: string         // 게시글 주제 (optional)
  title: string
  content: string
  poll?: PollData | null // 투표 데이터 (optional)
  photos?: string[] | null // 사진 URL 배열 (optional)
  created_at: string
  profiles?: { nickname: string } // JOIN 결과 (optional)
}

interface PollData {
  options: string[]
  multiple: boolean
}
```

### `comments` → `Comment`

```ts
interface Comment {
  id: string
  post_id: string                 // FK → posts.id
  user_id: string                 // FK → users.id
  parent_comment_id?: string | null // 대댓글 (optional)
  content: string
  created_at: string
  profiles?: { nickname: string } // JOIN 결과 (optional)
}
```

### `post_reactions`

별도 인터페이스 없음. API 레이어에서 인라인 타입으로 처리.

| column | type | 설명 |
|---|---|---|
| post_id | uuid | FK → posts.id |
| user_id | uuid | FK → users.id |
| type | `'like' \| 'dislike'` | 반응 종류 |

### `comment_reactions`

별도 인터페이스 없음. API 레이어에서 인라인 타입으로 처리.

| column | type | 설명 |
|---|---|---|
| comment_id | uuid | FK → comments.id |
| user_id | uuid | FK → users.id |
| type | `'like' \| 'dislike'` | 반응 종류 |

### `jikgwan_records` → `GameRecord`

```ts
interface GameRecord {
  id: string
  user_id: string    // FK → users.id
  date: string       // 직관 날짜 (date)
  home_team: string
  away_team: string
  my_team_score: number
  opponent_score: number
  stadium: string
  result: 'win' | 'lose' | 'draw'
  created_at: string
}
```

> **Note:** DB 컬럼명은 `game_date`, `photo_url` 이지만 현재 타입은 확장 형태로 선언되어 있다.  
> 스키마와 타입 불일치 발생 시 DB 컬럼명을 기준으로 타입을 수정한다.

---

## Storage Buckets

| 버킷 | 용도 | 경로 패턴 |
|---|---|---|
| `jikgwan` | 직관 인증 사진 업로드 | `{user_id}/{date}_{timestamp}.{ext}` |

---

## Edge Function 응답 타입

### `kbo-schedule` → `Game` (`src/hooks/useKboSchedule.ts`)

```ts
interface Game {
  date: string
  home_team: string
  away_team: string
  stadium: string
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'done'
}
```

---

## 규칙

- 새 테이블이 추가되면 이 파일과 `supabase.ts` 를 함께 업데이트한다.
- DB 컬럼명(snake_case)을 그대로 인터페이스 필드명으로 사용한다.
- JOIN으로 가져오는 필드는 `optional` 로 선언한다 (`profiles?: ...`).
- `id`, `created_at` 은 `Omit<T, 'id' | 'created_at'>` 으로 제외하여 생성 페이로드 타입을 만든다.
