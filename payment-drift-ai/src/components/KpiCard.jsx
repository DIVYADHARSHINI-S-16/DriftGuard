export default function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-panel border border-border rounded-xl p-4">
      <p className="text-xs text-muted mb-2">{label}</p>
      <p className="text-2xl font-medium font-nums text-accent">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}
