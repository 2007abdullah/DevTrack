import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART_COLORS, PROJECT_STATUSES, TASK_STATUSES } from '../utils/constants'
import { formatDate } from '../utils/format'

const tooltipStyle = { borderRadius: 8, border: '1px solid #262D42', background: '#1B2030', color: '#fff', fontSize: 12 }

export function ChartCard({ title, subtitle, children, empty }) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-bold">{title}</h2>
      <p className="muted mb-4 text-xs">{subtitle}</p>
      <div className="h-56">{empty ? <div className="muted grid h-full place-items-center text-center">Nothing to chart yet.</div> : children}</div>
    </section>
  )
}

function Legend({ items }) {
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />{i.name} ({i.value})</li>
      ))}
    </ul>
  )
}

export function StatusDonut({ counts, statuses, title, subtitle }) {
  const items = statuses.map((s) => ({ name: s.label, value: counts?.[s.value] ?? 0, color: CHART_COLORS[s.value] }))
  const total = items.reduce((n, i) => n + i.value, 0)
  return (
    <ChartCard title={title} subtitle={subtitle} empty={total === 0}>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={items.filter((i) => i.value)} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
            {items.filter((i) => i.value).map((i) => <Cell key={i.name} fill={i.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <Legend items={items} />
    </ChartCard>
  )
}

export const ProjectStatusChart = ({ counts }) => (
  <StatusDonut counts={counts} statuses={PROJECT_STATUSES} title="Project status" subtitle="Projects by current state" />
)
export const TaskCompletionChart = ({ counts }) => (
  <StatusDonut counts={counts} statuses={TASK_STATUSES} title="Task completion" subtitle="Tasks by status" />
)

export function ProductivityChart({ data }) {
  const rows = (data ?? []).map((d) => ({ day: formatDate(d.date, { weekday: 'short' }), completed: d.completed }))
  const empty = rows.every((r) => r.completed === 0)
  return (
    <ChartCard title="Productivity" subtitle="Tasks completed in the last 7 days" empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ left: -20, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8B94B033" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#8B94B022' }} />
          <Bar dataKey="completed" name="Completed" fill="#1A9F89" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
