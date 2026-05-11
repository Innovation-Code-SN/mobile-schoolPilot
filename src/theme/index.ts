/**
 * Charte graphique Innovation Code (alignée sur le frontend web)
 * Source: frontend/src/styles/variables.css
 */

export const colors = {
  // Couleurs principales
  primary: '#D86430', // Orange du logo
  primaryLight: '#FCEEE5', // Orange très clair pour fonds
  primaryDark: '#B84F20',

  secondary: '#2E7AB8', // Bleu du logo
  secondaryLight: '#E5EFF8',
  secondaryDark: '#1F5F8F',

  accent: '#F4A261', // Orange clair (utilisé pour highlights)

  // Surfaces
  background: '#FAFAFA', // gray-50
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5', // gray-100

  // Texte (basé sur gray Innovation Code)
  text: '#1F1F1F', // gray-900
  textSecondary: '#595959', // gray-600
  textMuted: '#8C8C8C', // gray-500
  textOnPrimary: '#FFFFFF',

  // Bordures
  border: '#E8E8E8', // gray-200
  borderStrong: '#D9D9D9', // gray-300

  // Statuts (palette Ant Design utilisée par le web)
  success: '#52C41A',
  successBg: '#F6FFED',
  warning: '#FAAD14',
  warningBg: '#FFFBE6',
  danger: '#F5222D',
  dangerBg: '#FFF1F0',
  info: '#1890FF',
  infoBg: '#E6F7FF',

  // Sidebar / dark sections (hero landing)
  dark: '#1a1f2e',
  darkAlt: '#16213e',

  overlay: 'rgba(31, 31, 31, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const theme = { colors, spacing, radius, typography, shadows };
export type Theme = typeof theme;
