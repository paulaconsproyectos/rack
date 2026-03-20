export function Toast({ toast }) {
  if (!toast) return null
  return <div className="toast" role="status" aria-live="polite">{toast}</div>
}

export function PtsFloat({ pts }) {
  if (!pts) return null
  return <div className="pts-float" aria-hidden="true">{pts} pts</div>
}
