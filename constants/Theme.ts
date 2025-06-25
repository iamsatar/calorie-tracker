
export type ColorScheme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Shadow colors
  shadow: string;
}

export const lightTheme: ThemeColors = {
  // Primary colors - iOS Blue
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  
  // Background colors
  background: '#F2F2F7',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F9F9F9',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  surfaceTertiary: '#E5E5EA',
  
  // Text colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  textInverse: '#FFFFFF',
  
  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Chart colors
  chart1: '#007AFF',
  chart2: '#34C759',
  chart3: '#FF9500',
  chart4: '#FF3B30',
  chart5: '#AF52DE',
  
  // Border colors
  border: '#C6C6C8',
  borderSecondary: '#E5E5EA',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme: ThemeColors = {
  // Primary colors - iOS Blue
  primary: '#0A84FF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  
  // Background colors
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  
  // Surface colors
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  surfaceTertiary: '#3A3A3C',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  textInverse: '#000000',
  
  // Semantic colors
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  
  // Chart colors
  chart1: '#0A84FF',
  chart2: '#30D158',
  chart3: '#FF9F0A',
  chart4: '#FF453A',
  chart5: '#BF5AF2',
  
  // Border colors
  border: '#38383A',
  borderSecondary: '#48484A',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const typography = {
  // Large Title - 34pt
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  
  // Title 1 - 28pt
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  
  // Title 2 - 22pt
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  
  // Title 3 - 20pt
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.38,
  },
  
  // Headline - 17pt
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  
  // Body - 17pt
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  
  // Callout - 16pt
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  
  // Subheadline - 15pt
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  
  // Footnote - 13pt
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  
  // Caption 1 - 12pt
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  
  // Caption 2 - 11pt
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const getTheme = (colorScheme: ColorScheme, systemColorScheme?: 'light' | 'dark'): ThemeColors => {
  if (colorScheme === 'system') {
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}; 