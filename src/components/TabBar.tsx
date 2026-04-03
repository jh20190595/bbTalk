import { useFlow } from '@/stackflow'

export type TabId = 'posts' | 'myteam' | 'calendar' | 'record' | 'mypage'

const TABS: { id: TabId; label: string; activity: string }[] = [
  { id: 'posts',    label: '홈', activity: 'PostListActivity' },
  { id: 'myteam',  label: '내 팀',       activity: 'MyTeamPostsActivity' },
  { id: 'calendar',label: '경기 일정',   activity: 'KboCalendarActivity' },
  { id: 'record',  label: '직관',        activity: 'GameRecordActivity' },
  { id: 'mypage',  label: '마이페이지',  activity: 'MyPageActivity' },
]

interface TabBarProps {
  activeTab: TabId
}

export function TabBar({ activeTab }: TabBarProps) {
  const { replace } = useFlow()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 56,
      display: 'flex',
      borderTop: '1px solid #e2e8f0',
      background: '#fff',
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id !== activeTab) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                replace(tab.activity as any, {} as any)
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? '#3182ce' : '#888',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: 0,
            }}
          >
            {tab.label}

          </button>
        )
      })}
    </nav>
  )
}
