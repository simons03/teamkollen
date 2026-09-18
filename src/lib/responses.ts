import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import type { Section } from '../config/sections'
import { getDb } from './firebase'
import { getIsoWeek } from './week'

export type Answers = Record<string, number>

/**
 * Sparar ett anonymt svar under innevarande vecka och vald sektion:
 *
 *   weeks/{2026-W38}                                   { year, week }
 *   weeks/{2026-W38}/sections/{sektion-a}              { sectionId, name, year, week }
 *   weeks/{2026-W38}/sections/{sektion-a}/responses/…  { answers, createdAt }
 *
 * Vecko- och sektionsdokumenten skrivs med merge så att de går att lista.
 * Inget om användaren (id, IP, enhet e.d.) skickas med.
 */
export async function submitResponse(section: Section, answers: Answers): Promise<void> {
  const db = getDb()
  const { year, week, id: weekId } = getIsoWeek()

  const weekRef = doc(db, 'weeks', weekId)
  const sectionRef = doc(weekRef, 'sections', section.id)
  const responseRef = doc(collection(sectionRef, 'responses'))

  const batch = writeBatch(db)
  batch.set(weekRef, { year, week }, { merge: true })
  batch.set(sectionRef, { sectionId: section.id, name: section.name, year, week }, { merge: true })
  batch.set(responseRef, { answers, createdAt: serverTimestamp() })
  await batch.commit()
}
