import { useKboRanking } from '@/hooks/useKboRanking'
import { TEAM_SHORT } from '@/constants/teams'

// 단축명 → 전체명 역매핑 (응원 팀 강조용)
const SHORT_TO_FULL: Record<string, string> = Object.fromEntries(
  Object.entries(TEAM_SHORT).map(([full, short]) => [short, full]),
)

export function TeamRankingTable({ favoriteTeam }: { favoriteTeam: string | undefined }) {
  const { data: rankings, isLoading, isError } = useKboRanking()

  if (isLoading) {
    return <div style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>순위 불러오는 중...</div>
  }
  if (isError || !rankings?.length) return null

  const myTeamShort = favoriteTeam ? TEAM_SHORT[favoriteTeam] : undefined

  return (
    <div style={{ padding: '12px 16px 0', borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#333' }}>KBO 순위</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: '#aaa', borderBottom: '1px solid #eee' }}>
              <th style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 500 }}>순위</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 500 }}>팀</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 500 }}>경기</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 500 }}>승</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 500 }}>패</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 500 }}>승률</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 500 }}>게차</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, i) => {
              const isMyTeam = myTeamShort === r.team || favoriteTeam === SHORT_TO_FULL[r.team]
              return (
                <tr
                  key={`${r.rank}-${i}`}
                  style={{
                    borderBottom: '1px solid #f5f5f5',
                    background: isMyTeam ? '#ebf8ff' : 'transparent',
                  }}
                >
                  <td style={{ textAlign: 'center', padding: '5px 6px', fontWeight: isMyTeam ? 700 : 400, color: isMyTeam ? '#3182ce' : '#333' }}>
                    {r.rank}
                  </td>
                  <td style={{ padding: '5px 6px', fontWeight: isMyTeam ? 700 : 400, color: isMyTeam ? '#3182ce' : '#333' }}>
                    {r.team}
                  </td>
                  <td style={{ textAlign: 'center', padding: '5px 6px', color: '#555' }}>{r.games}</td>
                  <td style={{ textAlign: 'center', padding: '5px 6px', color: '#555' }}>{r.win}</td>
                  <td style={{ textAlign: 'center', padding: '5px 6px', color: '#555' }}>{r.lose}</td>
                  <td style={{ textAlign: 'center', padding: '5px 6px', color: '#555' }}>{r.win_rate}</td>
                  <td style={{ textAlign: 'center', padding: '5px 6px', color: '#555' }}>{r.game_behind}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
