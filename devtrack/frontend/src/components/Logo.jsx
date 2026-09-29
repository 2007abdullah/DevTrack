import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 font-display text-xl font-extrabold text-ink-900 dark:text-white ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><Check className="h-5 w-5" strokeWidth={3} aria-hidden /></span>
      DevTrack
    </Link>
  )
}
