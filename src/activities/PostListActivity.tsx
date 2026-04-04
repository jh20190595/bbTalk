import { useEffect, useRef, useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useActivity } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { usePosts } from '@/hooks/usePosts'
import { useReaction, useToggleReaction } from '@/hooks/useReactions'
import { useAuthStore } from '@/store/authStore'
import { TabBar } from '@/components/TabBar'
import { SearchOverlay } from '@/components/SearchOverlay'
import { KBO_TEAMS } from '@/constants/teams'
import type { Post } from '@/types/supabase'

// ────────────────────────────────────────────────────────────
// 사이드 드로어 (팀 목록)
// ────────────────────────────────────────────────────────────
interface TeamDrawerProps {
  favoriteTeam: string | undefined
  selectedTeam: string | null
  onSelect: (team: string | null) => void
  onClose: () => void
}

function TeamDrawer({ favoriteTeam, selectedTeam, onSelect, onClose }: TeamDrawerProps) {
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

// ────────────────────────────────────────────────────────────
// 좋아요 / 싫어요 버튼
// ────────────────────────────────────────────────────────────
function ReactionButtons({ postId }: { postId: string }) {
  const { data } = useReaction(postId)
  const { mutate: toggle, isPending } = useToggleReaction()

  function handleClick(e: React.MouseEvent, type: 'like' | 'dislike') {
    e.stopPropagation()
    toggle({ postId, type })
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
      <button
        onClick={e => handleClick(e, 'like')}
        disabled={isPending}
        style={{
          padding: '3px 10px', borderRadius: 12, border: '1px solid',
          fontSize: 12, cursor: 'pointer', background: 'none',
          borderColor: data?.myReaction === 'like' ? '#3182ce' : '#ddd',
          color: data?.myReaction === 'like' ? '#3182ce' : '#888',
          fontWeight: data?.myReaction === 'like' ? 700 : 400,
        }}
      >
        좋아요 {data?.likeCount ?? 0}
      </button>
      <button
        onClick={e => handleClick(e, 'dislike')}
        disabled={isPending}
        style={{
          padding: '3px 10px', borderRadius: 12, border: '1px solid',
          fontSize: 12, cursor: 'pointer', background: 'none',
          borderColor: data?.myReaction === 'dislike' ? '#e53e3e' : '#ddd',
          color: data?.myReaction === 'dislike' ? '#e53e3e' : '#888',
          fontWeight: data?.myReaction === 'dislike' ? 700 : 400,
        }}
      >
        싫어요 {data?.dislikeCount ?? 0}
      </button>
    </div>
  )
}

const TOPIC_COLOR: Record<string, { bg: string; text: string }> = {
  직관: { bg: '#f0f0f0', text: '#555' },
  경기: { bg: '#f0f0f0', text: '#555' },
  선수: { bg: '#f0f0f0', text: '#555' },
  잡담: { bg: '#f0f0f0', text: '#555' },
}

// ────────────────────────────────────────────────────────────
// 게시글 아이템
// ────────────────────────────────────────────────────────────
interface PostItemProps {
  post: Post
  showReactions: boolean
  onClick: () => void
}

function PostItem({ post, showReactions, onClick }: PostItemProps) {
  const topicStyle = post.topic ? (TOPIC_COLOR[post.topic] ?? { bg: '#f5f5f5', text: '#555' }) : null

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
      {showReactions && <ReactionButtons postId={post.id} />}
    </li>
  )
}

// ────────────────────────────────────────────────────────────
// 메인 Activity
// ────────────────────────────────────────────────────────────
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

  // 팀 변경 시 목록 맨 위로
  useEffect(() => {
    if (prevTeamRef.current !== selectedTeam) {
      window.scrollTo(0, 0)
      prevTeamRef.current = selectedTeam
    }
  }, [selectedTeam])

  return (
    <div style={{ paddingBottom: 56 }}>
      {/* 헤더 */}
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
            showReactions={isOtherTeam}
            onClick={() => push('PostDetailActivity', {
              id: post.id,
              readonly: isOtherTeam ? 'true' : 'false',
            })}
          />
        ))}
      </ul>

      {/* 글쓰기 FAB */}
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

      {/* 검색 오버레이 */}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onSearch={q => setSearchQuery(q)}
        />
      )}

      {/* 드로어 */}
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
