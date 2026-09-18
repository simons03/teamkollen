import type { Question } from '../../config/questions'
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
  return (
    <li className="grid grid-cols-1 items-center gap-x-6 gap-y-1 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,2fr)_minmax(0,4fr)_3.5rem] sm:px-6">
      <p className="flex gap-3 font-medium text-slate-700">
        <span className="shrink-0 tabular-nums text-slate-400">{index + 1}.</span>
        {question.text}
      </p>

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
