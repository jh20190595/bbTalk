import { useQuery } from '@tanstack/react-query'

export interface TeamRank {
  rank: number
  team: string
  games: number
  win: number
  lose: number
  draw: number
  win_rate: string
  game_behind: string
}

async function fetchKboRanking(): Promise<TeamRank[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const res = await fetch(`${supabaseUrl}/functions/v1/kbo-ranking`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })

  if (!res.ok) throw new Error('KBO 순위 로드 실패')
  return res.json() as Promise<TeamRank[]>
}

export function useKboRanking() {
  return useQuery({
    queryKey: ['kbo-ranking'],
    queryFn: fetchKboRanking,
    staleTime: 1000 * 60 * 10,
  })
}
