/**
 * 通用组件样式
 */
import React from 'react';
import { colors, radius, shadow, space, transition, fontSize, font } from './theme';

type CSS = React.CSSProperties;

/**
 * 卡片样式工厂 — 支持 hover 效果
 */
export const cardStyles: Record<string, CSS> = {
  base: {
    borderRadius: radius.md,
    border: `1px solid ${colors.borderLight}`,
    boxShadow: shadow.sm,
    transition: transition.normal,
  },
  hoverable: {
    cursor: 'pointer',
    transition: `all ${transition.normal}`,
  } as CSS,
};

/**
 * 按钮样式
 */
export const buttonStyles: Record<string, CSS> = {
  primary: {
    borderRadius: radius.sm,
    fontWeight: 500,
    boxShadow: shadow.primary,
  },
  ghost: {
    borderRadius: radius.sm,
    fontWeight: 500,
  },
  iconCircle: {
    width: 48,
    height: 48,
    border: 'none',
  },
};

/**
 * 文章卡片样式
 */
export const articleCard: Record<string, CSS> = {
  container: {
    display: 'flex',
    gap: space.md,
    padding: `${space.md}px 0`,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: space.xs,
    lineHeight: 1.4,
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 1.6,
    marginBottom: space.sm,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  } as CSS,
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md,
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  cover: {
    width: 200,
    height: 130,
    borderRadius: radius.sm,
    objectFit: 'cover' as const,
    flexShrink: 0,
    border: `1px solid ${colors.borderLight}`,
  },
};

/**
 * 文章详情样式
 */
export const articleDetail: Record<string, CSS> = {
  container: {
    maxWidth: 860,
    margin: '0 auto',
    padding: `${space.xl}px ${space.md}px`,
  },
  header: {
    marginBottom: space.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    color: colors.text.primary,
    lineHeight: 1.3,
    marginBottom: space.md,
    letterSpacing: -0.5,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md,
    color: colors.text.tertiary,
    fontSize: fontSize.sm,
    flexWrap: 'wrap' as const,
  },
  content: {
    lineHeight: 1.8,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  actionBar: {
    position: 'sticky' as const,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: space.md,
    padding: `${space.md}px 0`,
  },
};

/**
 * 评论样式
 */
export const commentStyles: Record<string, CSS> = {
  item: {
    padding: `${space.sm}px 0`,
  },
  avatar: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text.primary,
  },
  time: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  content: {
    whiteSpace: 'pre-wrap' as const,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
  },
  replyBox: {
    marginTop: space.sm,
    padding: space.md,
    background: colors.bg.elevated,
    borderRadius: radius.md,
    border: `1px solid ${colors.borderLight}`,
  },
};

/**
 * 会议页面样式
 */
export const meetingStyles: Record<string, CSS> = {
  container: {
    height: 'calc(100vh - 88px)',
    display: 'flex',
    flexDirection: 'column' as const,
    background: `linear-gradient(145deg, #f0f8ff 0%, #e8f4fd 50%, #f0f8ff 100%)`,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.9)',
    borderBottom: `1px solid ${colors.meeting.border}`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  videoArea: {
    flex: 1,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
    alignContent: 'center' as const,
    justifyContent: 'center',
    background: 'rgba(22,119,255,0.04)',
    borderRadius: radius.md,
    padding: space.md,
    border: `1px solid ${colors.meeting.border}`,
  },
  videoTile: {
    position: 'relative' as const,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  localVideo: {
    border: `2px solid ${colors.accent.blue}`,
    boxShadow: shadow.blue,
  },
  remoteVideo: {
    border: `1px solid ${colors.meeting.border}`,
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    padding: '4px 0',
  },
  controlBtn: (active: boolean) => ({
    background: active ? colors.accent.blue : colors.meeting.border,
    color: active ? colors.neutral[100] : colors.meeting.grayText,
  }),
  chatPanel: {
    width: 320,
    background: 'rgba(255,255,255,0.9)',
    borderLeft: `1px solid ${colors.meeting.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  chatMessage: (type: string) => ({
    marginBottom: 6,
    padding: '6px 10px',
    borderRadius: radius.sm,
    fontSize: 13,
    background:
      type === 'CHAT' ? colors.meeting.grayLight :
      type === 'SYSTEM' ? '#e6f0ff' : '#e6fff0',
    color: type === 'CHAT' ? '#2c3e50' : colors.meeting.grayText,
  }),
  joinOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: colors.meeting.overlay,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  joinCard: {
    textAlign: 'center' as const,
    padding: space.xl,
    borderRadius: radius.lg,
    maxWidth: 420,
    boxShadow: shadow.meeting,
  },
};

/**
 * 表单 & 编辑器样式
 */
export const formStyles: Record<string, CSS> = {
  section: {
    marginBottom: space.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: space.xs,
    display: 'block',
  },
};
