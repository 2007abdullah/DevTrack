import { Loader2 } from 'lucide-react'

const VARIANTS = { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', danger: 'btn-danger' }

export default function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...props }) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
