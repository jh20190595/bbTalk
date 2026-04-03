import { supabase } from '@/lib/supabase'

export interface ReactionSummary {
  likeCount: number
  dislikeCount: number
  myReaction: 'like' | 'dislike' | null
}

export async function fetchReaction(postId: string, userId: string): Promise<ReactionSummary> {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('user_id, type')
    .eq('post_id', postId)
  if (error) throw error

  return {
    likeCount: data.filter(r => r.type === 'like').length,
    dislikeCount: data.filter(r => r.type === 'dislike').length,
    myReaction: (data.find(r => r.user_id === userId)?.type ?? null) as ReactionSummary['myReaction'],
  }
}

export async function toggleReaction(
  postId: string,
  userId: string,
  type: 'like' | 'dislike',
): Promise<void> {
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.type === type) {
    // 같은 타입 → 취소
    await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
  } else {
    // 없거나 다른 타입 → upsert
    await supabase
      .from('post_reactions')
      .upsert({ post_id: postId, user_id: userId, type })
  }
}
