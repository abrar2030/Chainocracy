/**
 * QuantumBallot shared design tokens (mobile).
 *
 * These values mirror the web app's src/lib/designTokens.ts exactly, so the two
 * apps read as one product. Direction: "verifiable civic trust" - deep navy and
 * electric indigo institutional palette, verification teal accent. Signature
 * element: a chain of linked, verified ballot blocks.
 */

export const colors = {
  ink: "#0E1730",
  ink2: "#16224A",
  primary: "#2E43C9",
  primary600: "#2334A6",
  accent: "#17B6A5",
  paper: "#F4F6FC",
  line: "#E1E5F2",
  muted: "#5C668A",
  white: "#FFFFFF",
  danger: "#D8446B",
  success: "#17B6A5",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

export const designTokens = { colors, radii, space, fontSizes };
export default designTokens;
