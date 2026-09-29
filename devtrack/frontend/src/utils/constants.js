export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', tone: 'slate' },
  { value: 'in_progress', label: 'In progress', tone: 'brand' },
  { value: 'completed', label: 'Completed', tone: 'green' },
  { value: 'on_hold', label: 'On hold', tone: 'amber' },
]

export const TASK_STATUSES = [
  { value: 'todo', label: 'To do', tone: 'slate' },
  { value: 'in_progress', label: 'In progress', tone: 'brand' },
  { value: 'completed', label: 'Completed', tone: 'green' },
]

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', tone: 'slate' },
  { value: 'medium', label: 'Medium', tone: 'blue' },
  { value: 'high', label: 'High', tone: 'amber' },
  { value: 'critical', label: 'Critical', tone: 'red' },
]

export const lookup = (list, value) => list.find((i) => i.value === value) ?? { label: value, tone: 'slate' }

export const CHART_COLORS = {
  planning: '#8B94B0',
  in_progress: '#1A9F89',
  completed: '#3B82F6',
  on_hold: '#F59E0B',
  todo: '#8B94B0',
}
