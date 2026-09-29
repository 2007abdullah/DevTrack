import { FolderKanban, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import { CardSkeletons, EmptyState, ErrorState, PageHeader } from '../components/Feedback'
import Modal from '../components/Modal'
import ProjectCard from '../components/ProjectCard'
import ProjectForm from '../components/ProjectForm'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { projectsApi } from '../services/endpoints'
import { PROJECT_STATUSES } from '../utils/constants'

const SORTS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'deadline:asc', label: 'Deadline soonest' },
  { value: 'status:asc', label: 'Status' },
]

export default function Projects() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState(SORTS[0].value)
  const [editing, setEditing] = useState(null) // null | 'new' | project
  const [deleting, setDeleting] = useState(null)
  const q = useDebounce(search)

  const { data: projects, loading, error, reload } = useAsync(() => {
    const [sortBy, order] = sort.split(':')
    return projectsApi.list({ q, status, sort: sortBy, order })
  }, [q, status, sort])

  const confirmDelete = async () => {
    try {
      await projectsApi.remove(deleting.id)
      toast.success('Project deleted')
      setDeleting(null)
      reload({ silent: true })
    } catch (err) { toast.error(err.message) }
  }

  const filtered = Boolean(q || status !== 'all')

  return (
    <>
      <PageHeader title="Projects" description="Everything you're building, in one place."
        actions={<Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" />New project</Button>} />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-400" aria-hidden />
          <input className="input pl-9" placeholder="Search projects" aria-label="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-44" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input sm:w-44" aria-label="Sort projects" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error ? <ErrorState error={error} onRetry={reload} />
        : loading && !projects ? <CardSkeletons count={6} height="h-64" />
        : projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title={filtered ? 'No projects match your filters' : 'No projects yet'}
            description={filtered ? 'Try a different search or clear the filters.' : 'Create a project to start organizing tasks and tracking progress.'}
            action={!filtered && <Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" />New project</Button>} />
        ) : (
          <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {projects.map((p) => <ProjectCard key={p.id} project={p} onEdit={setEditing} onDelete={setDeleting} />)}
          </div>
        )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'New project' : 'Edit project'} size="max-w-2xl">
        {editing && <ProjectForm project={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload({ silent: true }) }} />}
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} title="Delete project?"
        message={`"${deleting?.name}" and all of its tasks will be permanently deleted.`} />
    </>
  )
}
