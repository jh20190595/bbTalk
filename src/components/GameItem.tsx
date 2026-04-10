import { isHomeStadium } from '@/constants/teams'
import type { Game } from '@/hooks/useKboSchedule'

interface GameItemProps {
  game: Game
  myTeamShort: string | null
}

export function GameItem({ game, myTeamShort }: GameItemProps) {
  const isDone = game.status === 'done'
  const isCancelled = game.status === 'cancelled'
  const homeWins = isDone && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWins = isDone && (game.away_score ?? 0) > (game.home_score ?? 0)
  const isHome = myTeamShort !== null && isHomeStadium(game.stadium, myTeamShort)

  return (
    <div style={{
      fontSize: 10, padding: '2px 4px', marginBottom: 2, borderRadius: 4,
      background: isCancelled ? '#f0f4f8' : isHome ? '#ebf8ff' : isDone ? '#e8f4fd' : '#f0f0f0',
      lineHeight: 1.4,
      border: isCancelled ? '1px solid #cbd5e0' : isHome ? '1px solid #bee3f8' : 'none',
      opacity: isCancelled ? 0.75 : 1,
    }}>
      {isCancelled ? (
        <span style={{ color: '#718096' }}>
          🌧 {game.home_team} vs {game.away_team}
        </span>
      ) : (
        <>
          {isHome && (
            <span style={{
              display: 'inline-block', background: '#3182ce', color: '#fff',
              fontSize: 8, padding: '0 3px', borderRadius: 2, marginRight: 2, verticalAlign: 'middle',
            }}>홈</span>
          )}
          {isDone ? (
            <span>
              {homeWins && <b style={{ color: '#e53e3e', marginRight: 2 }}>W</b>}
              <b>{game.home_team}</b> {game.home_score}:{game.away_score} {game.away_team}
              {awayWins && <b style={{ color: '#e53e3e', marginLeft: 2 }}>W</b>}
            </span>
          ) : (
            <span>
              {game.home_team} vs {game.away_team}
              {game.stadium ? <span style={{ color: '#888' }}> [{game.stadium}]</span> : null}
            </span>
          )}
        </>
      )}
    </div>
  )
}

export function ModalGameItem({ game, myTeamShort }: GameItemProps) {
  const isDone = game.status === 'done'
  const isCancelled = game.status === 'cancelled'
  const homeWins = isDone && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWins = isDone && (game.away_score ?? 0) > (game.home_score ?? 0)
  const isMyHome = myTeamShort !== null && isHomeStadium(game.stadium, myTeamShort)
  const isMyAway = myTeamShort !== null && !isMyHome && (game.home_team === myTeamShort || game.away_team === myTeamShort)

  if (isCancelled) {
    return (
      <div style={{
        padding: '10px 12px', borderRadius: 8, fontSize: 14,
        background: '#f0f4f8', border: '1px solid #cbd5e0', opacity: 0.8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#718096' }}>
          <span style={{ fontSize: 16 }}>🌧</span>
          <span style={{ fontWeight: 600 }}>{game.home_team}</span>
          <span style={{ fontSize: 12 }}>vs</span>
          <span style={{ fontWeight: 600 }}>{game.away_team}</span>
          <span style={{ fontSize: 11, color: '#a0aec0' }}>우천취소</span>
        </div>
        {game.stadium && (
          <div style={{ textAlign: 'center', fontSize: 11, color: '#a0aec0', marginTop: 4 }}>[{game.stadium}]</div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8, fontSize: 14,
      background: isMyHome ? '#ebf8ff' : isDone ? '#e8f4fd' : '#f7f7f7',
      border: isMyHome ? '1px solid #bee3f8' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          {homeWins && <b style={{ color: '#e53e3e', fontSize: 12 }}>W</b>}
          {isMyHome && (
            <span style={{ background: '#3182ce', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 3 }}>홈</span>
          )}
          <span style={{ fontWeight: 600, color: isMyHome ? '#3182ce' : '#333' }}>{game.home_team}</span>
        </div>
        <div style={{ width: 70, textAlign: 'center', color: '#555', fontSize: 13, fontWeight: isDone ? 700 : 400 }}>
          {isDone ? `${game.home_score} : ${game.away_score}` : 'vs'}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
          <span style={{ fontWeight: 600, color: isMyAway ? '#3182ce' : '#333' }}>{game.away_team}</span>
          {awayWins && <b style={{ color: '#e53e3e', fontSize: 12 }}>W</b>}
        </div>
      </div>
      {game.stadium && (
        <div style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 4 }}>[{game.stadium}]</div>
      )}
    </div>
  )
}
