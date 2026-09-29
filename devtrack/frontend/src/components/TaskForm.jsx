import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { tasksApi } from '../services/endpoints'
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants'
import { emptyToNull, toInputDate } from '../utils/format'
import Button from './Button'
import { Field, Select, TextArea } from './Field'

/** `projects` populates the project picker; pass `fixedProjectId` to lock it (project detail page). */
export default function TaskForm({ task, projects = [], fixedProjectId, onSaved, onCancel }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: task?.title ?? '', description: task?.description ?? '',
    project_id: task?.project_id ?? fixedProjectId ?? projects[0]?.id ?? '',
    status: task?.status ?? 'todo', priority: task?.priority ?? 'medium', due_date: toInputDate(task?.due_date),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = emptyToNull(form)
      const saved = task ? await tasksApi.update(task.id, payload) : await tasksApi.create(payload)
      toast.success(task ? 'Task updated' : 'Task created')
      onSaved(saved)
    } catch (err) {
      setErrors(err.fieldErrors ?? {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Title" value={form.title} onChange={set('title')} error={errors.title} required maxLength={200} />
      <TextArea label="Description" value={form.description} onChange={set('description')} error={errors.description} />
      {!fixedProjectId && (
        <Select label="Project" value={form.project_id} onChange={set('project_id')} error={errors.project_id}
          options={projects.length ? projects.map((p) => ({ value: p.id, label: p.name })) : [{ value: '', label: 'Create a project first' }]} />
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Status" options={TASK_STATUSES} value={form.status} onChange={set('status')} error={errors.status} />
        <Select label="Priority" options={TASK_PRIORITIES} value={form.priority} onChange={set('priority')} error={errors.priority} />
        <Field label="Due date" type="date" value={form.due_date} onChange={set('due_date')} error={errors.due_date} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving} disabled={!form.project_id}>{task ? 'Save changes' : 'Create task'}</Button>
      </div>
    </form>
  )
}
