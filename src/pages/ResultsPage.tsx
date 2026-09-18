import { useEffect, useMemo, useState } from 'react'
import { ResultRow, type ResultView } from '../components/results/ResultRow'
import { QUESTIONS } from '../config/questions'
import { scoreColor } from '../lib/color'
import type { Answers } from '../lib/responses'
import {
  computeStats,
  fetchAnswers,
  fetchSections,
  fetchWeeks,
  type SectionInfo,
  type WeekInfo,
} from '../lib/results'
import { getIsoWeek } from '../lib/week'

const ALL_SECTIONS = ''

const VIEWS: { id: ResultView; label: string }[] = [
  { id: 'range', label: 'Spann' },
  { id: 'dots', label: 'Alla svar' },
]

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none'

export function ResultsPage() {
  const [weeks, setWeeks] = useState<WeekInfo[] | null>(null)
  const [weekId, setWeekId] = useState('')
  const [sections, setSections] = useState<SectionInfo[]>([])
  const [sectionId, setSectionId] = useState(ALL_SECTIONS)
  const [loaded, setLoaded] = useState<{ key: string; list: Answers[] } | null>(null)
  const [view, setView] = useState<ResultView>('range')
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    console.error(err)
    setError(err instanceof Error ? err.message : 'Kunde inte hämta resultaten.')
  }

  // Veckor: välj innevarande vecka om den har svar, annars den senaste.
  useEffect(() => {
    fetchWeeks()
      .then((list) => {
        setWeeks(list)
        const current = getIsoWeek().id
        setWeekId(list.find((w) => w.id === current)?.id ?? list[0]?.id ?? '')
      })
      .catch(handleError)
  }, [])

  // Sektioner för vald vecka.
  useEffect(() => {
    if (!weekId) return
    let cancelled = false
    fetchSections(weekId)
      .then((list) => {
        if (cancelled) return
        setSections(list)
        setSectionId((prev) => (list.some((s) => s.id === prev) ? prev : ALL_SECTIONS))
      })
      .catch(handleError)
    return () => {
      cancelled = true
    }
  }, [weekId])

  // Svar för vald vecka och sektion(er). Nyckeln avgör om det som laddats är aktuellt.
  const sectionIds = sectionId === ALL_SECTIONS ? sections.map((s) => s.id) : [sectionId]
  const answersKey = `${weekId}|${sectionIds.join(',')}`
  const responses = loaded?.key === answersKey ? loaded.list : null

  useEffect(() => {
    if (!weekId || sections.length === 0) return
    const [, ids] = answersKey.split('|')
    let cancelled = false
    fetchAnswers(weekId, ids.split(','))
      .then((list) => !cancelled && setLoaded({ key: answersKey, list }))
      .catch(handleError)
    return () => {
      cancelled = true
    }
  }, [weekId, sections.length, answersKey])

  const stats = useMemo(() => computeStats(responses ?? []), [responses])
  const overallAvg = useMemo(() => {
    const all = Object.values(stats).flatMap((s) => s.values)
    return all.length ? all.reduce((a, b) => a + b, 0) / all.length : null
  }, [stats])

  const selectedWeek = weeks?.find((w) => w.id === weekId)
  const loading = weeks === null || (weeks.length > 0 && responses === null)

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Resultat</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Veckans svar per sektion. Välj att se spannet mellan lägsta och högsta svar, eller alla svar
          som prickar på skalan.
        </p>
      </header>

      <div className="mb-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Vecka
          <select
            value={weekId}
            onChange={(e) => setWeekId(e.target.value)}
            disabled={!weeks?.length}
            className={selectClass}
          >
            {weeks?.map((w) => (
              <option key={w.id} value={w.id}>
                Vecka {w.week}, {w.year}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Sektion
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={sections.length === 0}
            className={selectClass}
          >
            <option value={ALL_SECTIONS}>Alla sektioner</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          <span id="view-label">Visning</span>
          <div
            role="radiogroup"
            aria-labelledby="view-label"
            className="inline-flex rounded-lg bg-slate-100 p-1"
          >
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={view === v.id}
                onClick={() => setView(v.id)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  view === v.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : weeks?.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          Inga svar har skickats in än.
        </p>
      ) : loading ? (
        <p className="p-10 text-center text-slate-500">Hämtar resultat…</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm text-slate-600">
            <span>
              <strong className="text-slate-900">{responses?.length ?? 0}</strong> svar
              {selectedWeek && ` vecka ${selectedWeek.week}`}
              {sectionId !== ALL_SECTIONS && ` · ${sections.find((s) => s.id === sectionId)?.name}`}
            </span>
            {overallAvg !== null && (
              <span>
                Totalt snitt{' '}
                <strong className="tabular-nums" style={{ color: scoreColor(overallAvg) }}>
                  {Math.round(overallAvg)}
                </strong>
              </span>
            )}
          </div>

          <ol className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {QUESTIONS.map((question, index) => (
              <ResultRow
                key={question.id}
                index={index}
                question={question}
                stats={stats[question.id]}
                view={view}
              />
            ))}
          </ol>
        </>
      )}
    </>
  )
}
