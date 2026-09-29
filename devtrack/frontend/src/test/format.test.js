import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from '../utils/errors'
import { dueLabel, emptyToNull, initials, parseDate, parseList } from '../utils/format'

describe('format helpers', () => {
  const now = new Date(2026, 8, 29)

  it('parses date-only strings as local dates', () => {
    const d = parseDate('2026-01-05')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 0, 5])
  })

  it('describes due dates relative to today', () => {
    expect(dueLabel('2026-09-29', now)).toBe('Due today')
    expect(dueLabel('2026-09-30', now)).toBe('Due tomorrow')
    expect(dueLabel('2026-10-05', now)).toBe('In 6 days')
    expect(dueLabel('2026-09-27', now)).toBe('2d overdue')
    expect(dueLabel(null, now)).toBe('No date')
  })

  it('builds initials and de-duplicated lists', () => {
    expect(initials('Ada Lovelace King')).toBe('AL')
    expect(parseList('React, react ,, Vite, React')).toEqual(['React', 'react', 'Vite'])
  })

  it('converts empty strings to null', () => {
    expect(emptyToNull({ a: '', b: 'x' })).toEqual({ a: null, b: 'x' })
  })
})

describe('error normalisation', () => {
  it('handles network failures', () => {
    const err = toApiError(new Error('Network Error'))
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(0)
  })

  it('maps validation errors to fields', () => {
    const err = toApiError({ response: { status: 422, data: { detail: 'Validation failed', errors: [{ field: 'email', message: 'bad' }] } } })
    expect(err.fieldErrors).toEqual({ email: 'bad' })
  })

  it('hides server error details', () => {
    expect(toApiError({ response: { status: 500, data: { detail: 'stack trace' } } }).message).not.toContain('stack')
  })
})
