import { useEffect, useRef, useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useActivity } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { usePosts } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { TabBar } from '@/components/TabBar'
import { SearchOverlay } from '@/components/SearchOverlay'
import { TeamDrawer } from '@/components/TeamDrawer'
import { PostItem } from '@/components/PostItem'

const PostListActivity: ActivityComponentType = () => {
  const { push, replace } = useFlow()
  const activity = useActivity()
  const user = useAuthStore((s) => s.user)
  const requiresProfileSetup = useAuthStore((s) => s.requiresProfileSetup)

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const prevTeamRef = useRef<string | null>(null)

  const boardKey = selectedTeam ?? '전체'
  const { data: posts, isLoading, isError } = usePosts(boardKey)

  const isOtherTeam = selectedTeam !== null
  const title = selectedTeam ?? '전체 게시판'
  const filteredPosts = searchQuery.trim()
    ? posts?.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.content ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  useEffect(() => {
    if (requiresProfileSetup) push('ProfileSetupActivity', {})
    else if (!user) replace('LoginActivity', {})
  }, [user, requiresProfileSetup, push, replace])

  useEffect(() => {
    if (prevTeamRef.current !== selectedTeam) {
      window.scrollTo(0, 0)
      prevTeamRef.current = selectedTeam
    }
  }, [selectedTeam])

  return (
    <div style={{ paddingBottom: 56 }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#fff', borderBottom: '1px solid #eee',
        height: 52, display: 'flex', alignItems: 'center', padding: '0 16px',
      }}>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0', fontSize: 18, lineHeight: 1, color: '#333' }}
        >
          &#9776;
        </button>
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
            showReactions={isOtherTeam}
            onClick={() => push('PostDetailActivity', { id: post.id, readonly: isOtherTeam ? 'true' : 'false' })}
          />
        ))}
      </ul>

      {!isOtherTeam && activity.isTop && (
        <button
          onClick={() => push('PostCreateActivity', { boardType: 'general' })}
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

      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} onSearch={q => setSearchQuery(q)} />
      )}

      {drawerOpen && (
        <TeamDrawer
          favoriteTeam={user?.favorite_team}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <TabBar activeTab="posts" />
    </div>
  )
}

export default PostListActivity
