import { useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useActivity } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { usePosts } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { TabBar } from '@/components/TabBar'
import { SearchOverlay } from '@/components/SearchOverlay'
import type { Post } from '@/types/supabase'

const TOPIC_COLOR: Record<string, { bg: string; text: string }> = {
  직관: { bg: '#f0f0f0', text: '#555' },
  경기: { bg: '#f0f0f0', text: '#555' },
  선수: { bg: '#f0f0f0', text: '#555' },
  잡담: { bg: '#f0f0f0', text: '#555' },
}

interface PostItemProps {
  post: Post
  onClick: () => void
}

function PostItem({ post, onClick }: PostItemProps) {
  const topicStyle = post.topic ? (TOPIC_COLOR[post.topic] ?? { bg: '#f0f0f0', text: '#555' }) : null

  return (
    <li
      onClick={onClick}
      style={{ padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}
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
}

const MyTeamPostsActivity: ActivityComponentType = () => {
  const { push } = useFlow()
  const activity = useActivity()
  const user = useAuthStore((s) => s.user)
  const { data: posts, isLoading, isError } = usePosts(user?.favorite_team)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const title = user?.favorite_team ? `${user.favorite_team} 게시판` : '내 팀 게시판'

  const filteredPosts = searchQuery.trim()
    ? posts?.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.content ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  return (
    <div style={{ paddingBottom: 56 }}>
      {/* 헤더 */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#fff', borderBottom: '1px solid #eee',
        height: 52, display: 'flex', alignItems: 'center', padding: '0 16px',
      }}>
        <h1 style={{
          flex: 1, margin: 0, fontSize: 16, fontWeight: 700,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {searchQuery.trim() ? `"${searchQuery}" 검색 결과` : title}
        </h1>
        <button
          onClick={() => setSearchOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#333' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      {/* 목록 */}
      {isLoading && <div style={{ padding: 16 }}>불러오는 중...</div>}
      {isError && <div style={{ padding: 16 }}>게시글을 불러올 수 없습니다.</div>}
      {filteredPosts?.length === 0 && !isLoading && (
        <p style={{ padding: 16, color: '#888' }}>
          {searchQuery.trim() ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
        </p>
      )}

      <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px' }}>
        {filteredPosts?.map(post => (
          <PostItem
            key={post.id}
            post={post}
            onClick={() => push('PostDetailActivity', { id: post.id, readonly: 'false' })}
          />
        ))}
      </ul>

      {/* 글쓰기 FAB */}
      {activity.isTop && (
        <button
          onClick={() => push('PostCreateActivity', { boardType: 'team' })}
          style={{
            position: 'fixed', bottom: 72, right: 20, zIndex: 100,
            width: 64, height: 64, borderRadius: '50%',
            background: '#3182ce', color: '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontSize: 10, fontWeight: 700, gap: 2,
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
          <span>글쓰기</span>
        </button>
      )}

      {/* 검색 오버레이 */}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onSearch={q => setSearchQuery(q)}
        />
      )}

      <TabBar activeTab="myteam" />
    </div>
  )
}

export default MyTeamPostsActivity
