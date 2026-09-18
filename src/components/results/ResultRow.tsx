import { AGREE_LABELS, type Question } from '../../config/questions'
import { scoreColor } from '../../lib/color'
import type { QuestionStats } from '../../lib/results'
import type { Comparison } from './CompareMarker'
import { Delta } from './Delta'
import { DotScale } from './DotScale'
import { RangeScale } from './RangeScale'
import { TrendScale, type TrendPoint } from './TrendScale'

export type ResultView = 'range' | 'dots' | 'trend'

interface ResultRowProps {
  index: number
  question: Question
  stats: QuestionStats | undefined
  view: ResultView
  /** Jämförelseveckans snitt för frågan, om en vecka är vald och har svar. */
  compare?: Comparison
  /** Snitt vecka för vecka, används i trendvyn. */
  trend?: TrendPoint[]
}

export function ResultRow({ index, question, stats, view, compare, trend }: ResultRowProps) {
  const labels = question.labels ?? AGREE_LABELS

  let scale
  if (view === 'trend') {
    scale = trend?.some((p) => p.avg !== null) ? (
      <TrendScale points={trend} />
    ) : (
      <p className="text-sm text-slate-400">Inga svar</p>
    )
  } else if (stats) {
    scale = view === 'range' ? <RangeScale stats={stats} compare={compare} /> : <DotScale stats={stats} compare={compare} />
  } else {
    scale = <p className="text-sm text-slate-400">Inga svar</p>
  }

  return (
    <li className="grid grid-cols-1 items-center gap-x-6 gap-y-1 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,2fr)_minmax(0,4fr)_3.5rem] sm:px-6">
      <div className="flex gap-3">
        <span className="shrink-0 font-medium tabular-nums text-slate-400">{index + 1}.</span>
        <div>
          <p className="font-medium text-slate-700">{question.text}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            0 = {labels.low.toLowerCase()} · 100 = {labels.high.toLowerCase()}
          </p>
        </div>
      </div>

      {scale}

      <div className="flex flex-col items-end justify-self-end md:items-center md:justify-self-center">
        <p
          className="text-2xl font-semibold tabular-nums"
          style={{ color: stats ? scoreColor(stats.avg) : '#94a3b8' }}
          title="Snitt"
        >
          {stats ? Math.round(stats.avg) : '–'}
        </p>
        {stats && compare && <Delta value={stats.avg} previous={compare.avg} label={compare.label} />}
      </div>
    </li>
  )
}
