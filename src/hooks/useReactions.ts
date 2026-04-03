import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchReaction, toggleReaction } from '@/api/reactions'
import { useAuthStore } from '@/store/authStore'

export function useReaction(postId: string) {
  const userId = useAuthStore((s) => s.user?.id ?? '')
  return useQuery({
    queryKey: ['reaction', postId, userId],
    queryFn: () => fetchReaction(postId, userId),
    enabled: !!userId,
  })
}

export function useToggleReaction() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id ?? '')
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: 'like' | 'dislike' }) =>
      toggleReaction(postId, userId, type),
    onSuccess: (_data, { postId }) => {
      void queryClient.invalidateQueries({ queryKey: ['reaction', postId, userId] })
    },
  })
}
