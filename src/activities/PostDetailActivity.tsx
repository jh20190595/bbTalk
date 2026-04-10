import { useState, useRef } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useActivity } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { usePost, useDeletePost, useUpdatePost } from '@/hooks/usePosts'
import { useComments, useCreateComment } from '@/hooks/useComments'
import { useReaction, useToggleReaction } from '@/hooks/useReactions'
import { useAuthStore } from '@/store/authStore'
import { PollView } from '@/components/PollView'
import { MoreMenu } from '@/components/MoreMenu'
import { CommentItem } from '@/components/CommentItem'

type Params = { id: string; readonly?: string }

const PostDetailActivity: ActivityComponentType<Params> = ({ params }) => {
  const { pop } = useFlow()
  const activity = useActivity()
  const user = useAuthStore((s) => s.user)
  const isReadonly = params.readonly === 'true'

  const { data: post, isLoading, isError } = usePost(params.id)
  const { data: comments } = useComments(params.id)
  const { mutate: deletePost } = useDeletePost()
  const { mutate: updatePost, isPending: isUpdatePending } = useUpdatePost()
  const { mutate: createComment, isPending: isCommentPending } = useCreateComment()
  const { data: reaction } = useReaction(params.id)
  const { mutate: toggleReaction, isPending: isReactionPending } = useToggleReaction()

  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
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

  function handleEditOpen() {
    setEditTitle(post?.title ?? '')
    setEditContent(post?.content ?? '')
    setEditMode(true)
  }

  function handleEditSave() {
    if (!editTitle.trim() || !editContent.trim()) return
    updatePost(
      { id: params.id, title: editTitle.trim(), content: editContent.trim() },
      { onSuccess: () => setEditMode(false) },
    )
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
      {
        onSuccess: () => {
          setCommentText('')
          setReplyingTo(null)
          setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        },
      },
    )
  }

  if (isLoading) return <div style={{ padding: 16 }}>불러오는 중...</div>
  if (isError || !post) return <div style={{ padding: 16 }}>게시글을 찾을 수 없습니다.</div>

  const all = comments ?? []
  const topLevel = all.filter(c => !c.parent_comment_id)
  const repliesMap = all.reduce<Record<string, typeof all>>((acc, c) => {
    if (c.parent_comment_id) {
      ;(acc[c.parent_comment_id] ??= []).push(c)
    }
    return acc
  }, {})

  return (
    <div
      className={slideClass}
      style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#fff', zIndex: 200 }}
    >
      {/* 상단 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 8px', height: 52, borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        {editMode ? (
          <>
            <button
              onClick={() => setEditMode(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 14, color: '#888' }}
            >
              취소
            </button>
            <span style={{ flex: 1, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>게시글 수정</span>
            <button
              onClick={handleEditSave}
              disabled={isUpdatePending || !editTitle.trim() || !editContent.trim()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                fontSize: 14, fontWeight: 700,
                color: editTitle.trim() && editContent.trim() ? '#3182ce' : '#aaa',
              }}
            >
              {isUpdatePending ? '저장 중...' : '완료'}
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </header>

      {/* 수정 폼 */}
      {editMode && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="제목"
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="내용"
            rows={12}
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 15, lineHeight: 1.7, outline: 'none', resize: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* 스크롤 영역 */}
      {!editMode && <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
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
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleEditOpen}
                  style={{ fontSize: 13, color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  style={{ fontSize: 13, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, textAlign: 'left' }}>{post.title}</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', textAlign: 'left' }}>{post.content}</p>

          {post.photos && post.photos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {post.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`사진 ${i + 1}`}
                  style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              ))}
            </div>
          )}

          {post.poll && <PollView poll={post.poll} />}

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
          <div style={{ fontSize: 13, color: '#888', textAlign: 'left', paddingBottom: 4 }}>댓글 {all.length}개</div>
          {topLevel.map(c => (
            <div key={c.id}>
              <CommentItem comment={c} currentUserId={user?.id} postId={params.id} onReply={handleReply} />
              {repliesMap[c.id]?.map(r => (
                <CommentItem key={r.id} comment={r} currentUserId={user?.id} postId={params.id} onReply={handleReply} isReply />
              ))}
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
      </div>}

      {/* 댓글 입력창 */}
      {!isReadonly && !editMode && (
        <form
          onSubmit={handleCommentSubmit}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderTop: '1px solid #e2e8f0', flexShrink: 0,
          }}
        >
          <input
            ref={commentInputRef}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 14, outline: 'none' }}
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
        </form>
      )}
    </div>
  )
}

export default PostDetailActivity
