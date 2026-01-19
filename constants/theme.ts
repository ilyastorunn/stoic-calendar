/**
 * Stoic Calendar - iOS 26 Design System
 *
 * Minimal, calm, neutral design following Apple Human Interface Guidelines.
 * Dark-mode-first with pure black backgrounds.
 *
 * NorthStar Principle: "Make time clearer without making it louder"
 */

import { Platform } from 'react-native';

/**
 * Color System
 * Based on Apple semantic system colors with custom Stoic Calendar accents
 */
export const Colors = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    secondaryBackground: '#F2F2F7',
    tertiaryBackground: '#FFFFFF',

    // Text
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    // Accent (iOS Blue)
    accent: '#007AFF',
    accentLight: '#5AC8FA',

    // Dots (default colors - overridden by GridColorPalettes)
    dotFilled: '#007AFF',
    dotEmpty: '#D1D1D6',
    dotEmptyBorder: '#C7C7CC',

    // UI Elements
    separator: '#C6C6C8',
    cardBackground: '#F2F2F7',
    cardBorder: '#E5E5EA',

    // Tab Bar
    tabBarBackground: 'rgba(242, 242, 247, 0.8)',
    tabIconActive: '#007AFF',
    tabIconInactive: '#8E8E93',

    // Interactive States
    destructive: '#FF3B30',
  },
  dark: {
    // Backgrounds (Pure Black for OLED)
    background: '#000000',
    secondaryBackground: '#1C1C1E',
    tertiaryBackground: '#2C2C2E',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',

    // Accent (iOS Blue)
    accent: '#007AFF',
    accentLight: '#5AC8FA',

    // Dots (default colors - overridden by GridColorPalettes)
    dotFilled: '#007AFF',
    dotEmpty: '#333333',
    dotEmptyBorder: '#48484A',

    // UI Elements
    separator: '#38383A',
    cardBackground: '#1C1C1E',
    cardBorder: '#2C2C2E',

    // Tab Bar
    tabBarBackground: 'rgba(28, 28, 30, 0.8)',
    tabIconActive: '#007AFF',
    tabIconInactive: '#8E8E93',

    // Interactive States
    destructive: '#FF453A',
  },
};

/**
 * Grid Color Palettes
 * Predefined color themes for grid visualization
 * Filled dots = vibrant color, Empty dots = neutral gray (high contrast)
 */
export const GridColorPalettes = {
  classic: {
    name: 'Classic Blue',
    light: {
      dotFilled: '#007AFF',
      dotEmpty: '#D1D1D6',
    },
    dark: {
      dotFilled: '#007AFF',
      dotEmpty: '#333333',
    },
  },
  forest: {
    name: 'Forest Green',
    light: {
      dotFilled: '#34C759',
      dotEmpty: '#D1D1D6',
    },
    dark: {
      dotFilled: '#30D158',
      dotEmpty: '#333333',
    },
  },
  sunset: {
    name: 'Sunset Orange',
    light: {
      dotFilled: '#FF9500',
      dotEmpty: '#D1D1D6',
    },
    dark: {
      dotFilled: '#FF9F0A',
      dotEmpty: '#333333',
    },
  },
  monochrome: {
    name: 'Monochrome',
    light: {
      dotFilled: '#000000',
      dotEmpty: '#D1D1D6',
    },
    dark: {
      dotFilled: '#FFFFFF',
      dotEmpty: '#333333',
    },
  },
};

/**
 * Typography System
 * SF Pro for body text, Serif (New York/Georgia) for timeline titles only
 */
export const Fonts = {
  // SF Pro (default system font)
  sans: 'System',

  // New York (iOS serif)
  serif: Platform.select({
    ios: 'ui-serif',
    default: 'Georgia',
    web: "'New York', Georgia, 'Times New Roman', serif",
  }),

  // Cormorant Garamond (elegant serif for timeline titles)
  handwriting: 'CormorantGaramond-Regular',

  // Rounded (for future use)
  rounded: Platform.select({
    ios: 'ui-rounded',
    default: 'System',
    web: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
  }),

  // Monospace (for future use)
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
    web: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  }),
};

/**
 * Font Sizes
 * Following iOS Dynamic Type scale
 */
export const FontSizes = {
  // Large Titles (used sparingly)
  largeTitle: 34,

  // Titles
  title1: 28,
  title2: 22,
  title3: 20,

  // Headlines
  headline: 17,

  // Body
  body: 17,
  callout: 16,

  // Supporting text
  subheadline: 15,
  footnote: 13,
  caption1: 12,
  caption2: 11,
};

/**
 * Font Weights
 * iOS standard weights
 */
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * Spacing Scale
 * Consistent spacing throughout the app
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border Radius
 * Continuous corner radius (iOS style)
 */
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  full: 9999,
};

/**
 * Shadows
 * Subtle elevation for floating elements (tab bar, modals)
 */
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Layout Constants
 */
export const Layout = {
  // Screen padding
  screenPadding: 20,

  // Tab bar dimensions
  tabBarHeight: 64,
  tabBarBottomMargin: 16,
  tabBarSideMargin: 16,

  // Card spacing
  cardGap: 12,

  // Grid dot sizing (calculated dynamically, these are reference values)
  minDotSize: 6,
  maxDotSize: 14,
  dotSpacingRatioHorizontal: 0.25, // 25% of dot size (wider horizontal gaps)
  dotSpacingRatioVertical: 0.08,   // 8% of dot size (tighter vertical gaps)
  // Reference: Manus.ai MVP style - horizontal spacing > vertical spacing
};

/**
 * Animation Timing
 * Subtle, non-distracting animations
 */
export const Animations = {
  // Duration
  fast: 200,
  normal: 300,
  slow: 500,

  // Easing (use 'linear' or 'ease-in-out', NEVER 'spring' or 'bounce')
  easing: 'ease-in-out' as const,
};

/**
 * Haptics Configuration
 * Light, subtle feedback
 */
export const Haptics = {
  tabPress: 'light' as const,
  buttonPress: 'light' as const,
  deleteAction: 'medium' as const,
};
