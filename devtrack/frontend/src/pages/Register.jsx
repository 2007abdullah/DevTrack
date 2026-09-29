import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import { Field } from '../components/Field'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (form.password !== form.confirm) return setErrors({ confirm: 'Passwords do not match' })
    setErrors({})
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors(err.fieldErrors ?? {})
      setFormError(err.status === 409 || !Object.keys(err.fieldErrors ?? {}).length ? err.message : '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start tracking your projects in a minute."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{formError}</div>}
        <Field label="Name" autoComplete="name" required value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters" />
        <Field label="Confirm password" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" loading={loading} className="w-full">Create account</Button>
      </form>
    </AuthShell>
  )
}
