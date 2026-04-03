import type { ActivityComponentType } from '@stackflow/react'
import { TabBar } from '@/components/TabBar'

const GameRecordActivity: ActivityComponentType = () => {
  return (
    <div style={{ paddingBottom: 56 }}>
      <div style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>직관 기록</h1>
      </div>

      <div style={{ padding: 16, color: '#888', textAlign: 'center', marginTop: 40 }}>
        직관 기록 기능이 준비 중입니다.
      </div>

      <TabBar activeTab="record" />
    </div>
  )
}

export default GameRecordActivity
