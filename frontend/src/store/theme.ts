import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { theme } from 'antd';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      isDark: false,
      toggle: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
          isDark: state.mode === 'light',
        })),
      setMode: (mode) => set({ mode, isDark: mode === 'dark' }),
    }),
    {
      name: 'blog-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** Ant Design 算法 — 用于 ConfigProvider */
export function getThemeAlgorithm(mode: ThemeMode) {
  return mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;
}
