export const CC_PALETTE = {
  forest: '#0a3323',
  midnight: '#105666',
  moss: '#839958',
  beige: '#f7f4d5',
  rose: '#d3968c',
} as const

export type CcColorKey = keyof typeof CC_PALETTE
