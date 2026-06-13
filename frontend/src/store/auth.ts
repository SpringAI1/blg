import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** persist 是否已完成从 localStorage 恢复状态 */
  _hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hydrated: false,
      setAuth: (user, token) => {
        // 只存安全的字段，防止圆形引用
        const safeUser = { ...user };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(safeUser));
        set({ user: safeUser, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 排除运行时状态，只持久化必要字段
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          if (state.token && state.user) {
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);
