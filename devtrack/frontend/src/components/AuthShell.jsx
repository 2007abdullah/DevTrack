import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink-900 p-12 text-white lg:flex">
        <Logo className="!text-white" />
        <div>
          <p className="font-display text-5xl font-extrabold leading-tight">Build.<br />Track.<br />Ship.</p>
          <p className="mt-4 max-w-sm text-ink-400">One place for your projects, tasks and deadlines, so the next release is never a surprise.</p>
        </div>
        <p className="text-sm text-ink-500">© {new Date().getFullYear()} DevTrack</p>
      </div>
      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="muted mt-1 mb-6">{subtitle}</p>
          {children}
          <p className="muted mt-6 text-center">{footer}</p>
        </div>
      </div>
    </div>
  )
}
