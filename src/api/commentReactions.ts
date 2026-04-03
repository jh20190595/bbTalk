import { supabase } from '@/lib/supabase'
import type { ReactionSummary } from '@/api/reactions'

export async function fetchCommentReaction(commentId: string, userId: string): Promise<ReactionSummary> {
  const { data, error } = await supabase
    .from('comment_reactions')
    .select('user_id, type')
    .eq('comment_id', commentId)
  if (error) throw error

  return {
    likeCount: data.filter(r => r.type === 'like').length,
    dislikeCount: data.filter(r => r.type === 'dislike').length,
    myReaction: (data.find(r => r.user_id === userId)?.type ?? null) as ReactionSummary['myReaction'],
  }
}

export async function toggleCommentReaction(
  commentId: string,
  userId: string,
  type: 'like' | 'dislike',
): Promise<void> {
  const { data: existing } = await supabase
    .from('comment_reactions')
    .select('type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.type === type) {
    await supabase.from('comment_reactions').delete()
      .eq('comment_id', commentId).eq('user_id', userId)
  } else {
    await supabase.from('comment_reactions')
      .upsert({ comment_id: commentId, user_id: userId, type })
  }
}
