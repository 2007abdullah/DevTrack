import { Skeleton } from './Feedback'

export default function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-ink-700 dark:text-brand-300"><Icon className="h-5 w-5" aria-hidden /></span>
      <div className="min-w-0">
        <p className="muted truncate">{label}</p>
        {loading ? <Skeleton className="mt-1 h-7 w-12" /> : <p className="font-display text-2xl font-extrabold tabular-nums">{value}</p>}
      </div>
    </div>
  )
}
