/** 0 → röd, 50 → gul, 100 → grön. */
export function scoreColor(value: number): string {
  const hue = (Math.min(Math.max(value, 0), 100) / 100) * 120
  return `hsl(${hue} 75% 45%)`
}
