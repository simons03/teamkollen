import { ResultsPage } from './pages/ResultsPage'
import { SurveyPage } from './pages/SurveyPage'

const ROUTES = [
  { path: '/', label: 'Svara', Page: SurveyPage },
  { path: '/resultat', label: 'Resultat', Page: ResultsPage },
]

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const current = ROUTES.find((r) => r.path === path) ?? ROUTES[0]

  return (
    <div className="min-h-screen px-4 pb-16">
      <nav className="mx-auto flex max-w-5xl items-center justify-between py-5">
        <a href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Teamkollen
        </a>
        <div className="flex gap-1">
          {ROUTES.map((r) => (
            <a
              key={r.path}
              href={r.path}
              aria-current={r === current ? 'page' : undefined}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                r === current ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {r.label}
            </a>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-5xl pt-4 sm:pt-8">
        <current.Page />
      </main>
    </div>
  )
}

export default App
