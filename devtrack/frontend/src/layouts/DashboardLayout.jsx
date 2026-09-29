import { FolderKanban, LayoutDashboard, ListChecks, LogOut, Menu, Settings as SettingsIcon, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Avatar({ user, size = 'h-9 w-9' }) {
  return user?.profile_picture
    ? <img src={user.profile_picture} alt="" className={`${size} rounded-full object-cover`} />
    : <span className={`${size} grid place-items-center rounded-full bg-brand-600 text-sm font-bold text-white`}>{initials(user?.name)}</span>
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const signOut = () => { logout(); navigate('/login') }

  const sidebar = (
    <nav className="flex h-full flex-col p-4" aria-label="Main">
      <Logo to="/dashboard" className="mb-8 px-2" />
      <ul className="space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-ink-700'}`}>
              <Icon className="h-5 w-5" aria-hidden />{label}
            </NavLink>
          </li>
        ))}
      </ul>
      <button onClick={signOut} className="btn-ghost mt-auto justify-start"><LogOut className="h-5 w-5" aria-hidden />Log out</button>
    </nav>
  )

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white dark:border-ink-700 dark:bg-ink-900 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-rise bg-white dark:bg-ink-900">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur dark:border-ink-700 dark:bg-ink-950/90 sm:px-8">
        <button onClick={() => setOpen(!open)} className="btn-ghost h-9 w-9 !p-0 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <p className="muted hidden lg:block">Welcome back, <span className="font-medium text-ink-800 dark:text-white">{user?.name?.split(' ')[0]}</span></p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => navigate('/profile')} aria-label="Open profile"><Avatar user={user} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><Outlet /></main>
    </div>
  )
}
