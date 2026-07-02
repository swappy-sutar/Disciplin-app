export const DESIGN_TOKENS = {
  colors: {
    canvasBg: '#F5F6FA',
    cardBg: '#FFFFFF',
    textMuted: '#9CA3AF',
    // Accent colors
    primaryBlue: '#3B82F6',
    successGreen: '#10B981',
    attentionPink: '#EC4899',
    warningOrange: '#F59E0B',
    // Pastel versions for backgrounds (with opacity)
    primaryBlueLight: 'rgba(59, 130, 246, 0.1)',
    successGreenLight: 'rgba(16, 185, 129, 0.1)',
    attentionPinkLight: 'rgba(236, 72, 153, 0.1)',
    warningOrangeLight: 'rgba(245, 158, 11, 0.1)',
  },
  gradients: {
    insight: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
    insightBlue: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  },
  shadows: {
    sm: '0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    md: '0 10px 20px -3px rgba(0, 0, 0, 0.05), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
  },
  radius: {
    card: '16px', // rounded-2xl
    pill: '9999px',
  },
} as const;

export type DesignColors = keyof typeof DESIGN_TOKENS.colors;
