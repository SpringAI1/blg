/**
 * 学习进度工具 —— 统一管理 localStorage 中的学习进度
 * 被 Study.tsx 和 ArticleDetail.tsx 共享使用
 */

const STUDY_KEY = 'learning_progress';

export interface StudyProgress {
  articleId: number;
  status: 'in_progress' | 'completed' | 'paused';
  startedAt: string;
  lastAccessedAt: string;
  progress: number; // 0-100
}

/** 从 localStorage 加载所有学习进度 */
export function loadAllProgress(): Map<number, StudyProgress> {
  try {
    const raw = localStorage.getItem(STUDY_KEY);
    if (!raw) return new Map();
    const data: Record<string, StudyProgress> = JSON.parse(raw);
    const map = new Map<number, StudyProgress>();
    Object.entries(data).forEach(([key, val]) => map.set(Number(key), val));
    return map;
  } catch {
    return new Map();
  }
}

/** 保存单个文章的学习进度增量 */
export function saveProgress(
  articleId: number,
  updates: Partial<StudyProgress>,
  onChanged?: (map: Map<number, StudyProgress>) => void,
) {
  try {
    const raw = localStorage.getItem(STUDY_KEY);
    const data: Record<string, StudyProgress> = raw ? JSON.parse(raw) : {};
    const existing = data[articleId] || {
      articleId,
      status: 'in_progress' as const,
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      progress: 0,
    };
    data[articleId] = { ...existing, ...updates, lastAccessedAt: new Date().toISOString() };
    localStorage.setItem(STUDY_KEY, JSON.stringify(data));
    if (onChanged) onChanged(loadAllProgress());
  } catch {
    // localStorage 不可用时静默失败
  }
}
