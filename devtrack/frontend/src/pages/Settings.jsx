import { LogOut, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Field } from '../components/Field'
import { PageHeader } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { usersApi } from '../services/endpoints'

const Section = ({ title, description, children }) => (
  <section className="card p-6">
    <h2 className="text-lg font-bold">{title}</h2>
    <p className="muted mb-5">{description}</p>
    {children}
  </section>
)

export default function Settings() {
  const { user, setUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()

  const [account, setAccount] = useState({ name: user.name, email: user.email })
  const [accountErrors, setAccountErrors] = useState({})
  const [savingAccount, setSavingAccount] = useState(false)

  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [savingPw, setSavingPw] = useState(false)

  const saveAccount = async (e) => {
    e.preventDefault()
    setSavingAccount(true)
    setAccountErrors({})
    try { setUser(await usersApi.update(account)); toast.success('Account updated') }
    catch (err) { setAccountErrors(err.fieldErrors ?? {}); toast.error(err.message) }
    finally { setSavingAccount(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pw.new_password !== pw.confirm) return setPwErrors({ confirm: 'Passwords do not match' })
    setSavingPw(true)
    setPwErrors({})
    try {
      await usersApi.changePassword({ current_password: pw.current_password, new_password: pw.new_password })
      setPw({ current_password: '', new_password: '', confirm: '' })
      toast.success('Password changed')
    } catch (err) {
      setPwErrors(err.status === 400 ? { current_password: err.message } : err.fieldErrors ?? {})
      toast.error(err.message)
    } finally { setSavingPw(false) }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, appearance and security." />
      <div className="max-w-2xl space-y-6">
        <Section title="Account" description="Your name and sign-in email.">
          <form onSubmit={saveAccount} className="space-y-4" noValidate>
            <Field label="Name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} error={accountErrors.name} />
            <Field label="Email" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} error={accountErrors.email} />
            <Button type="submit" loading={savingAccount}>Save changes</Button>
          </form>
        </Section>

        <Section title="Appearance" description="Choose how DevTrack looks on this device.">
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
            {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([value, Icon, label]) => (
              <button key={value} role="radio" aria-checked={theme === value} onClick={() => setTheme(value)}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors ${theme === value ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-200' : 'border-slate-200 hover:border-slate-300 dark:border-ink-600'}`}>
                <Icon className="h-5 w-5" />{label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Security" description="Use a strong password you don't use elsewhere.">
          <form onSubmit={changePassword} className="space-y-4" noValidate>
            <Field label="Current password" type="password" autoComplete="current-password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} error={pwErrors.current_password} required />
            <Field label="New password" type="password" autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} error={pwErrors.new_password} hint="At least 8 characters" required />
            <Field label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErrors.confirm} required />
            <Button type="submit" loading={savingPw}>Change password</Button>
          </form>
        </Section>

        <Section title="Session" description="Sign out of DevTrack on this device.">
          <Button variant="secondary" onClick={() => { logout(); navigate('/login') }}><LogOut className="h-4 w-4" />Log out</Button>
        </Section>
      </div>
    </>
  )
}
