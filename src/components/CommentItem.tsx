import { useState, useRef, useEffect } from 'react'
import { useCommentReaction, useToggleCommentReaction, useDeleteComment } from '@/hooks/useComments'
import { relativeTime } from '@/utils/time'
import type { Comment } from '@/types/supabase'

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

export interface CommentItemProps {
  comment: Comment
  currentUserId: string | undefined
  postId: string
  onReply: (id: string, nickname: string) => void
  isReply?: boolean
}

export function CommentItem({ comment, currentUserId, postId, onReply, isReply }: CommentItemProps) {
  const isOwn = comment.user_id === currentUserId
  const { data: reaction } = useCommentReaction(comment.id)
  const { mutate: toggle, isPending } = useToggleCommentReaction()
  const { mutate: del } = useDeleteComment(postId)
  const nickname = comment.profiles?.nickname ?? '알 수 없음'
  const isLiked = reaction?.myReaction === 'like'

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', paddingLeft: isReply ? 32 : 0 }}>
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
      <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5, textAlign: 'left' }}>
        {comment.content}
      </p>
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
