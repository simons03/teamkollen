import { QUESTIONS } from '../config/questions'
import { SECTIONS } from '../config/sections'
import type { SectionInfo, WeekInfo } from './results'
import type { Answers } from './responses'
import { getIsoWeek } from './week'

/**
 * Påhittad data för att prova resultatsidan lokalt utan att röra Firestore.
 * Slås på med ?demo och av med ?demo=0. Valet sparas för fliken så att det följer
 * med när man navigerar. Finns bara i utvecklingsläge.
 */
export const DEMO_MODE = import.meta.env.DEV && readDemoFlag()

function readDemoFlag(): boolean {
  const param = new URLSearchParams(window.location.search).get('demo')
  try {
    if (param !== null) sessionStorage.setItem('teamkollen-demo', param === '0' ? '0' : '1')
    return sessionStorage.getItem('teamkollen-demo') === '1'
  } catch {
    return param !== null && param !== '0'
  }
}

const DEMO_WEEK_COUNT = 10

/** Liten deterministisk slumpgenerator så att samma vecka alltid ser likadan ut. */
function seededRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

export function demoWeeks(): WeekInfo[] {
  const now = Date.now()
  return Array.from({ length: DEMO_WEEK_COUNT }, (_, i) => getIsoWeek(new Date(now - i * 7 * 86_400_000)))
}

export function demoSections(weekId: string): SectionInfo[] {
  const index = demoWeeks().findIndex((w) => w.id === weekId)
  // Externwebb missade att svara en vecka, så att luckor syns i trenden.
  return SECTIONS.filter((s) => !s.disabled && !(s.id === 'externwebb' && index === 3)).map(({ id, name }) => ({
    id,
    name,
  }))
}

export function demoAnswers(weekId: string, sectionIds: string[]): Answers[] {
  const weeksAgo = demoWeeks().findIndex((w) => w.id === weekId)
  // Precis som i Firestore finns inga svar för en sektion som inte svarade den veckan.
  const answered = new Set(demoSections(weekId).map((s) => s.id))
  return sectionIds.flatMap((sectionId, si) => {
    if (!answered.has(sectionId)) return []
    const rand = seededRandom(`${weekId}|${sectionId}`)
    const count = 3 + Math.floor(rand() * 5)
    return Array.from({ length: count }, () =>
      Object.fromEntries(
        QUESTIONS.map((q, qi) => {
          // Varje sektion har en egen nivå per fråga som sakta vandrar vecka för vecka.
          const base = 55 + 18 * Math.sin(qi * 1.7 + si * 2.3)
          const drift = 12 * Math.sin(weeksAgo * 0.8 + qi + si)
          const noise = (rand() - 0.5) * 40
          return [q.id, Math.round(Math.min(100, Math.max(0, base + drift + noise)))]
        }),
      ),
    )
  })
}
