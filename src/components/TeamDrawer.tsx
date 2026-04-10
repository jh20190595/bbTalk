import { KBO_TEAMS } from '@/constants/teams'

interface TeamDrawerProps {
  favoriteTeam: string | undefined
  selectedTeam: string | null
  onSelect: (team: string | null) => void
  onClose: () => void
}

export function TeamDrawer({ favoriteTeam, selectedTeam, onSelect, onClose }: TeamDrawerProps) {
  const otherTeams = KBO_TEAMS.filter(t => t !== favoriteTeam)
  const items: { label: string; value: string | null }[] = [
    { label: '전체 게시판', value: null },
    ...otherTeams.map(t => ({ label: t, value: t })),
  ]

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', display: 'flex' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 220, height: '100%', background: '#fff',
          display: 'flex', flexDirection: 'column',
          boxShadow: '4px 0 16px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ padding: '20px 16px 12px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid #eee' }}>
          게시판 선택
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {items.map(item => {
            const isActive = item.value === selectedTeam
            return (
              <button
                key={item.label}
                onClick={() => { onSelect(item.value); onClose() }}
                style={{
                  display: 'block', width: '100%', padding: '13px 16px',
                  textAlign: 'left', background: 'none', border: 'none',
                  borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
                  fontSize: 14, fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#3182ce' : '#333',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
