import { Check, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { daysUntil, dueLabel } from '../utils/format'
import { PriorityBadge, TaskStatusBadge } from './Badge'

function DueDate({ task }) {
  if (!task.due_date) return <span className="muted">—</span>
  const overdue = task.status !== 'completed' && daysUntil(task.due_date) < 0
  return <span className={`text-sm ${overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-ink-600 dark:text-slate-300'}`}>{dueLabel(task.due_date)}</span>
}

/** Responsive list: a table on md+ screens, stacked cards on small screens. */
export default function TaskList({ tasks, onToggle, onEdit, onDelete, showProject = true, pendingId }) {
  const check = (t) => (
    <button onClick={() => onToggle(t)} disabled={pendingId === t.id} aria-label={t.status === 'completed' ? `Reopen ${t.title}` : `Mark ${t.title} complete`}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors disabled:opacity-50 ${t.status === 'completed' ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 hover:border-brand-500 dark:border-ink-500'}`}>
      {t.status === 'completed' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  )
  const actions = (t) => (
    <div className="flex justify-end gap-0.5">
      <button onClick={() => onEdit(t)} className="btn-ghost h-8 w-8 !p-0" aria-label={`Edit ${t.title}`}><Pencil className="h-4 w-4" /></button>
      <button onClick={() => onDelete(t)} className="btn-ghost h-8 w-8 !p-0 hover:!text-red-600" aria-label={`Delete ${t.title}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  )
  const title = (t) => <span className={t.status === 'completed' ? 'text-ink-400 line-through' : 'font-medium'}>{t.title}</span>

  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-ink-500 dark:border-ink-700 dark:text-ink-400">
            <tr>
              <th className="w-12 px-4 py-3" scope="col"><span className="sr-only">Complete</span></th>
              <th className="px-2 py-3 font-medium" scope="col">Task</th>
              {showProject && <th className="px-2 py-3 font-medium" scope="col">Project</th>}
              <th className="px-2 py-3 font-medium" scope="col">Status</th>
              <th className="px-2 py-3 font-medium" scope="col">Priority</th>
              <th className="px-2 py-3 font-medium" scope="col">Due</th>
              <th className="px-4 py-3" scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-ink-700/40">
                <td className="px-4 py-3">{check(t)}</td>
                <td className="max-w-xs truncate px-2 py-3">{title(t)}</td>
                {showProject && <td className="px-2 py-3"><Link to={`/projects/${t.project_id}`} className="text-ink-600 hover:text-brand-600 dark:text-slate-300">{t.project_name}</Link></td>}
                <td className="px-2 py-3"><TaskStatusBadge value={t.status} /></td>
                <td className="px-2 py-3"><PriorityBadge value={t.priority} /></td>
                <td className="px-2 py-3"><DueDate task={t} /></td>
                <td className="px-4 py-3">{actions(t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {tasks.map((t) => (
          <li key={t.id} className="card p-4">
            <div className="flex items-start gap-3">
              {check(t)}
              <div className="min-w-0 flex-1">
                <p className="text-sm">{title(t)}</p>
                {showProject && <p className="muted text-xs">{t.project_name}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2"><TaskStatusBadge value={t.status} /><PriorityBadge value={t.priority} /><DueDate task={t} /></div>
              </div>
              {actions(t)}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
