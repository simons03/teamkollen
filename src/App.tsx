import { useState, type FormEvent } from 'react'
import { QuestionRow } from './components/QuestionRow'
import { SectionSelect } from './components/SectionSelect'
import { DEFAULT_VALUE, QUESTIONS } from './config/questions'
import { findSection } from './config/sections'
import { isFirebaseConfigured } from './lib/firebase'
import { submitResponse, type Answers } from './lib/responses'
import { getIsoWeek } from './lib/week'

type Status = 'idle' | 'submitting' | 'done' | 'error'

const initialAnswers = (): Answers =>
  Object.fromEntries(QUESTIONS.map((q) => [q.id, DEFAULT_VALUE]))

function App() {
  const [sectionId, setSectionId] = useState('')
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const section = findSection(sectionId)
  const { year, week } = getIsoWeek()
  const answeredCount = touched.size
  const allAnswered = answeredCount === QUESTIONS.length
  const canSubmit = section !== undefined && allAnswered && status !== 'submitting'

  const handleChange = (id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !section) return

    setStatus('submitting')
    setError(null)
    try {
      await submitResponse(section, answers)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.')
      setStatus('error')
    }
  }

  const reset = () => {
    setAnswers(initialAnswers())
    setTouched(new Set())
    setStatus('idle')
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <main className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Teamkollen</h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Vecka {week}, {year}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-slate-600">
            Svara på frågorna genom att dra reglaget mellan 0 (mycket dåligt) och 100 (mycket bra).
            Undersökningen är helt anonym – vi sparar bara vilken sektion du tillhör och dina svar.
          </p>
        </header>

        {!isFirebaseConfigured && (
          <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Firebase är inte konfigurerat än. Kopiera <code>.env.example</code> till <code>.env</code> och
            fyll i värdena för att kunna spara svar.
          </p>
        )}

        {status === 'done' ? (
          <section className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900">Tack för ditt svar!</h2>
            <p className="mt-2 text-slate-600">Ditt svar har sparats anonymt för {section?.name}, vecka {week}.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"
            >
              Fyll i igen
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <SectionSelect value={sectionId} onChange={setSectionId} />
            </div>

            <ol className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              {QUESTIONS.map((question, index) => (
                <QuestionRow
                  key={question.id}
                  index={index}
                  question={question}
                  value={answers[question.id]}
                  touched={touched.has(question.id)}
                  onChange={(value) => handleChange(question.id, value)}
                />
              ))}
            </ol>

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {!section && 'Välj sektion. '}
                {answeredCount} av {QUESTIONS.length} frågor besvarade
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {status === 'submitting' ? 'Skickar…' : 'Skicka svar'}
              </button>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </form>
        )}
      </main>
    </div>
  )
}

export default App
