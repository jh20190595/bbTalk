import { useEffect } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useFlow } from '@/stackflow'
import { useAuthStore } from '@/store/authStore'
import { signInWithOAuth } from '@/api/auth'

const LoginActivity: ActivityComponentType = () => {
  const { replace, push } = useFlow()
  const user = useAuthStore((s) => s.user)
  const requiresProfileSetup = useAuthStore((s) => s.requiresProfileSetup)

  useEffect(() => {
    if (requiresProfileSetup) {
      push('ProfileSetupActivity', {})
    } else if (user) {
      replace('PostListActivity', {})
    }
  }, [user, requiresProfileSetup, replace, push])

  return (
    <div>
      <h1>로그인</h1>
      <button onClick={() => void signInWithOAuth('google')}>Google로 계속하기</button>
      <button onClick={() => void signInWithOAuth('kakao')}>카카오로 계속하기</button>
    </div>
  )
}

export default LoginActivity
