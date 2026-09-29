import { AlertTriangle, WifiOff } from 'lucide-react'
import Button from './Button'

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden />

export function CardSkeletons({ count = 3, height = 'h-40' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className={`${height} w-full rounded-xl`} />)}
    </div>
  )
}

export function RowSkeletons({ count = 5 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center border-dashed px-6 py-14 text-center">
      {Icon && <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-ink-700 dark:text-brand-300"><Icon className="h-6 w-6" aria-hidden /></span>}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  const offline = error?.status === 0
  const Icon = offline ? WifiOff : AlertTriangle
  return (
    <div className="card flex flex-col items-center border-red-200 px-6 py-12 text-center dark:border-red-900/60" role="alert">
      <Icon className="mb-3 h-8 w-8 text-red-500" aria-hidden />
      <h3 className="text-lg font-bold">{offline ? "You're offline" : 'Could not load this page'}</h3>
      <p className="muted mt-1 max-w-sm">{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && <Button variant="secondary" className="mt-5" onClick={() => onRetry()}>Try again</Button>}
    </div>
  )
}

export const PageHeader = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {description && <p className="muted mt-1">{description}</p>}
    </div>
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
)
