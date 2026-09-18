import { AGREE_LABELS, type Question } from '../../config/questions'
import { scoreColor } from '../../lib/color'
import type { QuestionStats } from '../../lib/results'
import { DotScale } from './DotScale'
import { RangeScale } from './RangeScale'

export type ResultView = 'range' | 'dots'

interface ResultRowProps {
  index: number
  question: Question
  stats: QuestionStats | undefined
  view: ResultView
}

export function ResultRow({ index, question, stats, view }: ResultRowProps) {
  const labels = question.labels ?? AGREE_LABELS

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

      {stats ? (
        view === 'range' ? <RangeScale stats={stats} /> : <DotScale stats={stats} />
      ) : (
        <p className="text-sm text-slate-400">Inga svar</p>
      )}

      <p
        className="justify-self-end text-right text-2xl font-semibold tabular-nums md:justify-self-center"
        style={{ color: stats ? scoreColor(stats.avg) : '#94a3b8' }}
        title="Snitt"
      >
        {stats ? Math.round(stats.avg) : '–'}
      </p>
    </li>
  )
}
