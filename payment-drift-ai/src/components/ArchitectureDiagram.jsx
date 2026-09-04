const stages = [
  { title: 'UCI dataset', detail: 'Default of Credit Card Clients' },
  { title: 'Analysis step', detail: 'Stats + logistic regression' },
  { title: 'realStats.json', detail: 'Single computed source of truth' },
  { title: 'Dashboard pages', detail: 'Overview, risk, customers, methodology' },
]

export default function ArchitectureDiagram() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5" aria-label="DriftGuard data pipeline diagram">
      <p className="text-sm font-medium mb-4">Data pipeline</p>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <div key={stage.title} className="relative">
            <div className="h-full min-w-0 rounded-lg border border-border bg-bg p-3">
              <p className="text-sm font-medium break-words">{stage.title}</p>
              <p className="text-xs text-muted mt-1 break-words">{stage.detail}</p>
            </div>
            {index < stages.length - 1 && <span className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-accent bg-panel px-1" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
