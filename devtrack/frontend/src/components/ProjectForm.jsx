import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { projectsApi } from '../services/endpoints'
import { PROJECT_STATUSES } from '../utils/constants'
import { emptyToNull, parseList, toInputDate } from '../utils/format'
import Button from './Button'
import { Field, Select, TextArea } from './Field'

export default function ProjectForm({ project, onSaved, onCancel }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: project?.name ?? '', description: project?.description ?? '',
    technologies: (project?.technologies ?? []).join(', '),
    github_url: project?.github_url ?? '', live_url: project?.live_url ?? '',
    status: project?.status ?? 'planning',
    start_date: toInputDate(project?.start_date), deadline: toInputDate(project?.deadline),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const payload = emptyToNull({ ...form, technologies: parseList(form.technologies) })
    try {
      const saved = project ? await projectsApi.update(project.id, payload) : await projectsApi.create(payload)
      toast.success(project ? 'Project updated' : 'Project created')
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
      <Field label="Name" value={form.name} onChange={set('name')} error={errors.name} required maxLength={120} />
      <TextArea label="Description" value={form.description} onChange={set('description')} error={errors.description} />
      <Field label="Technology stack" value={form.technologies} onChange={set('technologies')} hint="Separate with commas, e.g. React, FastAPI, PostgreSQL" error={errors.technologies} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="GitHub URL" type="url" placeholder="https://github.com/you/repo" value={form.github_url} onChange={set('github_url')} error={errors.github_url} />
        <Field label="Live URL" type="url" placeholder="https://" value={form.live_url} onChange={set('live_url')} error={errors.live_url} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Status" options={PROJECT_STATUSES} value={form.status} onChange={set('status')} error={errors.status} />
        <Field label="Start date" type="date" value={form.start_date} onChange={set('start_date')} error={errors.start_date} />
        <Field label="Deadline" type="date" value={form.deadline} onChange={set('deadline')} error={errors.deadline || errors['']} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{project ? 'Save changes' : 'Create project'}</Button>
      </div>
    </form>
  )
}
