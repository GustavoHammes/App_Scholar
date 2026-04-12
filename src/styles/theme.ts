export const colors = {
  primary: '#1A3C6E',
  primaryLight: '#2756A0',
  accent: '#E8A020',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  error: '#D32F2F',
  success: '#2E7D32',
  textPrimary: '#1C1C2E',
  textSecondary: '#6B7280',
  border: '#D1D9E6',
  inputBg: '#EEF2F8',
  approved: '#2E7D32',
  failed: '#D32F2F',
  recovering: '#F57C00',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#1A3C6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
