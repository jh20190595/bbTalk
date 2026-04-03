import { create } from 'zustand'
import type { User } from '@/types/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  requiresProfileSetup: boolean
  setUser: (user: User | null) => void
  setIsLoading: (isLoading: boolean) => void
  setRequiresProfileSetup: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  requiresProfileSetup: false,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setRequiresProfileSetup: (v) => set({ requiresProfileSetup: v }),
}))
