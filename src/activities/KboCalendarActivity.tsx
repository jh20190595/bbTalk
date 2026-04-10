import { useState, useRef } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useKboSchedule } from '@/hooks/useKboSchedule'
import type { Game } from '@/hooks/useKboSchedule'
import { useAuthStore } from '@/store/authStore'
import { TabBar } from '@/components/TabBar'
import { GameItem } from '@/components/GameItem'
import { DayModal } from '@/components/DayModal'
import { createJikgwanRecord } from '@/api/jikgwan'
import { TEAM_SHORT, isHomeStadium } from '@/constants/teams'
import { buildCalendarGrid, toDateStr } from '@/utils/calendar'
import { RankingDrawer } from '@/components/RankingDrawer'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

const KboCalendarActivity: ActivityComponentType = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [modalDate, setModalDate] = useState<string | null>(null)
  const [menuDay, setMenuDay] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [rankingOpen, setRankingOpen] = useState(false)

  const uploadDateRef = useRef<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function startJikgwan(dateStr: string) {
    uploadDateRef.current = dateStr
    setMenuDay(null)
    fileInputRef.current?.click()
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadStatus('uploading')
    try {
      await createJikgwanRecord(user.id, uploadDateRef.current, file)
      setUploadStatus('success')
    } catch {
      setUploadStatus('error')
    }

    e.target.value = ''
    setTimeout(() => setUploadStatus('idle'), 2500)
  }

  const modalGames = modalDate ? (games?.filter(g => g.date === modalDate) ?? []) : []

  return (
    <div style={{ paddingBottom: 56 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handlePhotoCapture}
      />

      {uploadStatus !== 'idle' && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 400, background: uploadStatus === 'success' ? '#38a169' : uploadStatus === 'error' ? '#e53e3e' : '#555',
          color: '#fff', borderRadius: 24, padding: '10px 20px', fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
          {uploadStatus === 'uploading' && '📸 업로드 중...'}
          {uploadStatus === 'success' && '✅ 직관 인증 완료!'}
          {uploadStatus === 'error' && '❌ 업로드 실패. 다시 시도해주세요.'}
        </div>
      )}

      {menuDay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }} onClick={() => setMenuDay(null)} />
      )}

      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 20, lineHeight: 1, color: '#333' }}>‹</button>
          <h2 style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: 18 }}>
            {year}년 {month}월 KBO 일정
          </h2>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 20, lineHeight: 1, color: '#333' }}>›</button>
          <button
            onClick={() => setRankingOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 13, color: '#3182ce', fontWeight: 700, lineHeight: 1 }}
          >
            순위
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', padding: '6px 0', fontWeight: 600, fontSize: 13,
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
              const dateStr = day !== null ? toDateStr(year, month, day) : ''
              const isToday = day !== null && dateStr === todayStr
              const isPast = day !== null && dateStr <= todayStr
              const dayGames = day !== null ? allGamesForDay(day) : []
              const featured = myTeamGame(dayGames)
              const hasGames = dayGames.length > 0
              const isMenuOpen = menuDay === dateStr
              const isMyHomeGame = featured !== undefined && myTeamShort !== null && isHomeStadium(featured.stadium, myTeamShort)

              return (
                <div key={i} style={{
                  minHeight: 90, padding: 4, position: 'relative', overflow: 'visible',
                  background: isToday ? '#fffbea' : isMyHomeGame ? '#ebf8ff' : '#fff',
                  border: isToday ? '1px solid #f6c90e' : isMyHomeGame ? '1px solid #bee3f8' : '1px solid #eee',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {day !== null && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{
                          fontSize: 12, fontWeight: isToday ? 700 : 400,
                          color: colIndex === 0 ? '#e53e3e' : colIndex === 6 ? '#3182ce' : '#333',
                        }}>
                          {day}
                        </span>
                        {hasGames && isPast && (
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={e => { e.stopPropagation(); setMenuDay(isMenuOpen ? null : dateStr) }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '0 2px', fontSize: 11, lineHeight: 1, color: '#aaa', letterSpacing: '-1px',
                              }}
                            >
                              &#8942;
                            </button>
                            {isMenuOpen && (
                              <div style={{
                                position: 'absolute', right: 0, top: '100%', zIndex: 300,
                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 110, overflow: 'hidden',
                              }}>
                                <button
                                  onClick={e => { e.stopPropagation(); startJikgwan(dateStr) }}
                                  style={{
                                    display: 'block', width: '100%', padding: '10px 12px',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    textAlign: 'left', fontSize: 12, color: '#333', whiteSpace: 'nowrap',
                                  }}
                                >
                                  📸 직관 인증하기
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {featured && <GameItem game={featured} myTeamShort={myTeamShort} />}

                      {hasGames && (
                        <button
                          onClick={() => setModalDate(dateStr)}
                          style={{
                            marginTop: 'auto', padding: '2px 0', fontSize: 9,
                            color: '#3182ce', background: 'none', border: 'none',
                            cursor: 'pointer', textAlign: 'left',
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
          myTeamShort={myTeamShort}
          onClose={() => setModalDate(null)}
        />
      )}

      <RankingDrawer
        open={rankingOpen}
        favoriteTeam={user?.favorite_team}
        onClose={() => setRankingOpen(false)}
      />

      <TabBar activeTab="calendar" />
    </div>
  )
}

export default KboCalendarActivity
