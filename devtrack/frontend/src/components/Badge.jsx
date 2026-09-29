import { lookup, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants'

const TONES = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-ink-700 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-700/25 dark:text-brand-200',
  green: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
}

export function Badge({ tone = 'slate', children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>
}

const make = (list) => ({ value }) => {
  const { label, tone } = lookup(list, value)
  return <Badge tone={tone}>{label}</Badge>
}
export const ProjectStatusBadge = make(PROJECT_STATUSES)
export const TaskStatusBadge = make(TASK_STATUSES)
export const PriorityBadge = make(TASK_PRIORITIES)

export function ProgressBar({ value, label = true }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
      {label && <span className="w-9 text-right text-xs font-medium tabular-nums text-ink-500 dark:text-ink-400">{value}%</span>}
    </div>
  )
}
