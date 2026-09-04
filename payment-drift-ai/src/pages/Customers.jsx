import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { customers, formatINR, overall, drift, kpis } from '../data/customers'

export default function Customers() {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('revenueAtRisk')
  const [cohort, setCohort] = useState('at-risk')

  const rows = useMemo(() => {
    return customers
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[sortKey] - a[sortKey])
  }, [query, sortKey])

  const label = (c) => `${c.lateAvgDelayMonths} mo`
  const hasRows = rows.length > 0
  const cohortLabel = cohort === 'at-risk'
    ? 'Critical cohort rows'
    : cohort === 'stable'
      ? 'Stable / improving cohort'
      : 'Drifting, not currently overdue cohort'
  const cohortSummary = cohort === 'stable'
    ? { count: drift.n_customers_stable + drift.n_customers_improving, label: 'Stable / improving accounts' }
    : { count: drift.n_customers_drifting - kpis.customersAtRisk, label: 'Drifting, not currently overdue accounts' }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-xl font-medium">Customers</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none"
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
          >
            <option value="at-risk">Show: at-risk records</option>
            <option value="stable">Show: stable / improving</option>
            <option value="drifting">Show: drifting, not overdue</option>
          </select>
          <div className="flex items-center gap-2 bg-panel border border-border rounded-lg px-3 py-2 w-full sm:w-64">
            <Search size={15} className="text-muted" />
            <input
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search customers"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="revenueAtRisk">Sort: revenue at risk</option>
            <option value="lateAvgDelayMonths">Sort: recent avg delay</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-muted">Showing: {cohortLabel}. Only the top at-risk sample has row-level records in realStats.json.</p>

      {cohort !== 'at-risk' ? (
        <div className="rounded-xl border border-border bg-panel p-8 text-center">
          <p className="text-base font-medium">{cohortSummary.label}</p>
          <p className="mt-2 text-3xl font-medium font-nums">{cohortSummary.count.toLocaleString('en-US')}</p>
          <p className="mt-1 text-sm text-muted">{((cohortSummary.count / overall.n_records) * 100).toFixed(1)}% of the {overall.n_records.toLocaleString('en-US')}-record dataset</p>
          <p className="mt-4 text-xs text-muted">The source provides this cohort as an aggregate count. Only the top at-risk sample includes row-level customer details.</p>
        </div>
      ) : hasRows ? (
        <div className="bg-panel border border-border rounded-xl overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Customer ID</th>
                <th className="px-5 py-3 font-normal">Payment health</th>
                <th className="px-5 py-3 font-normal">Drift level</th>
                <th className="px-5 py-3 font-normal">Revenue at risk</th>
                <th className="px-5 py-3 font-normal">Months overdue now</th>
                <th className="px-5 py-3 font-normal">Recent avg delay</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg">
                  <td className="px-5 py-3">
                    <Link to={`/customers/${c.id}`} className="hover:text-accent font-medium">{c.name}</Link>
                  </td>
                  <td className="px-5 py-3 text-muted font-nums">{c.id}</td>
                  <td className="px-5 py-3 text-muted">{c.health}</td>
                  <td className="px-5 py-3"><StatusBadge level={c.driftLevel} /></td>
                  <td className="px-5 py-3 font-currency">{formatINR(c.revenueAtRisk)}</td>
                  <td className="px-5 py-3 text-muted font-nums">{c.monthsOverdueNow}</td>
                  <td className="px-5 py-3 font-nums">{label(c)}</td>
                  <td className="px-5 py-3 text-muted">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-panel p-8 text-center">
          <p className="text-base font-medium">No customers match this filter.</p>
          <p className="mt-2 text-sm text-muted">Try a broader search term or clear the current filter to see all customer records.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text hover:border-accent hover:text-accent"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
