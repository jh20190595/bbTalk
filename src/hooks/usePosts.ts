import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPost, fetchPosts, createPost, updatePost, deletePost } from '@/api/posts'
import type { Post } from '@/types/supabase'

export function usePosts(team?: string) {
  return useQuery({
    queryKey: ['posts', team ?? 'all'],
    queryFn: () => fetchPosts(team),
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (post: Omit<Post, 'id' | 'created_at'>) => createPost(post),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title, content }: { id: string; title: string; content: string }) =>
      updatePost(id, { title, content }),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['posts', id] })
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
