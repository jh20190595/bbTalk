import { useState, useRef, useEffect } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useActivity } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { usePost, useDeletePost } from '@/hooks/usePosts'
import { useComments, useCreateComment, useDeleteComment, useCommentReaction, useToggleCommentReaction } from '@/hooks/useComments'
import { useReaction, useToggleReaction } from '@/hooks/useReactions'
import { useAuthStore } from '@/store/authStore'
import type { PollData } from '@/types/supabase'

type Params = { id: string; readonly?: string }

// ────────────────────────────────────────────────────────────
// 투표 표시
// ────────────────────────────────────────────────────────────
function PollView({ poll }: { poll: PollData }) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (poll.multiple) {
        if (next.has(i)) next.delete(i); else next.add(i)
      } else {
        next.clear()
        if (!prev.has(i)) next.add(i)
      }
      return next
    })
  }

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
        <span>&#128202;</span>
        <span>투표</span>
        {poll.multiple && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>복수 선택 가능</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {poll.options.map((opt, i) => {
          const on = selected.has(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                padding: '10px 12px', border: '1px solid',
                borderColor: on ? '#3182ce' : '#e2e8f0',
                borderRadius: 8,
                background: on ? '#ebf8ff' : 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: 14,
                color: on ? '#3182ce' : '#444',
                fontWeight: on ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 13 }}>{poll.multiple ? (on ? '☑' : '☐') : (on ? '●' : '○')}</span>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 3-dot 메뉴
// ────────────────────────────────────────────────────────────
function MoreMenu({ onReport, onBlock }: { onReport: () => void; onBlock: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 18, lineHeight: 1 }}
      >
        &#8942;
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', zIndex: 50,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 100, overflow: 'hidden',
        }}>
          <button
            onClick={() => { onReport(); setOpen(false) }}
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}
          >
            신고
          </button>
          <button
            onClick={() => { onBlock(); setOpen(false) }}
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#e53e3e' }}
          >
            차단
          </button>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 댓글 아이템
// ────────────────────────────────────────────────────────────
import type { Comment } from '@/types/supabase'

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

interface CommentMoreMenuProps {
  isOwn: boolean
  onReply: () => void
  onReport: () => void
  onDelete: () => void
}

function CommentMoreMenu({ isOwn, onReply, onReport, onDelete }: CommentMoreMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 16, color: '#aaa', lineHeight: 1 }}
      >
        &#8942;
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', zIndex: 10,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 100, overflow: 'hidden',
        }}>
          {[
            { label: '답글 쓰기', action: onReply, color: '#333' },
            { label: '신고', action: onReport, color: '#333' },
            ...(isOwn ? [{ label: '삭제', action: onDelete, color: '#e53e3e' }] : []),
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false) }}
              style={{
                display: 'block', width: '100%', padding: '10px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 13, color: item.color,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId: string | undefined
  postId: string
  onReply: (id: string, nickname: string) => void
  isReply?: boolean
}

function CommentItem({ comment, currentUserId, postId, onReply, isReply }: CommentItemProps) {
  const isOwn = comment.user_id === currentUserId
  const { data: reaction } = useCommentReaction(comment.id)
  const { mutate: toggle, isPending } = useToggleCommentReaction()
  const { mutate: del } = useDeleteComment(postId)
  const nickname = comment.profiles?.nickname ?? '알 수 없음'
  const isLiked = reaction?.myReaction === 'like'

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', paddingLeft: isReply ? 32 : 0 }}>
      {/* 닉네임 + 시간  ↔  ... */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{nickname}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>{relativeTime(comment.created_at)}</span>
        </div>
        <CommentMoreMenu
          isOwn={isOwn}
          onReply={() => onReply(comment.id, nickname)}
          onReport={() => alert('신고가 접수되었습니다.')}
          onDelete={() => del(comment.id)}
        />
      </div>
      {/* 내용 */}
      <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5, textAlign: 'left' }}>
        {comment.content}
      </p>
      {/* 좋아요 + 답글 쓰기 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => toggle({ commentId: comment.id, type: 'like' })}
          disabled={isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 13, color: isLiked ? '#e53e3e' : '#888',
          }}
        >
          <span style={{ fontSize: 16 }}>{isLiked ? '♥' : '♡'}</span>
          <span>{reaction?.likeCount ?? 0}</span>
        </button>
        <button
          onClick={() => onReply(comment.id, nickname)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: '#888' }}
        >
          답글 쓰기
        </button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 메인 Activity
// ────────────────────────────────────────────────────────────
const PostDetailActivity: ActivityComponentType<Params> = ({ params }) => {
  const { pop } = useFlow()
  const activity = useActivity()
  const user = useAuthStore((s) => s.user)
  const isReadonly = params.readonly === 'true'

  const { data: post, isLoading, isError } = usePost(params.id)
  const { data: comments } = useComments(params.id)
  const { mutate: deletePost } = useDeletePost()
  const { mutate: createComment, isPending: isCommentPending } = useCreateComment()
  const { data: reaction } = useReaction(params.id)
  const { mutate: toggleReaction, isPending: isReactionPending } = useToggleReaction()

  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)

  function handleReply(id: string, nickname: string) {
    setReplyingTo({ id, nickname })
    setCommentText(`@${nickname} `)
    setTimeout(() => commentInputRef.current?.focus(), 50)
  }

  const slideClass =
    activity.transitionState === 'enter-active' ? 'activity-slide-enter' :
    activity.transitionState === 'exit-active'  ? 'activity-slide-exit'  : ''

  function handleShare() {
    if (navigator.share && post) {
      void navigator.share({ title: post.title, text: post.content })
    } else {
      void navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다.')
    }
  }

  function handleDelete() {
    if (!confirm('삭제하시겠습니까?')) return
    deletePost(params.id, { onSuccess: () => pop() })
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !commentText.trim()) return
    createComment(
      {
        post_id: params.id,
        user_id: user.id,
        content: commentText.trim(),
        parent_comment_id: replyingTo?.id ?? null,
      },
      { onSuccess: () => {
          setCommentText('')
          setReplyingTo(null)
          setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      },
    )
  }

  if (isLoading) return <div style={{ padding: 16 }}>불러오는 중...</div>
  if (isError || !post) return <div style={{ padding: 16 }}>게시글을 찾을 수 없습니다.</div>

  return (
    <div
      className={slideClass}
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        background: '#fff',
        zIndex: 200,
      }}
    >
      {/* 상단 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 8px', height: 52,
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>
        <button
          onClick={() => pop()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 20, lineHeight: 1, color: '#333' }}
        >
          &#8249;
        </button>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </span>
        <button
          onClick={handleShare}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 16, lineHeight: 1, color: '#555' }}
        >
          &#8679;
        </button>
        <MoreMenu
          onReport={() => alert('신고가 접수되었습니다.')}
          onBlock={() => alert('차단되었습니다.')}
        />
      </header>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {/* 글 본문 */}
        <article style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {post.topic && (
                <span style={{ fontSize: 11, color: '#fff', background: '#3182ce', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  {post.topic}
                </span>
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                {post.profiles?.nickname ?? '알 수 없음'}
              </span>
              <time style={{ fontSize: 11, color: '#aaa' }}>
                {new Date(post.created_at).toLocaleString('ko-KR')}
              </time>
            </div>
            {user?.id === post.user_id && (
              <button
                onClick={handleDelete}
                style={{ fontSize: 13, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                삭제
              </button>
            )}
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, textAlign: 'left' }}>{post.title}</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', textAlign: 'left' }}>{post.content}</p>

          {/* 투표 */}
          {post.poll && <PollView poll={post.poll} />}

          {/* 반응 버튼 (readonly일 때) */}
          {isReadonly && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {(['like', 'dislike'] as const).map(type => {
                const isActive = reaction?.myReaction === type
                const count = type === 'like' ? (reaction?.likeCount ?? 0) : (reaction?.dislikeCount ?? 0)
                return (
                  <button
                    key={type}
                    onClick={() => toggleReaction({ postId: params.id, type })}
                    disabled={isReactionPending}
                    style={{
                      padding: '6px 16px', borderRadius: 20, border: '1px solid',
                      fontSize: 13, cursor: 'pointer', background: 'none',
                      borderColor: isActive ? (type === 'like' ? '#3182ce' : '#e53e3e') : '#ddd',
                      color: isActive ? (type === 'like' ? '#3182ce' : '#e53e3e') : '#888',
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {type === 'like' ? '좋아요' : '싫어요'} {count}
                  </button>
                )
              })}
            </div>
          )}
        </article>

        {/* 댓글 목록 */}
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 13, color: '#888', textAlign: 'left', paddingBottom: 4 }}>댓글 {comments?.length ?? 0}개</div>
          {(() => {
            const all = comments ?? []
            const topLevel = all.filter(c => !c.parent_comment_id)
            const repliesMap = all.reduce<Record<string, typeof all>>((acc, c) => {
              if (c.parent_comment_id) {
                ;(acc[c.parent_comment_id] ??= []).push(c)
              }
              return acc
            }, {})
            return topLevel.map(c => (
              <div key={c.id}>
                <CommentItem
                  comment={c}
                  currentUserId={user?.id}
                  postId={params.id}
                  onReply={handleReply}
                />
                {repliesMap[c.id]?.map(r => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    currentUserId={user?.id}
                    postId={params.id}
                    onReply={handleReply}
                    isReply
                  />
                ))}
              </div>
            ))
          })()}
          <div ref={commentsEndRef} />
        </div>
      </div>

      {/* 댓글 입력창 (readonly면 숨김) */}
      {!isReadonly && <form
        onSubmit={handleCommentSubmit}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          borderTop: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        <input
          ref={commentInputRef}
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          style={{
            flex: 1, padding: '8px 12px',
            border: '1px solid #e2e8f0', borderRadius: 20,
            fontSize: 14, outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isCommentPending || !commentText.trim()}
          style={{
            padding: '8px 14px', borderRadius: 20,
            background: commentText.trim() ? '#3182ce' : '#e2e8f0',
            color: commentText.trim() ? '#fff' : '#aaa',
            border: 'none', cursor: commentText.trim() ? 'pointer' : 'default',
            fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}
        >
          등록
        </button>
      </form>}
    </div>
  )
}

export default PostDetailActivity
