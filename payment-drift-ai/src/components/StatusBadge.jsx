const levelMap = {
  Healthy: 'healthy', Low: 'healthy',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
}

export default function StatusBadge({ level }) {
  const key = levelMap[level] || 'medium'
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md text-xs font-medium"
      style={{ background: `var(--${key}-bg)`, color: `var(--${key}-fg)` }}
    >
      {level}
    </span>
  )
}
