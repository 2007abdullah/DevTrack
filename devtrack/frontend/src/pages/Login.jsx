import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import { Field } from '../components/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Documented development-only demo account (created by `python -m app.seed`).
const DEMO = { email: 'demo@devtrack.dev', password: 'DemoPass123!' }

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const toast = useToast()
  const [form, setForm] = useState(params.get('demo') ? DEMO : { email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
      if (err.status === 0) toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up where you left off."
      footer={<>New to DevTrack? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</div>}
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" loading={loading} className="w-full">Log in</Button>
        <button type="button" onClick={() => setForm(DEMO)} className="muted w-full text-center hover:underline">Fill in the demo account</button>
      </form>
    </AuthShell>
  )
}
