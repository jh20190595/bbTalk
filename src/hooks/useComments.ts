import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchComments, createComment, updateComment, deleteComment } from '@/api/comments'
import { fetchCommentReaction, toggleCommentReaction } from '@/api/commentReactions'
import { useAuthStore } from '@/store/authStore'
import type { Comment } from '@/types/supabase'

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (comment: Pick<Comment, 'post_id' | 'user_id' | 'content' | 'parent_comment_id'>) =>
      createComment(comment),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['comments', data.post_id] })
    },
  })
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useCommentReaction(commentId: string) {
  const userId = useAuthStore((s) => s.user?.id ?? '')
  return useQuery({
    queryKey: ['comment-reaction', commentId, userId],
    queryFn: () => fetchCommentReaction(commentId, userId),
    enabled: !!userId,
  })
}

export function useToggleCommentReaction() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id ?? '')
  return useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' }) =>
      toggleCommentReaction(commentId, userId, type),
    onSuccess: (_data, { commentId }) => {
      void queryClient.invalidateQueries({ queryKey: ['comment-reaction', commentId, userId] })
    },
  })
}
