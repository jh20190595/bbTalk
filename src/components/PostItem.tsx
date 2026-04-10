import { ReactionButtons } from '@/components/ReactionButtons'
import type { Post } from '@/types/supabase'

const TOPIC_COLOR: Record<string, { bg: string; text: string }> = {
  직관: { bg: '#f0f0f0', text: '#555' },
  경기: { bg: '#f0f0f0', text: '#555' },
  선수: { bg: '#f0f0f0', text: '#555' },
  잡담: { bg: '#f0f0f0', text: '#555' },
}

interface PostItemProps {
  post: Post
  showReactions: boolean
  onClick: () => void
}

export function PostItem({ post, showReactions, onClick }: PostItemProps) {
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
