/**
 * 设计令牌中心 — 现代简洁风 (Modern Clean)
 * 所有样式常量统一管理
 */
export const colors = {
  // 主色 — 温暖橙色
  primary: '#ff6b00',
  primaryLight: '#ff8c38',
  primaryDark: '#e05e00',
  primaryBg: 'rgba(255, 107, 0, 0.06)',
  primaryBgHover: 'rgba(255, 107, 0, 0.12)',

  // 品牌辅助色
  accent: {
    blue: '#1677ff',
    green: '#52c41a',
    purple: '#722ed1',
    red: '#ff4d4f',
    gold: '#faad14',
    cyan: '#13c2c2',
  },

  // 中性色
  neutral: {
    100: '#ffffff',
    200: '#f8f9fa',
    300: '#f0f2f5',
    400: '#e8e8e8',
    500: '#d0d0d0',
    600: '#a0a0b0',
    700: '#8e90a6',
    800: '#555770',
    900: '#1a1a2e',
  },

  // 会议主题色
  meeting: {
    blueLight: '#e6f4ff',
    blueMain: '#1677ff',
    blueDark: '#1a3a5c',
    grayLight: '#f5f9ff',
    grayText: '#8899aa',
    greenBg: '#e6fff0',
    border: '#d0e4f5',
    overlay: 'rgba(22, 119, 255, 0.15)',
  },

  // 文字色
  text: {
    primary: '#1a1a2e',
    secondary: '#555770',
    tertiary: '#8e90a6',
    disabled: '#c0c0d0',
  },

  // 背景
  bg: {
    page: '#f0f2f5',
    card: '#ffffff',
    elevated: '#fafafa',
    hover: '#f5f5f5',
  },

  // 边框
  border: '#e8e8e8',
  borderLight: '#f0f0f0',
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 16,
  xl: 20,
  round: '50%' as const,
};

export const shadow = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 60px rgba(0, 0, 0, 0.10)',
  primary: '0 2px 6px rgba(255, 107, 0, 0.25)',
  blue: '0 2px 12px rgba(22, 119, 255, 0.15)',
  meeting: '0 20px 60px rgba(22, 119, 255, 0.20)',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  hero: 34,
};

export const font = {
  sans: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

export const transition = {
  fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
};

/** 用于 Ant Design ConfigProvider 的完整主题配置 */
export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorLink: colors.primary,
    colorSuccess: colors.accent.green,
    colorWarning: colors.accent.gold,
    colorError: colors.accent.red,
    colorInfo: colors.accent.blue,
    borderRadius: radius.sm,
    borderRadiusLG: radius.sm,
    fontFamily: font.sans,
    colorBgLayout: colors.bg.page,
    colorBgContainer: colors.bg.card,
    colorBgElevated: colors.bg.elevated,
    colorTextBase: colors.text.primary,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.tertiary,
    colorTextQuaternary: colors.text.disabled,
    colorBorder: colors.border,
    colorBorderSecondary: colors.borderLight,
    colorFill: 'rgba(0, 0, 0, 0.04)',
    colorFillSecondary: 'rgba(0, 0, 0, 0.02)',
    boxShadow: shadow.sm,
    boxShadowSecondary: shadow.md,
    boxShadowTertiary: shadow.sm,
    fontSize: fontSize.base,
    fontSizeLG: fontSize.md,
    fontSizeSM: fontSize.sm,
    fontSizeXL: fontSize.lg,
    fontSizeHeading1: fontSize.xxxl,
    fontSizeHeading2: fontSize.xxl,
    fontSizeHeading3: fontSize.xl,
    fontSizeHeading4: fontSize.lg,
    fontSizeHeading5: fontSize.md,
    lineWidth: 1,
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    motionDurationFast: '0.15s',
    motionDurationMid: '0.25s',
    motionDurationSlow: '0.35s',
    paddingLG: space.lg,
    paddingMD: space.md,
    paddingSM: space.sm,
    paddingXS: space.xs,
    marginLG: space.lg,
    marginMD: space.md,
    marginSM: space.sm,
    marginXS: space.xs,
  },
  components: {
    Card: {
      paddingLG: space.lg,
      borderRadiusLG: radius.md,
      boxShadowTertiary: shadow.sm,
    },
    Button: {
      borderRadiusLG: radius.sm,
      controlHeightLG: 44,
      fontWeight: 500,
      primaryShadow: shadow.primary,
    },
    Menu: {
      itemBorderRadius: radius.sm,
      itemMarginInline: 8,
      itemMarginBlock: 2,
    },
    Input: {
      borderRadius: radius.sm,
      borderRadiusLG: radius.sm,
      controlHeight: 40,
    },
    Select: {
      borderRadius: radius.sm,
      borderRadiusLG: radius.sm,
    },
    Modal: {
      borderRadiusLG: radius.md,
    },
    Table: {
      borderRadiusLG: radius.md,
    },
    Tag: {
      borderRadius: radius.xs,
    },
    Badge: {
      fontSize: fontSize.xs,
    },
    Tabs: {
      cardPadding: '8px 16px',
    },
    Drawer: {
      borderRadiusLG: radius.lg,
    },
    Popover: {
      borderRadius: radius.sm,
    },
    Tooltip: {
      borderRadius: radius.xs,
    },
  },
  cssVar: true,
  hashed: false,
};

/** Ant Design ConfigProvider 主题 — 现代简洁风 */
export const theme = {
  colors,
  radius,
  shadow,
  space,
  fontSize,
  font,
  transition,
  antdTheme,
};
