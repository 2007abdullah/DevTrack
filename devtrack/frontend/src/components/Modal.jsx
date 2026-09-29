import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children, size = 'max-w-xl' }) {
  const panel = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector('input, textarea, select, button')?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className={`card flex max-h-[92vh] w-full animate-rise flex-col rounded-b-none shadow-2xl sm:rounded-b-xl ${size}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-ink-700">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="btn-ghost h-8 w-8 !p-0" aria-label="Close dialog"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
