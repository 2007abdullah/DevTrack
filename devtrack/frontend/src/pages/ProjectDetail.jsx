import { ArrowLeft, CalendarClock, ExternalLink, Github, ListChecks, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProgressBar, ProjectStatusBadge } from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import { EmptyState, ErrorState, RowSkeletons, Skeleton } from '../components/Feedback'
import Modal from '../components/Modal'
import ProjectForm from '../components/ProjectForm'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { projectsApi, tasksApi } from '../services/endpoints'
import { formatDate } from '../utils/format'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [taskModal, setTaskModal] = useState(null) // null | 'new' | task
  const [editingProject, setEditingProject] = useState(false)
  const [deletingTask, setDeletingTask] = useState(null)
  const [pendingId, setPendingId] = useState(null)

  const project = useAsync(() => projectsApi.get(id), [id])
  const tasks = useAsync(() => tasksApi.list({ project_id: id, sort: 'created_at', order: 'asc' }), [id])
  const refresh = () => { project.reload({ silent: true }); tasks.reload({ silent: true }) }

  if (project.error) return <ErrorState error={project.error} onRetry={project.reload} />
  const p = project.data

  const toggle = async (t) => {
    setPendingId(t.id)
    try {
      await tasksApi.update(t.id, { project_id: t.project_id, title: t.title, description: t.description, priority: t.priority, due_date: t.due_date, status: t.status === 'completed' ? 'todo' : 'completed' })
      refresh()
    } catch (err) { toast.error(err.message) } finally { setPendingId(null) }
  }

  const removeTask = async () => {
    try { await tasksApi.remove(deletingTask.id); toast.success('Task deleted'); setDeletingTask(null); refresh() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <Link to="/projects" className="muted mb-4 inline-flex items-center gap-1 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />All projects</Link>

      <section className="card p-6">
        {!p ? <div className="space-y-3"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-2 w-full" /></div> : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-extrabold sm:text-3xl">{p.name}</h1><ProjectStatusBadge value={p.status} /></div>
                <p className="muted mt-2 max-w-2xl">{p.description || 'No description yet.'}</p>
              </div>
              <Button variant="secondary" onClick={() => setEditingProject(true)}><Pencil className="h-4 w-4" />Edit</Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.technologies.map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs dark:bg-ink-700">{t}</span>)}
            </div>

            <div className="mt-5 max-w-lg"><ProgressBar value={p.progress} /><p className="muted mt-1 text-xs">{p.completed_task_count} of {p.task_count} tasks completed</p></div>

            <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm dark:border-ink-700 sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="muted">Start date</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium"><CalendarClock className="h-4 w-4 text-ink-400" />{formatDate(p.start_date)}</dd></div>
              <div><dt className="muted">Deadline</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium"><CalendarClock className="h-4 w-4 text-ink-400" />{formatDate(p.deadline)}</dd></div>
              <div><dt className="muted">GitHub</dt><dd className="mt-0.5 truncate font-medium">{p.github_url ? <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-brand-600"><Github className="h-4 w-4" />Repository</a> : '—'}</dd></div>
              <div><dt className="muted">Live site</dt><dd className="mt-0.5 truncate font-medium">{p.live_url ? <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-brand-600"><ExternalLink className="h-4 w-4" />Open site</a> : '—'}</dd></div>
            </dl>
          </>
        )}
      </section>

      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">Tasks</h2>
        <Button onClick={() => setTaskModal('new')} disabled={!p}><Plus className="h-4 w-4" />Add task</Button>
      </div>

      {tasks.error ? <ErrorState error={tasks.error} onRetry={tasks.reload} />
        : !tasks.data ? <RowSkeletons />
        : tasks.data.length === 0 ? <EmptyState icon={ListChecks} title="No tasks in this project" description="Break the work into tasks to track progress." action={<Button onClick={() => setTaskModal('new')}><Plus className="h-4 w-4" />Add task</Button>} />
        : <TaskList tasks={tasks.data} showProject={false} pendingId={pendingId} onToggle={toggle} onEdit={setTaskModal} onDelete={setDeletingTask} />}

      <Modal open={Boolean(taskModal)} onClose={() => setTaskModal(null)} title={taskModal === 'new' ? 'Add task' : 'Edit task'}>
        {taskModal && <TaskForm task={taskModal === 'new' ? null : taskModal} fixedProjectId={id} onCancel={() => setTaskModal(null)} onSaved={() => { setTaskModal(null); refresh() }} />}
      </Modal>
      <Modal open={editingProject} onClose={() => setEditingProject(false)} title="Edit project" size="max-w-2xl">
        {editingProject && <ProjectForm project={p} onCancel={() => setEditingProject(false)} onSaved={() => { setEditingProject(false); refresh() }} />}
      </Modal>
      <ConfirmDialog open={Boolean(deletingTask)} onClose={() => setDeletingTask(null)} onConfirm={removeTask} title="Delete task?" message={`"${deletingTask?.title}" will be permanently deleted.`} />
    </>
  )
}
