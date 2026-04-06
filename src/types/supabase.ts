export interface User {
  id: string
  nickname: string
  favorite_team: string
  created_at: string
}

export interface GameRecord {
  id: string
  user_id: string
  date: string
  home_team: string
  away_team: string
  my_team_score: number
  opponent_score: number
  stadium: string
  result: 'win' | 'lose' | 'draw'
  created_at: string
}

export interface PollData {
  options: string[]
  multiple: boolean
}

export interface Post {
  id: string
  user_id: string
  team: string
  topic?: string
  title: string
  content: string
  poll?: PollData | null
  photos?: string[] | null
  created_at: string
  profiles?: { nickname: string }
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id?: string | null
  content: string
  created_at: string
  profiles?: { nickname: string }
}
