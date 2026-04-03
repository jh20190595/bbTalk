import { useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useKboSchedule } from '@/hooks/useKboSchedule'
import type { Game } from '@/hooks/useKboSchedule'
import { useAuthStore } from '@/store/authStore'
import { TabBar } from '@/components/TabBar'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

// KBO_TEAMS 전체명 → API 단축명
const TEAM_SHORT: Record<string, string> = {
  'KIA 타이거즈': 'KIA',
  '삼성 라이온즈': '삼성',
  'LG 트윈스': 'LG',
  '두산 베어스': '두산',
  'KT 위즈': 'KT',
  'SSG 랜더스': 'SSG',
  '롯데 자이언츠': '롯데',
  '한화 이글스': '한화',
  'NC 다이노스': 'NC',
  '키움 히어로즈': '키움',
}

function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  const y = dateStr.slice(0, 4)
  const m = dateStr.slice(4, 6)
  const d = dateStr.slice(6, 8)
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`
}

function GameItem({ game }: { game: Game }) {
  const isDone = game.status === 'done'
  const homeWins = isDone && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWins = isDone && (game.away_score ?? 0) > (game.home_score ?? 0)
  return (
    <div style={{
      fontSize: 10,
      padding: '2px 4px',
      marginBottom: 2,
      borderRadius: 4,
      background: isDone ? '#e8f4fd' : '#f0f0f0',
      lineHeight: 1.4,
    }}>
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
    </div>
  )
}

function ModalGameItem({ game }: { game: Game }) {
  const isDone = game.status === 'done'
  const homeWins = isDone && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWins = isDone && (game.away_score ?? 0) > (game.home_score ?? 0)
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 8,
      background: isDone ? '#e8f4fd' : '#f7f7f7',
      fontSize: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* 홈팀 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          {homeWins && <b style={{ color: '#e53e3e', fontSize: 12 }}>W</b>}
          <span style={{ fontWeight: 600 }}>{game.home_team}</span>
        </div>
        {/* 스코어 */}
        <div style={{ width: 70, textAlign: 'center', color: '#555', fontSize: 13, fontWeight: isDone ? 700 : 400 }}>
          {isDone ? `${game.home_score} : ${game.away_score}` : 'vs'}
        </div>
        {/* 원정팀 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
          <span style={{ fontWeight: 600 }}>{game.away_team}</span>
          {awayWins && <b style={{ color: '#e53e3e', fontSize: 12 }}>W</b>}
        </div>
      </div>
      {game.stadium && (
        <div style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 4 }}>[{game.stadium}]</div>
      )}
    </div>
  )
}

interface DayModalProps {
  dateStr: string
  games: Game[]
  onClose: () => void
}

function DayModal({ dateStr, games, onClose }: DayModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          padding: '20px 16px 40px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, flex: 1, fontSize: 16 }}>{formatDate(dateStr)} 전체 경기</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555' }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {games.map((g, i) => <ModalGameItem key={i} game={g} />)}
        </div>
      </div>
    </div>
  )
}

const KboCalendarActivity: ActivityComponentType = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [modalDate, setModalDate] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)
  const myTeamShort = user?.favorite_team ? (TEAM_SHORT[user.favorite_team] ?? null) : null

  const { data: games, isLoading, isError } = useKboSchedule(year, month)

  const cells = buildCalendarGrid(year, month)
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function allGamesForDay(day: number): Game[] {
    if (!games) return []
    return games.filter(g => g.date === toDateStr(year, month, day))
  }

  function myTeamGame(dayGames: Game[]): Game | undefined {
    if (!myTeamShort) return undefined
    return dayGames.find(g => g.home_team === myTeamShort || g.away_team === myTeamShort)
  }

  const modalGames = modalDate ? (games?.filter(g => g.date === modalDate) ?? []) : []

  return (
    <div style={{ paddingBottom: 56 }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12 }}>
          <button onClick={prevMonth} style={{ padding: '4px 10px' }}>‹</button>
          <h2 style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: 18 }}>
            {year}년 {month}월 KBO 일정
          </h2>
          <button onClick={nextMonth} style={{ padding: '4px 10px' }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              padding: '6px 0',
              fontWeight: 600,
              fontSize: 13,
              color: d === '일' ? '#e53e3e' : d === '토' ? '#3182ce' : '#333',
              background: '#f7f7f7',
            }}>
              {d}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>불러오는 중...</div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#e53e3e' }}>일정을 불러올 수 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {cells.map((day, i) => {
              const colIndex = i % 7
              const isToday = day !== null && toDateStr(year, month, day) === todayStr
              const dayGames = day !== null ? allGamesForDay(day) : []
              const featured = myTeamGame(dayGames)
              const hasGames = dayGames.length > 0

              return (
                <div key={i} style={{
                  minHeight: 90,
                  padding: 4,
                  background: isToday ? '#fffbea' : '#fff',
                  border: isToday ? '1px solid #f6c90e' : '1px solid #eee',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {day !== null && (
                    <>
                      <div style={{
                        fontSize: 12,
                        fontWeight: isToday ? 700 : 400,
                        color: colIndex === 0 ? '#e53e3e' : colIndex === 6 ? '#3182ce' : '#333',
                        marginBottom: 4,
                      }}>
                        {day}
                      </div>

                      {featured && <GameItem game={featured} />}

                      {hasGames && (
                        <button
                          onClick={() => setModalDate(toDateStr(year, month, day))}
                          style={{
                            marginTop: 'auto',
                            padding: '2px 0',
                            fontSize: 9,
                            color: '#3182ce',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          자세히 보기
                        </button>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalDate && (
        <DayModal
          dateStr={modalDate}
          games={modalGames}
          onClose={() => setModalDate(null)}
        />
      )}

      <TabBar activeTab="calendar" />
    </div>
  )
}

export default KboCalendarActivity
