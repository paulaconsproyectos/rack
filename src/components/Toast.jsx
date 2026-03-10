export function Toast({ message }) {
  if (!message) return null
  return <div className="toast" role="status" aria-live="polite">{message}</div>
}

export function PtsFloat({ pts }) {
  if (!pts) return null
  return <div className="pts-float" aria-hidden="true">{pts} pts</div>
}
