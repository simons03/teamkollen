import { AGREE_LABELS, type Question } from '../config/questions'
import { scoreColor } from '../lib/color'
import { GradientSlider } from './GradientSlider'

interface QuestionRowProps {
  index: number
  question: Question
  value: number
  touched: boolean
  onChange: (value: number) => void
}

export function QuestionRow({ index, question, value, touched, onChange }: QuestionRowProps) {
  const inputId = `question-${question.id}`
  const labels = question.labels ?? AGREE_LABELS

  return (
    <li className="grid grid-cols-1 items-center gap-x-6 gap-y-3 border-b border-slate-100 px-5 py-5 last:border-b-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_3.5rem] sm:px-6">
      <label htmlFor={inputId} className="flex gap-3 font-medium text-slate-700">
        <span className="shrink-0 tabular-nums text-slate-400">{index + 1}.</span>
        {question.text}
      </label>

      <div>
        <GradientSlider
          id={inputId}
          value={value}
          touched={touched}
          label={question.text}
          onChange={onChange}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{labels.low}</span>
          <span>{labels.high}</span>
        </div>
      </div>

      <output
        htmlFor={inputId}
        className="justify-self-end text-right text-2xl font-semibold tabular-nums md:justify-self-center"
        style={{ color: touched ? scoreColor(value) : '#94a3b8' }}
      >
        {touched ? value : '–'}
      </output>
    </li>
  )
}
