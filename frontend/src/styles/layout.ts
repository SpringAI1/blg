/**
 * 布局相关样式 — 页面容器、顶部导航、侧边栏
 */
import React from 'react';
import { colors, radius, shadow, space, transition, fontSize, font } from './theme';

// 通用的 React.CSSProperties 类型
type CSS = React.CSSProperties;

export const layout: Record<string, CSS> = {
  /** 页面容器 — 最大宽度1200px，居中 */
  pageContainer: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: `${space.lg}px ${space.md}px`,
  },

  /** 白色卡片容器 */
  pageCard: {
    background: colors.neutral[100],
    borderRadius: radius.md,
    border: `1px solid ${colors.borderLight}`,
    boxShadow: shadow.sm,
    padding: space.lg,
  },

  /** 页面标题栏 */
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
    flexWrap: 'wrap' as const,
    gap: space.md,
  },

  /** 内容区域 */
  contentArea: {
    maxWidth: 1200,
    margin: '0 auto',
    minHeight: 'calc(100vh - 60px)',
  },

  /** 顶部导航栏 */
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    padding: '0 12px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${colors.borderLight}`,
    height: 60,
  },

  headerMobile: {
    height: 50,
  },

  /** 页眉内部容器 */
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1400,
    margin: '0 auto',
    height: '100%',
  },

  /** 品牌 Logo */
  logo: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 700,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  /** 桌面侧边栏 */
  sidebar: {
    position: 'sticky' as const,
    top: 60,
    height: 'calc(100vh - 60px)',
    overflow: 'auto',
    borderRight: `1px solid ${colors.borderLight}`,
    background: colors.neutral[100],
    paddingTop: 4,
  },

  /** 侧边栏菜单项 */
  menuSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: 600,
    color: colors.text.tertiary,
    padding: `${space.sm}px ${space.md}px`,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  /** 分割线（带文字） */
  divider: (label?: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    color: colors.text.tertiary,
    fontSize: fontSize.xs,
    padding: `0 ${space.md}px`,
    margin: `${space.sm}px 0`,
    ...(label ? {
      '&::before, &::after': {
        content: '""',
        flex: 1,
        height: 1,
        background: colors.borderLight,
      },
    } : {}),
  } as CSS),
};

/** 弹性布局工具 */
export const flex: Record<string, CSS> = {
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  rowBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  colCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: space.md,
  },
};

/** 间距工具 */
export const spacing = {
  mt: (n: number): CSS => ({ marginTop: n }),
  mb: (n: number): CSS => ({ marginBottom: n }),
  ml: (n: number): CSS => ({ marginLeft: n }),
  mr: (n: number): CSS => ({ marginRight: n }),
  mx: (n: number): CSS => ({ marginLeft: n, marginRight: n }),
  my: (n: number): CSS => ({ marginTop: n, marginBottom: n }),
  pt: (n: number): CSS => ({ paddingTop: n }),
  pb: (n: number): CSS => ({ paddingBottom: n }),
  pl: (n: number): CSS => ({ paddingLeft: n }),
  pr: (n: number): CSS => ({ paddingRight: n }),
  px: (n: number): CSS => ({ paddingLeft: n, paddingRight: n }),
  py: (n: number): CSS => ({ paddingTop: n, paddingBottom: n }),
  gap: (n: number): CSS => ({ gap: n }),
};
