import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/supabase'

export async function fetchPosts(team?: string): Promise<Post[]> {
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (team) query = query.eq('team', team)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error

  const { data: profile } = await supabase
    .from('users')
    .select('nickname')
    .eq('id', data.user_id)
    .single()

  return { ...data, profiles: profile ?? undefined }
}

export async function createPost(
  post: Omit<Post, 'id' | 'created_at'>,
): Promise<Post> {
  const { data, error } = await supabase.from('posts').insert(post).select().single()
  if (error) throw error
  return data
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}
