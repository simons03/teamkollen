import { useEffect, useMemo, useState } from 'react'
import { Delta } from '../components/results/Delta'
import { ResultRow, type ResultView } from '../components/results/ResultRow'
import { QUESTIONS } from '../config/questions'
import { scoreColor } from '../lib/color'
import { DEMO_MODE } from '../lib/demoData'
import type { Answers } from '../lib/responses'
import {
  computeStats,
  fetchAnswers,
  fetchSections,
  fetchWeekAnswers,
  fetchWeeks,
  overallAverage,
  type QuestionStats,
  type SectionInfo,
  type WeekInfo,
} from '../lib/results'
import { getIsoWeek } from '../lib/week'

const ALL_SECTIONS = ''
const NO_COMPARE = ''
/** Antal veckor som visas i trendvyn, inklusive vald vecka. */
const TREND_WEEKS = 8

type StatsMap = Record<string, QuestionStats>

const VIEWS: { id: ResultView; label: string }[] = [
  { id: 'range', label: 'Spann' },
  { id: 'dots', label: 'Alla svar' },
  { id: 'trend', label: 'Trend' },
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
  const [compareWeekId, setCompareWeekId] = useState(NO_COMPARE)
  const [compareLoaded, setCompareLoaded] = useState<{ key: string; stats: StatsMap } | null>(null)
  const [trendLoaded, setTrendLoaded] = useState<{ key: string; series: StatsMap[] } | null>(null)
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

  const sectionFilter = sectionId === ALL_SECTIONS ? null : sectionId

  // Jämförelseveckan, för samma sektion (eller alla sektioner den veckan).
  const compareKey = compareWeekId ? `${compareWeekId}|${sectionId}` : ''
  const compareStats = compareKey && compareLoaded?.key === compareKey ? compareLoaded.stats : null

  useEffect(() => {
    if (!compareKey) return
    let cancelled = false
    fetchWeekAnswers(compareWeekId, sectionFilter)
      .then((list) => !cancelled && setCompareLoaded({ key: compareKey, stats: computeStats(list) }))
      .catch(handleError)
    return () => {
      cancelled = true
    }
  }, [compareKey, compareWeekId, sectionFilter])

  // Trend: vald vecka och upp till sju veckor med svar före den, äldst först.
  const trendWeeks = useMemo(() => {
    const i = weeks?.findIndex((w) => w.id === weekId) ?? -1
    return i < 0 ? [] : weeks!.slice(i, i + TREND_WEEKS).reverse()
  }, [weeks, weekId])
  const trendKey = view === 'trend' ? `${trendWeeks.map((w) => w.id).join(',')}|${sectionId}` : ''
  const trendSeries = trendKey && trendLoaded?.key === trendKey ? trendLoaded.series : null

  useEffect(() => {
    if (!trendKey || trendWeeks.length === 0) return
    let cancelled = false
    Promise.all(trendWeeks.map((w) => fetchWeekAnswers(w.id, sectionFilter).then(computeStats)))
      .then((series) => !cancelled && setTrendLoaded({ key: trendKey, series }))
      .catch(handleError)
    return () => {
      cancelled = true
    }
  }, [trendKey, trendWeeks, sectionFilter])

  const stats = useMemo(() => computeStats(responses ?? []), [responses])
  const overallAvg = useMemo(() => overallAverage(stats), [stats])
  const compareOverallAvg = useMemo(() => (compareStats ? overallAverage(compareStats) : null), [compareStats])

  const selectedWeek = weeks?.find((w) => w.id === weekId)
  const compareWeek = weeks?.find((w) => w.id === compareWeekId)
  const compareLabel = compareWeek ? `vecka ${compareWeek.week}` : ''
  const loading =
    weeks === null || (weeks.length > 0 && (responses === null || (view === 'trend' && trendSeries === null)))

  // Jämförelsen är ett eget val och ligger kvar när veckan byts – utom om man väljer
  // just den veckan, eftersom en vecka inte kan jämföras med sig själv.
  const changeWeek = (id: string) => {
    setWeekId(id)
    if (id === compareWeekId) setCompareWeekId(NO_COMPARE)
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Resultat</h1>
        {DEMO_MODE && (
          <p className="mt-3 inline-block rounded-md bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-800">
            Demoläge – påhittad data, inget hämtas från Firestore.{' '}
            <a href="?demo=0" className="underline">
              Stäng av
            </a>
          </p>
        )}
        <p className="mt-2 max-w-2xl text-slate-600">
          Veckans svar per sektion. Se spannet mellan lägsta och högsta svar, alla svar som prickar
          eller hur snittet har utvecklats vecka för vecka. Jämför med en tidigare vecka för att se
          vad som har ändrats.
        </p>
      </header>

      <div className="mb-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 sm:items-end lg:grid-cols-[1fr_1fr_1fr_auto] sm:p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Vecka
          <select
            value={weekId}
            onChange={(e) => changeWeek(e.target.value)}
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

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Jämför med
          <select
            value={compareWeekId}
            onChange={(e) => setCompareWeekId(e.target.value)}
            disabled={!weeks || weeks.length < 2}
            title={weeks?.length === 1 ? 'Det finns bara svar för en vecka än' : undefined}
            className={selectClass}
          >
            <option value={NO_COMPARE}>
              {weeks?.length === 1 ? 'Bara en vecka har svar' : 'Ingen jämförelse'}
            </option>
            {weeks
              ?.filter((w) => w.id !== weekId)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  Vecka {w.week}, {w.year}
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
                {compareOverallAvg !== null && (
                  <Delta value={overallAvg} previous={compareOverallAvg} label={compareLabel} className="ml-1.5" />
                )}
              </span>
            )}
            {compareStats && view !== 'trend' && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="inline-block size-3 rounded-full border-2 border-dashed border-slate-500" />
                Snitt {compareLabel}
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
                compare={
                  compareStats?.[question.id] && { avg: compareStats[question.id].avg, label: compareLabel }
                }
                trend={trendSeries?.map((series, i) => ({
                  label: `v${trendWeeks[i].week}`,
                  avg: series[question.id]?.avg ?? null,
                }))}
              />
            ))}
          </ol>
        </>
      )}
    </>
  )
}
