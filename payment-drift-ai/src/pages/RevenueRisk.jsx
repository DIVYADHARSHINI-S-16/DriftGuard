import { useState, useMemo } from 'react'
import StatusBadge from '../components/StatusBadge'
import { customers, formatINR } from '../data/customers'

export default function RevenueRisk({ demoMode }) {
  const [sortKey, setSortKey] = useState('revenueAtRisk')

  const total = customers.reduce((s, c) => s + c.revenueAtRisk, 0)
  const critical = customers.filter((c) => c.driftLevel === 'Critical').reduce((s, c) => s + c.revenueAtRisk, 0)
  const high = customers.filter((c) => c.driftLevel === 'High').reduce((s, c) => s + c.revenueAtRisk, 0)
  const medium = customers.filter((c) => c.driftLevel === 'Medium').reduce((s, c) => s + c.revenueAtRisk, 0)
  const expectedRecoverable = demoMode === 'failure'
    ? 0
    : customers.reduce((s, c) => s + c.revenueAtRisk * c.recoveryProbability, 0)

  const rows = useMemo(() => {
    return [...customers].sort((a, b) => {
      if (sortKey === 'driftLevel') {
        const order = { Critical: 3, High: 2, Medium: 1, Low: 0 }
        return order[b.driftLevel] - order[a.driftLevel]
      }
      return b[sortKey] - a[sortKey]
    })
  }, [sortKey])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Revenue risk</h1>
        <p className="text-xs text-muted mt-1">Model-estimated exposure · scenario: {demoMode}. Expected recoverable is a simulated outcome and does not change the real dataset-derived risk totals.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          ['Total at risk', total],
          ['Critical', critical],
          ['High', high],
          ['Medium', medium],
          ['Expected recoverable', expectedRecoverable],
        ].map(([label, val]) => (
          <div key={label} className="bg-panel border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-2">{label}</p>
            <p className="text-lg font-medium font-currency">{formatINR(Math.round(val))}</p>
          </div>
        ))}
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden">
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">All flagged customers</p>
            <p className="text-xs text-muted mt-1">Top at-risk sample · recovery probability is a cohort-level estimate from held-out model precision.</p>
          </div>
          <select
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs outline-none"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="revenueAtRisk">Highest revenue at risk</option>
            <option value="recoveryProbability">Highest recovery probability</option>
            <option value="driftLevel">Highest drift</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Revenue at risk</th>
                <th className="px-5 py-3 font-normal">Recovery probability</th>
                <th className="px-5 py-3 font-normal">Expected recovery</th>
                <th className="px-5 py-3 font-normal">Drift</th>
                <th className="px-5 py-3 font-normal">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 font-currency">{formatINR(c.revenueAtRisk)}</td>
                  <td className="px-5 py-3 font-nums">{(c.recoveryProbability * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3 font-currency">{formatINR(Math.round(c.revenueAtRisk * c.recoveryProbability))}</td>
                  <td className="px-5 py-3"><StatusBadge level={c.driftLevel} /></td>
                  <td className="px-5 py-3 text-muted">{c.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
