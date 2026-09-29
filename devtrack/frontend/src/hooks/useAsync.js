import { useCallback, useEffect, useRef, useState } from 'react'

/** Runs an async loader on mount and whenever `deps` change. Ignores stale responses. */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const requestId = useRef(0)

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await loader()
      if (id === requestId.current) setState({ data, loading: false, error: null })
    } catch (error) {
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])
  return { ...state, reload: run }
}
