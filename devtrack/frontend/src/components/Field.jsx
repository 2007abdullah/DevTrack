import { useId } from 'react'

function Wrapper({ label, error, hint, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p className="muted mt-1">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  )
}

export function Field({ label, error, hint, ...props }) {
  const id = useId()
  return (
    <Wrapper {...{ label, error, hint, id }}>
      <input id={id} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props} />
    </Wrapper>
  )
}

export function TextArea({ label, error, hint, rows = 3, ...props }) {
  const id = useId()
  return (
    <Wrapper {...{ label, error, hint, id }}>
      <textarea id={id} rows={rows} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props} />
    </Wrapper>
  )
}

export function Select({ label, error, hint, options, ...props }) {
  const id = useId()
  return (
    <Wrapper {...{ label, error, hint, id }}>
      <select id={id} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrapper>
  )
}
