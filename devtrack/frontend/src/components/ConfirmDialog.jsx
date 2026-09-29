import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const handle = async () => {
    setBusy(true)
    try { await onConfirm() } finally { setBusy(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={title} size="max-w-md">
      <p className="text-sm text-ink-600 dark:text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={handle} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
