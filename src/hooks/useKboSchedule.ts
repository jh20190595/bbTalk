import { useQuery } from '@tanstack/react-query'

export interface Game {
  date: string
  home_team: string
  away_team: string
  stadium: string
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'done' | 'cancelled'
}

async function fetchKboSchedule(year: number, month: number): Promise<Game[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const res = await fetch(
    `${supabaseUrl}/functions/v1/kbo-schedule?year=${year}&month=${month}`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  )

  if (!res.ok) throw new Error('KBO 일정 로드 실패')
  return res.json() as Promise<Game[]>
}

export function useKboSchedule(year: number, month: number) {
  return useQuery({
    queryKey: ['kbo-schedule', year, month],
    queryFn: () => fetchKboSchedule(year, month),
    staleTime: 1000 * 60 * 10, // 10분 캐시
  })
}
