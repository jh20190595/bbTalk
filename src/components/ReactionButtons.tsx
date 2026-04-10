import { useReaction, useToggleReaction } from '@/hooks/useReactions'

export function ReactionButtons({ postId }: { postId: string }) {
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
