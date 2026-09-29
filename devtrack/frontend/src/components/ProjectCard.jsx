import { CalendarClock, ExternalLink, Github, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/format'
import { ProgressBar, ProjectStatusBadge } from './Badge'

export default function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <article className="card flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/projects/${project.id}`} className="min-w-0 rounded focus-visible:ring-offset-0">
          <h3 className="truncate text-lg font-bold hover:text-brand-600 dark:hover:text-brand-300">{project.name}</h3>
        </Link>
        <ProjectStatusBadge value={project.status} />
      </div>
      <p className="muted mt-2 line-clamp-2 min-h-[2.5rem]">{project.description || 'No description yet.'}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 4).map((t) => (
          <span key={t} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-ink-600 dark:bg-ink-700 dark:text-slate-300">{t}</span>
        ))}
        {project.technologies.length > 4 && <span className="muted">+{project.technologies.length - 4}</span>}
      </div>
      <div className="mt-4">
        <ProgressBar value={project.progress} />
        <p className="muted mt-1 text-xs">{project.completed_task_count} of {project.task_count} tasks done</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-ink-700">
        <span className="muted flex items-center gap-1.5 text-xs"><CalendarClock className="h-4 w-4" aria-hidden />{formatDate(project.deadline)}</span>
        <div className="flex items-center gap-0.5">
          {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="btn-ghost h-8 w-8 !p-0" aria-label={`${project.name} on GitHub`}><Github className="h-4 w-4" /></a>}
          {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="btn-ghost h-8 w-8 !p-0" aria-label={`Open ${project.name} live site`}><ExternalLink className="h-4 w-4" /></a>}
          <button onClick={() => onEdit(project)} className="btn-ghost h-8 w-8 !p-0" aria-label={`Edit ${project.name}`}><Pencil className="h-4 w-4" /></button>
          <button onClick={() => onDelete(project)} className="btn-ghost h-8 w-8 !p-0 hover:!text-red-600" aria-label={`Delete ${project.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  )
}
