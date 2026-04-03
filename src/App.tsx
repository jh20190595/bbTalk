import { useEffect, Suspense } from 'react'
import { Stack } from '@/stackflow'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { fetchUserProfile } from '@/api/auth'
import type { User } from '@/types/supabase'
import type { Session } from '@supabase/supabase-js'

async function resolveSession(
  session: Session | null,
  setUser: (u: User | null) => void,
  setRequiresProfileSetup: (v: boolean) => void,
  setIsLoading: (v: boolean) => void,
) {
  if (session?.user) {
    try {
      const profile = await fetchUserProfile(session.user.id)
      setUser(profile)
      setRequiresProfileSetup(false)
    } catch {
      setUser(null)
      setRequiresProfileSetup(true)
    }
  } else {
    setUser(null)
    setRequiresProfileSetup(false)
  }
  setIsLoading(false)
}

function App() {
  const { setUser, setIsLoading, setRequiresProfileSetup } = useAuthStore()
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const requiresProfileSetup = useAuthStore((s) => s.requiresProfileSetup)

  useEffect(() => {
    // 초기 세션 — INITIAL_SESSION 이벤트에 의존하지 않음 (StrictMode 이중 실행 대응)
    supabase.auth.getSession().then(({ data: { session } }) => {
      void resolveSession(session, setUser, setRequiresProfileSetup, setIsLoading)
    })

    // 이후 인증 상태 변경 (로그인/로그아웃/토큰 갱신)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') return
        void resolveSession(session, setUser, setRequiresProfileSetup, setIsLoading)
      },
    )

    return () => subscription.unsubscribe()
  }, [setUser, setIsLoading, setRequiresProfileSetup])

  if (isAuthLoading) return null

  if (requiresProfileSetup && window.location.pathname !== '/profile/setup') {
    window.history.replaceState({}, '', '/profile/setup')
  } else if (!user && !requiresProfileSetup && window.location.pathname !== '/login') {
    window.history.replaceState({}, '', '/login')
  }

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <Stack />
    </Suspense>
  )
}

export default App
