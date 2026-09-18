import { collection, getDocs } from 'firebase/firestore'
import { QUESTIONS } from '../config/questions'
import { DEMO_MODE, demoAnswers, demoSections, demoWeeks } from './demoData'
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
  if (DEMO_MODE) return demoWeeks()
  const snap = await getDocs(collection(getDb(), 'weeks'))
  return snap.docs
    .map((d) => ({ id: d.id, year: d.get('year') as number, week: d.get('week') as number }))
    .sort((a, b) => b.id.localeCompare(a.id))
}

/** Sektioner som har svarat en viss vecka. */
export async function fetchSections(weekId: string): Promise<SectionInfo[]> {
  if (DEMO_MODE) return demoSections(weekId)
  const snap = await getDocs(collection(getDb(), 'weeks', weekId, 'sections'))
  return snap.docs
    .map((d) => ({ id: d.id, name: (d.get('name') as string) ?? d.id }))
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'))
}

/** Alla svar för en vecka och en eller flera sektioner. */
export async function fetchAnswers(weekId: string, sectionIds: string[]): Promise<Answers[]> {
  if (DEMO_MODE) return demoAnswers(weekId, sectionIds)
  const snaps = await Promise.all(
    sectionIds.map((id) => getDocs(collection(getDb(), 'weeks', weekId, 'sections', id, 'responses'))),
  )
  return snaps.flatMap((snap) => snap.docs.map((d) => d.get('answers') as Answers))
}

/**
 * Svar för en vecka, för en sektion eller alla (null). Varje vecka och sektion
 * hämtas bara en gång per sidladdning så att jämförelse och trend kan dela på dem.
 */
const weekAnswersCache = new Map<string, Promise<Answers[]>>()

export function fetchWeekAnswers(weekId: string, sectionId: string | null): Promise<Answers[]> {
  const key = `${weekId}|${sectionId ?? '*'}`
  let pending = weekAnswersCache.get(key)
  if (!pending) {
    pending = (sectionId ? Promise.resolve([sectionId]) : fetchSections(weekId).then((l) => l.map((s) => s.id)))
      .then((ids) => fetchAnswers(weekId, ids))
    // Ett misslyckat anrop ska kunna göras om.
    pending.catch(() => weekAnswersCache.delete(key))
    weekAnswersCache.set(key, pending)
  }
  return pending
}

/** Snittet av alla svar på alla frågor, eller null om inga svar finns. */
export function overallAverage(stats: Record<string, QuestionStats>): number | null {
  const all = Object.values(stats).flatMap((s) => s.values)
  return all.length ? all.reduce((a, b) => a + b, 0) / all.length : null
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
