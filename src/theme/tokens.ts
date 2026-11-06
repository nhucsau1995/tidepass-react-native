// Tokens from design/DESIGN.md (palette P53, graphite + brass).
export const colors = {
  bg: '#F9F8F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EEEA',
  accent: '#2B2A28',
  accentPressed: '#1C1B1A',
  accentTint: '#EAE9E8',
  brass: '#D4B06A',
  brassTint: '#F7EFDD',
  text: '#181614',
  text2: '#5E5952',
  text3: '#8A8580',
  border: '#E7E3DD',
  disabled: '#D9D5CF',
  white: '#FFFFFF',
  success: '#16A34A',
  successText: '#15803D', // AA on white for small labels
  successTint: '#E8F5EC',
  warning: '#D97706',
  warningText: '#B45309',
  warningTint: '#FDF1E3',
  danger: '#DC2626',
  dangerTint: '#FDECEC',
  overlay: 'rgba(24,22,20,0.55)',
  photoFade: ['rgba(24,22,20,0)', 'rgba(24,22,20,0.82)'] as const,
  brassToGraphite: ['#D4B06A', '#2B2A28'] as const,
};

export const font = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  display: 'PlayfairDisplay_700Bold',
  displaySemi: 'PlayfairDisplay_600SemiBold',
};

// Type scale: Display 32, Title 20, Body 16, Label 14, Caption 13 (12 for tab labels).
export const size = { display: 32, title: 20, body: 16, label: 14, caption: 13, tab: 12 };

export const radius = { card: 20, control: 14, input: 12, sheet: 28, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, edge: 20 };

export const shadow = {
  shadowColor: '#181614',
  shadowOpacity: 0.06,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

// Calendar / availability dots: available, limited (brass), full, no departures.
export const STATUS_COLOR = { available: colors.success, limited: colors.brass, full: colors.text3, none: colors.border } as const;
