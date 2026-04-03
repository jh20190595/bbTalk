import type { ActivityComponentType } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { usePosts } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { TabBar } from '@/components/TabBar'

const TOPIC_COLOR: Record<string, { bg: string; text: string }> = {
  직관: { bg: '#fff3e0', text: '#e65100' },
  경기: { bg: '#e3f2fd', text: '#1565c0' },
  선수: { bg: '#e8f5e9', text: '#2e7d32' },
  잡담: { bg: '#f3e5f5', text: '#6a1b9a' },
}

const MyTeamPostsActivity: ActivityComponentType = () => {
  const { push } = useFlow()
  const user = useAuthStore((s) => s.user)
  const { data: posts, isLoading, isError } = usePosts(user?.favorite_team)

  return (
    <div style={{ paddingBottom: 56 }}>
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>{user?.favorite_team ?? '내 팀'} 게시판</h1>
        <button onClick={() => push('PostCreateActivity', { boardType: 'team' })}>글쓰기</button>
      </div>

      {isLoading && <div style={{ padding: 16 }}>불러오는 중...</div>}
      {isError && <div style={{ padding: 16 }}>게시글을 불러올 수 없습니다.</div>}
      {posts?.length === 0 && !isLoading && <p style={{ padding: 16, color: '#888' }}>게시글이 없습니다.</p>}

      <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px' }}>
        {posts?.map((post) => {
          const topicStyle = post.topic ? (TOPIC_COLOR[post.topic] ?? { bg: '#f5f5f5', text: '#555' }) : null
          return (
            <li
              key={post.id}
              onClick={() => push('PostDetailActivity', { id: post.id })}
              style={{ cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #eee' }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {topicStyle && (
                  <span style={{
                    fontSize: 11, padding: '2px 7px', borderRadius: 10, flexShrink: 0,
                    background: topicStyle.bg, color: topicStyle.text, fontWeight: 600,
                  }}>
                    {post.topic}
                  </span>
                )}
                <strong style={{ flex: 1, fontSize: 14 }}>{post.title}</strong>
                <time style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </time>
              </div>
            </li>
          )
        })}
      </ul>

      <TabBar activeTab="myteam" />
    </div>
  )
}

export default MyTeamPostsActivity
