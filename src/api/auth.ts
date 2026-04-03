import { supabase } from '@/lib/supabase'
import type { User } from '@/types/supabase'

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(
  email: string,
  password: string,
  nickname: string,
  favoriteTeam: string,
): Promise<void> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('회원가입에 실패했습니다.')

  const { error: profileError } = await supabase.from('users').insert({
    id: data.user.id,
    nickname,
    favorite_team: favoriteTeam,
  })
  if (profileError) throw profileError
}

export async function signInWithOAuth(provider: 'kakao' | 'google'): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function fetchUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as User
}
