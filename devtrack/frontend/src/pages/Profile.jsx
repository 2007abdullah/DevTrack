import { Github, Globe, Linkedin, Mail } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../layouts/DashboardLayout'
import Button from '../components/Button'
import { Field, TextArea } from '../components/Field'
import { PageHeader } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usersApi } from '../services/endpoints'
import { emptyToNull, parseList } from '../utils/format'

const link = (href, Icon, label) => href && (
  <a href={href} target="_blank" rel="noreferrer" className="btn-secondary"><Icon className="h-4 w-4" />{label}</a>
)

export default function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    name: user.name, email: user.email, bio: user.bio ?? '', profile_picture: user.profile_picture ?? '',
    skills: user.skills.join(', '), github_url: user.github_url ?? '', linkedin_url: user.linkedin_url ?? '', portfolio_url: user.portfolio_url ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      setUser(await usersApi.update(emptyToNull({ ...form, skills: parseList(form.skills) })))
      toast.success('Profile saved')
    } catch (err) {
      setErrors(err.fieldErrors ?? {})
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  return (
    <>
      <PageHeader title="Profile" description="How you appear in DevTrack." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card h-fit p-6 text-center">
          <div className="flex justify-center"><Avatar user={user} size="h-24 w-24 text-2xl" /></div>
          <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
          <p className="muted flex items-center justify-center gap-1.5"><Mail className="h-4 w-4" />{user.email}</p>
          <p className="mt-4 text-sm text-ink-600 dark:text-slate-300">{user.bio || 'Add a short bio to tell people what you build.'}</p>
          {user.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {user.skills.map((s) => <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-700/25 dark:text-brand-200">{s}</span>)}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {link(user.github_url, Github, 'GitHub')}{link(user.linkedin_url, Linkedin, 'LinkedIn')}{link(user.portfolio_url, Globe, 'Portfolio')}
          </div>
        </aside>

        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={form.name} onChange={set('name')} error={errors.name} required />
            <Field label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
          </div>
          <TextArea label="Bio" value={form.bio} onChange={set('bio')} error={errors.bio} maxLength={1000} />
          <Field label="Profile picture URL" type="url" placeholder="https://" value={form.profile_picture} onChange={set('profile_picture')} error={errors.profile_picture} />
          <Field label="Skills" value={form.skills} onChange={set('skills')} hint="Separate with commas" error={errors.skills} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GitHub" type="url" value={form.github_url} onChange={set('github_url')} error={errors.github_url} />
            <Field label="LinkedIn" type="url" value={form.linkedin_url} onChange={set('linkedin_url')} error={errors.linkedin_url} />
            <Field label="Portfolio" type="url" value={form.portfolio_url} onChange={set('portfolio_url')} error={errors.portfolio_url} />
          </div>
          <div className="flex justify-end"><Button type="submit" loading={saving}>Save profile</Button></div>
        </form>
      </div>
    </>
  )
}
