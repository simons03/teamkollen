export interface IsoWeek {
  year: number
  week: number
  /** T.ex. "2026-W38" – används som dokument-id i Firestore. */
  id: string
}

/** ISO 8601-vecka (samma veckonummer som i svenska kalendrar). */
export function getIsoWeek(date = new Date()): IsoWeek {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Flytta till torsdagen i samma vecka – den avgör vilket år veckan tillhör.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const year = d.getUTCFullYear()
  const week = Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7)
  return { year, week, id: `${year}-W${String(week).padStart(2, '0')}` }
}
