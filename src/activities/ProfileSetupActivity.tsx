import { useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useMutation } from '@tanstack/react-query'
import { useFlow } from '@/stackflow'
import { supabase } from '@/lib/supabase'
import { fetchUserProfile } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { KBO_TEAMS } from '@/constants/teams'

const ProfileSetupActivity: ActivityComponentType = () => {
  const { replace } = useFlow()
  const { setUser, setRequiresProfileSetup } = useAuthStore()
  const [nickname, setNickname] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')

  const { mutate: setupProfile, isPending, error } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('인증 정보가 없습니다.')

      const { error } = await supabase.from('users').insert({
        id: user.id,
        nickname,
        favorite_team: favoriteTeam,
      })
      if (error) throw error

      return fetchUserProfile(user.id)
    },
    onSuccess: (profile) => {
      setUser(profile)
      setRequiresProfileSetup(false)
      replace('PostListActivity', {})
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setupProfile()
  }

  return (
    <div>
      <h1>프로필 설정</h1>
      <p>서비스 이용을 위해 프로필을 설정해주세요.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <div>
          <label>응원 팀</label>
          <select
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            required
          >
            <option value="" disabled>팀을 선택하세요</option>
            {KBO_TEAMS.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {error && <p>{error.message}</p>}

        <button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : '시작하기'}
        </button>
      </form>
    </div>
  )
}

export default ProfileSetupActivity
