import { BarChart3, Check, FolderKanban, GitBranch, Github, ListChecks, Moon, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

/** Illustrative product preview built from CSS; the progress bars fill once on load. */
function ProductPreview() {
  const rows = [
    { name: 'Orbit API', pct: 72, tag: 'In progress' },
    { name: 'Pixel Portfolio', pct: 35, tag: 'Planning' },
    { name: 'CLI Toolbox', pct: 100, tag: 'Completed' },
  ]
  return (
    <div className="card mx-auto mt-14 max-w-4xl overflow-hidden shadow-2xl shadow-ink-900/10 animate-rise [animation-delay:.25s]" aria-hidden>
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-4 py-2.5 dark:border-ink-700 dark:bg-ink-900">
        {['bg-red-400', 'bg-amber-400', 'bg-brand-400'].map((c) => <span key={c} className={`h-3 w-3 rounded-full ${c}`} />)}
        <span className="ml-3 font-mono text-xs text-ink-400">devtrack / projects</span>
      </div>
      <div className="grid sm:grid-cols-[170px_1fr]">
        <div className="hidden space-y-2 border-r border-slate-200 p-4 dark:border-ink-700 sm:block">
          {['Overview', 'Projects', 'Tasks', 'Profile'].map((l, i) => (
            <div key={l} className={`rounded-md px-3 py-2 text-sm ${i === 1 ? 'bg-brand-600 text-white' : 'text-ink-500'}`}>{l}</div>
          ))}
        </div>
        <div className="space-y-5 p-5 text-left">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{r.name}</span><span className="muted">{r.tag} · {r.pct}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
                <div className="h-full origin-left animate-fill rounded-full bg-brand-500" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[['Tasks done', '18'], ['In progress', '5'], ['Due this week', '3']].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-slate-50 p-3 dark:bg-ink-900"><p className="muted text-xs">{l}</p><p className="font-display text-2xl font-extrabold">{v}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: FolderKanban, title: 'Projects with real progress', text: 'Track status, stack, repository and live URLs. Progress is calculated from finished tasks, not guessed.' },
  { icon: ListChecks, title: 'Tasks with priorities', text: 'Four priority levels, due dates, search and filters. Tick a task off and the project updates.' },
  { icon: BarChart3, title: 'Dashboard charts', text: 'See project status, task completion and a 7-day productivity view without building a report.' },
  { icon: ShieldCheck, title: 'Private by default', text: 'JWT authentication, hashed passwords, and every query scoped to the signed-in user.' },
  { icon: Moon, title: 'Light and dark', text: 'A responsive interface that follows your system theme and remembers your choice.' },
  { icon: Zap, title: 'One-command setup', text: 'Clone, run docker compose up, and the API, database and frontend are running.' },
]

const STEPS = [
  { title: 'Create a project', text: 'Add your stack, repository, deadline and status.' },
  { title: 'Break it into tasks', text: 'Set priorities and due dates so the next step is always obvious.' },
  { title: 'Ship on schedule', text: 'Watch progress and upcoming deadlines on your dashboard.' },
]

const LOG = [
  ['feat', 'Create project and set deadline', 'planning'],
  ['task', 'Add tasks, mark the critical ones', 'in progress'],
  ['done', 'Complete tasks as pull requests merge', 'progress 100%'],
  ['ship', 'Mark project completed and link the live URL', 'completed'],
]

const FACTS = [['4', 'project states'], ['4', 'task priority levels'], ['7 days', 'of productivity charted'], ['1 command', 'to start everything']]

export default function Landing() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur dark:border-ink-700 dark:bg-ink-950/85">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8" aria-label="Primary">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-medium text-ink-600 dark:text-slate-300 md:flex">
            <a href="#features" className="hover:text-brand-600">Features</a><a href="#how" className="hover:text-brand-600">How it works</a><a href="#workflow" className="hover:text-brand-600">Workflow</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? <Link to="/dashboard" className="btn-primary">Dashboard</Link> : (
              <><Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link><Link to="/register" className="btn-primary">Get started</Link></>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-8 sm:pt-24">
          <h1 className="animate-rise font-display text-6xl font-extrabold leading-[1.02] sm:text-8xl">Build. Track. Ship.</h1>
          <p className="mx-auto mt-6 max-w-xl animate-rise text-lg text-ink-500 [animation-delay:.1s] dark:text-ink-400">
            DevTrack helps developers organize projects, manage tasks, track progress, and ship better software.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:.18s]">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">Get Started</Link>
            <Link to="/login?demo=1" className="btn-secondary px-6 py-3 text-base">View Demo</Link>
          </div>
          <ProductPreview />
        </section>

        <section id="features" className="bg-white py-20 dark:bg-ink-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">Everything a solo developer or small team needs to keep moving</h2>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-ink-700 dark:text-brand-300"><Icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="muted mt-1.5 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 font-display font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="muted mt-1">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="workflow" className="bg-ink-900 py-20 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold !text-white sm:text-4xl">Fits the way you already ship</h2>
              <p className="mt-4 max-w-md text-ink-400">Link your repository and live site on every project. Your task list follows the same rhythm as your branches and releases.</p>
              <Link to="/register" className="btn-primary mt-6"><Github className="h-4 w-4" />Start your first project</Link>
            </div>
            <ul className="space-y-3 font-mono text-sm" aria-label="Example workflow">
              {LOG.map(([kind, text, state]) => (
                <li key={kind} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-800 px-4 py-3">
                  <GitBranch className="h-4 w-4 shrink-0 text-brand-300" aria-hidden />
                  <span className="text-brand-300">{kind}</span><span className="flex-1 text-slate-200">{text}</span>
                  <span className="hidden text-xs text-ink-400 sm:inline">{state}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {FACTS.map(([value, label]) => (
              <div key={label}><dd className="font-display text-4xl font-extrabold text-brand-600 dark:text-brand-300">{value}</dd><dt className="muted mt-1">{label}</dt></div>
            ))}
          </dl>
        </section>

        <section className="px-4 pb-20 sm:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-brand-600 px-6 py-14 text-center text-white">
            <h2 className="text-3xl font-extrabold !text-white sm:text-4xl">Your next release starts with a plan</h2>
            <p className="mx-auto mt-3 max-w-md text-brand-50">Create a free account and add your first project in under a minute.</p>
            <Link to="/register" className="btn mt-7 bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50"><Check className="h-4 w-4" />Get Started</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10 dark:border-ink-700">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-8">
          <Logo />
          <p className="muted">© {new Date().getFullYear()} DevTrack. Released under the MIT License.</p>
        </div>
      </footer>
    </div>
  )
}
