import { supabase } from '@/lib/supabase'
import type { Comment } from '@/types/supabase'

async function attachNicknames(data: Comment[]): Promise<Comment[]> {
  if (data.length === 0) return data
  const userIds = [...new Set(data.map(c => c.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('id, nickname')
    .in('id', userIds)
  const map = Object.fromEntries((users ?? []).map(u => [u.id, u.nickname as string]))
  return data.map(c => ({ ...c, profiles: map[c.user_id] ? { nickname: map[c.user_id] } : undefined }))
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return attachNicknames(data)
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}

export async function createComment(
  comment: Pick<Comment, 'post_id' | 'user_id' | 'content' | 'parent_comment_id'>,
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select('*')
    .single()
  if (error) throw error
  const [result] = await attachNicknames([data])
  return result
}
