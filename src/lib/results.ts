import { collection, getDocs } from 'firebase/firestore'
import { QUESTIONS } from '../config/questions'
import { getDb } from './firebase'
import type { Answers } from './responses'

export interface WeekInfo {
  id: string
  year: number
  week: number
}

export interface SectionInfo {
  id: string
  name: string
}

export interface QuestionStats {
  values: number[]
  min: number
  max: number
  avg: number
}

/** Alla veckor som har svar, nyast först. */
export async function fetchWeeks(): Promise<WeekInfo[]> {
  const snap = await getDocs(collection(getDb(), 'weeks'))
  return snap.docs
    .map((d) => ({ id: d.id, year: d.get('year') as number, week: d.get('week') as number }))
    .sort((a, b) => b.id.localeCompare(a.id))
}

/** Sektioner som har svarat en viss vecka. */
export async function fetchSections(weekId: string): Promise<SectionInfo[]> {
  const snap = await getDocs(collection(getDb(), 'weeks', weekId, 'sections'))
  return snap.docs
    .map((d) => ({ id: d.id, name: (d.get('name') as string) ?? d.id }))
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'))
}

/** Alla svar för en vecka och en eller flera sektioner. */
export async function fetchAnswers(weekId: string, sectionIds: string[]): Promise<Answers[]> {
  const snaps = await Promise.all(
    sectionIds.map((id) => getDocs(collection(getDb(), 'weeks', weekId, 'sections', id, 'responses'))),
  )
  return snaps.flatMap((snap) => snap.docs.map((d) => d.get('answers') as Answers))
}

/** Min, max och snitt per fråga. Frågor utan svar utelämnas. */
export function computeStats(responses: Answers[]): Record<string, QuestionStats> {
  const stats: Record<string, QuestionStats> = {}
  for (const q of QUESTIONS) {
    const values = responses.map((r) => r[q.id]).filter((v): v is number => typeof v === 'number')
    if (values.length === 0) continue
    stats[q.id] = {
      values,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
    }
  }
  return stats
}
