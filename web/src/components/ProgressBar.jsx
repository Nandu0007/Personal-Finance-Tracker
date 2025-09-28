export default function ProgressBar({ value = 0, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const status = pct >= 100 ? 'danger' : pct >= 75 ? 'accent' : 'success'
  return (
    <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: 10, transition: 'width 300ms ease', background: `var(--${status})` }} />
    </div>
  )
}