import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const [ptsFloat, setPtsFloat] = useState(null)

  const showToast = useCallback((msg, duration = 2500) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }, [])

  const showPts = useCallback((pts) => {
    setPtsFloat(pts)
    setTimeout(() => setPtsFloat(null), 1300)
  }, [])

  return { toast, ptsFloat, showToast, showPts }
}
