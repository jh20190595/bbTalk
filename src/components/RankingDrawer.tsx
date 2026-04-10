import { TeamRankingTable } from '@/components/TeamRankingTable'

interface RankingDrawerProps {
  open: boolean
  favoriteTeam: string | undefined
  onClose: () => void
}

export function RankingDrawer({ open, favoriteTeam, onClose }: RankingDrawerProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#fff',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 8px', height: 52,
        borderBottom: '1px solid #eee', flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 20, lineHeight: 1, color: '#333' }}
        >
          &#8249;
        </button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 16 }}>KBO 순위</span>
      </div>

      {/* 순위 테이블 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <TeamRankingTable favoriteTeam={favoriteTeam} />
      </div>
    </div>
  )
}
