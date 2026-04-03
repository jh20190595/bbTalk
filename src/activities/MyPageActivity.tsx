import type { ActivityComponentType } from '@stackflow/react'
import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/api/auth'
import { TabBar } from '@/components/TabBar'

const MyPageActivity: ActivityComponentType = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div style={{ paddingBottom: 56 }}>
      <div style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>마이페이지</h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>닉네임</div>
          <div style={{ fontWeight: 600 }}>{user?.nickname}</div>
        </div>
        <div style={{ padding: 16, background: '#f7f7f7', borderRadius: 8 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>응원 팀</div>
          <div style={{ fontWeight: 600 }}>{user?.favorite_team}</div>
        </div>

        <button
          onClick={() => void signOut()}
          style={{
            marginTop: 8,
            padding: '12px',
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            cursor: 'pointer',
            color: '#e53e3e',
            fontWeight: 600,
          }}
        >
          로그아웃
        </button>
      </div>

      <TabBar activeTab="mypage" />
    </div>
  )
}

export default MyPageActivity
