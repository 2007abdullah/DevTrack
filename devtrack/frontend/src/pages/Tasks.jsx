import { ListChecks, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import { EmptyState, ErrorState, PageHeader, RowSkeletons } from '../components/Feedback'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { projectsApi, tasksApi } from '../services/endpoints'
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants'

const SORTS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'due_date:asc', label: 'Due soonest' },
  { value: 'priority:desc', label: 'Highest priority' },
  { value: 'title:asc', label: 'Title A–Z' },
]

export default function Tasks() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [projectId, setProjectId] = useState('all')
  const [sort, setSort] = useState(SORTS[0].value)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const q = useDebounce(search)

  const projects = useAsync(() => projectsApi.list({ sort: 'name', order: 'asc' }), [])
  const { data: tasks, loading, error, reload } = useAsync(() => {
    const [sortBy, order] = sort.split(':')
    return tasksApi.list({ q, status, priority, project_id: projectId, sort: sortBy, order })
  }, [q, status, priority, projectId, sort])

  const toggle = async (t) => {
    setPendingId(t.id)
    try {
      await tasksApi.update(t.id, { project_id: t.project_id, title: t.title, description: t.description, priority: t.priority, due_date: t.due_date, status: t.status === 'completed' ? 'todo' : 'completed' })
      reload({ silent: true })
    } catch (err) { toast.error(err.message) } finally { setPendingId(null) }
  }

  const confirmDelete = async () => {
    try { await tasksApi.remove(deleting.id); toast.success('Task deleted'); setDeleting(null); reload({ silent: true }) }
    catch (err) { toast.error(err.message) }
  }

  const filtered = Boolean(q || status !== 'all' || priority !== 'all' || projectId !== 'all')
  const noProjects = projects.data?.length === 0

  return (
    <>
      <PageHeader title="Tasks" description="Every task across your projects."
        actions={<Button onClick={() => setEditing('new')} disabled={!projects.data?.length}><Plus className="h-4 w-4" />New task</Button>} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(4,auto)]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-400" aria-hidden />
          <input className="input pl-9" placeholder="Search tasks" aria-label="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>{TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input" aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All priorities</option>{TASK_PRIORITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input" aria-label="Filter by project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="all">All projects</option>{(projects.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input" aria-label="Sort tasks" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error ? <ErrorState error={error} onRetry={reload}
      /> : loading && !tasks ? <RowSkeletons count={6}
      /> : tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title={filtered ? 'No tasks match your filters' : 'No tasks yet'}
          description={noProjects ? 'Tasks belong to a project. Create a project first.' : filtered ? 'Try a different search or clear the filters.' : 'Add your first task to start tracking work.'}
          action={!filtered && !noProjects && <Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" />New task</Button>} />
      ) : (
        <div className={loading ? 'opacity-60' : ''}><TaskList tasks={tasks} pendingId={pendingId} onToggle={toggle} onEdit={setEditing} onDelete={setDeleting} /></div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'New task' : 'Edit task'}>
        {editing && <TaskForm task={editing === 'new' ? null : editing} projects={projects.data ?? []} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload({ silent: true }) }} />}
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} title="Delete task?" message={`"${deleting?.title}" will be permanently deleted.`} />
    </>
  )
}
