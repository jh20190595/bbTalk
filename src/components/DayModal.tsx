import { ModalGameItem } from '@/components/GameItem'
import { formatDate } from '@/utils/calendar'
import type { Game } from '@/hooks/useKboSchedule'

interface DayModalProps {
  dateStr: string
  games: Game[]
  myTeamShort: string | null
  onClose: () => void
}

export function DayModal({ dateStr, games, myTeamShort, onClose }: DayModalProps) {
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
          width: '100%', background: '#fff',
          borderRadius: '16px 16px 0 0',
          padding: '20px 16px 40px',
          maxHeight: '70vh', overflowY: 'auto',
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
          {games.map((g, i) => <ModalGameItem key={i} game={g} myTeamShort={myTeamShort} />)}
        </div>
      </div>
    </div>
  )
}
