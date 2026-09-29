import { CalendarClock, CheckCircle2, CircleDashed, FolderCheck, FolderKanban, FolderOpen, ListChecks, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PriorityBadge, ProgressBar, ProjectStatusBadge } from '../components/Badge'
import { ProductivityChart, ProjectStatusChart, TaskCompletionChart } from '../components/DashboardCharts'
import { EmptyState, ErrorState, PageHeader, RowSkeletons } from '../components/Feedback'
import StatCard from '../components/StatCard'
import { useAsync } from '../hooks/useAsync'
import { dashboardApi, projectsApi, tasksApi } from '../services/endpoints'
import { dueLabel, formatDate } from '../utils/format'

const loadDashboard = async () => {
  const [stats, projects, tasks] = await Promise.all([
    dashboardApi.stats(), projectsApi.list({ limit: 4 }), tasksApi.list({ limit: 5 }),
  ])
  return { stats, projects, tasks }
}

const Panel = ({ title, to, children }) => (
  <section className="card p-5">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      {to && <Link to={to} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">View all</Link>}
    </div>
    {children}
  </section>
)

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(loadDashboard)
  if (error) return <><PageHeader title="Overview" /><ErrorState error={error} onRetry={reload} /></>

  const s = data?.stats
  const stats = [
    { icon: FolderKanban, label: 'Total projects', value: s?.total_projects },
    { icon: FolderOpen, label: 'Active projects', value: s?.active_projects },
    { icon: FolderCheck, label: 'Completed projects', value: s?.completed_projects },
    { icon: ListChecks, label: 'Total tasks', value: s?.total_tasks },
    { icon: CheckCircle2, label: 'Completed tasks', value: s?.completed_tasks },
    { icon: CircleDashed, label: 'Pending tasks', value: s?.pending_tasks },
    { icon: CalendarClock, label: 'Deadlines in 14 days', value: s?.upcoming_deadline_count },
  ]

  if (!loading && s.total_projects === 0) {
    return (
      <>
        <PageHeader title="Overview" description="Your projects and tasks at a glance." />
        <EmptyState icon={FolderKanban} title="Create your first project" description="Projects group your tasks and track progress toward a deadline."
          action={<Link to="/projects" className="btn-primary"><Plus className="h-4 w-4" />New project</Link>} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Overview" description="Your projects and tasks at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => <StatCard key={st.label} {...st} loading={loading} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {loading ? [0, 1, 2].map((i) => <div key={i} className="skeleton h-72 rounded-xl" />) : (
          <>
            <ProjectStatusChart counts={s.project_status} />
            <TaskCompletionChart counts={s.task_status} />
            <ProductivityChart data={s.productivity} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Recent projects" to="/projects">
          {loading ? <RowSkeletons count={3} /> : data.projects.length === 0 ? <p className="muted">No projects yet.</p> : (
            <ul className="space-y-4">
              {data.projects.map((p) => (
                <li key={p.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Link to={`/projects/${p.id}`} className="truncate font-medium hover:text-brand-600">{p.name}</Link>
                    <ProjectStatusBadge value={p.status} />
                  </div>
                  <ProgressBar value={p.progress} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent tasks" to="/tasks">
          {loading ? <RowSkeletons count={3} /> : data.tasks.length === 0 ? <p className="muted">No tasks yet.</p> : (
            <ul className="space-y-3">
              {data.tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${t.status === 'completed' ? 'text-ink-400 line-through' : ''}`}>{t.title}</p>
                    <p className="muted truncate text-xs">{t.project_name}</p>
                  </div>
                  <PriorityBadge value={t.priority} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming deadlines">
          {loading ? <RowSkeletons count={3} /> : s.upcoming_deadlines.length === 0 ? <p className="muted">Nothing due in the next 14 days.</p> : (
            <ul className="space-y-3">
              {s.upcoming_deadlines.map((d) => (
                <li key={`${d.kind}-${d.id}`} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/projects/${d.project_id}`} className="block truncate text-sm font-medium hover:text-brand-600">{d.title}</Link>
                    <p className="muted text-xs">{d.kind === 'project' ? 'Project deadline' : 'Task'} · {formatDate(d.due_date)}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-300">{dueLabel(d.due_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
