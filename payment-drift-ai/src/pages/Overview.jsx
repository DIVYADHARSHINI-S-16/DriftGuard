import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, TrendingDown, TrendingUp, Percent, Download } from 'lucide-react'
import IconBadge from '../components/IconBadge'
import StatusBadge from '../components/StatusBadge'
import DataSourceStrip from '../components/DataSourceStrip'
import Walkthrough from '../components/Walkthrough'
import {
  customers, kpis, paymentHealthTrend, riskDistribution, riskDistributionTotal,
  formatINR, dataset, overall, drift, modelValidation,
} from '../data/customers'
import { NTD_TO_INR_RATE } from '../data/constants'

const skeletonCard = 'h-24 rounded-xl border border-border bg-panel animate-pulse'

export default function Overview() {
  const [isLoading, setIsLoading] = useState(true)
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false)
  const flagged = customers.filter((c) => c.status !== 'Monitoring')

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 180)
    return () => window.clearTimeout(timer)
  }, [])

  const handleExportSummary = () => {
    const summary = [
      '# DriftGuard summary',
      '',
      `- Dataset: ${dataset.name}`,
      `- Source: ${dataset.source_url}`,
      `- Records: ${overall.n_records.toLocaleString('en-US')}`,
      `- Drift: ${drift.pct_drifting}%`,
      `- Model precision: ${(modelValidation.precision * 100).toFixed(1)}%`,
      `- Model recall: ${(modelValidation.recall * 100).toFixed(1)}%`,
      `- Model F1: ${(modelValidation.f1 * 100).toFixed(1)}%`,
      '',
      `The underlying dataset's native currency is NT$ (New Taiwan Dollar); displayed ₹ figures are converted at ${NTD_TO_INR_RATE} INR per NT$ for demo relatability. This is not a claim that the data represents Indian or Razorpay transaction data.`,
      'This prototype uses publicly available real-world data for research and demonstration. It is not Razorpay merchant data.',
    ].join('\n')

    const blob = new Blob([summary], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'payment-drift-ai-summary.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-7 w-44 rounded-md bg-panel border border-border animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-panel border border-border animate-pulse" />
        </div>
        <div className="h-12 w-full rounded-xl border border-border bg-panel animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={skeletonCard} />
          <div className={skeletonCard} />
          <div className={skeletonCard} />
          <div className={skeletonCard} />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-72 rounded-xl border border-border bg-panel animate-pulse" />
          <div className="h-72 rounded-xl border border-border bg-panel animate-pulse" />
        </div>
        <div className="h-64 rounded-xl border border-border bg-panel animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-medium">DriftGuard</h1>
          <p className="text-sm text-muted mt-1">Early warning for deteriorating payment behavior</p>
          <p className="text-xs text-muted mt-1">Real data · demo currency conversion · <Link to="/methodology" className="text-accent hover:underline">see Data & Methodology for details</Link></p>
        </div>
        <button
          type="button"
          onClick={handleExportSummary}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-panel px-3 py-2 text-sm text-text hover:border-accent hover:text-accent"
        >
          <Download size={16} />
          Export summary
        </button>
        <button
          type="button"
          onClick={() => setIsWalkthroughOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-panel px-3 py-2 text-sm text-text hover:border-accent hover:text-accent"
        >
          Start walkthrough
        </button>
      </div>

      <DataSourceStrip />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div data-tour="risk-kpi" className="bg-panel border border-border rounded-xl p-4 flex items-center gap-3">
          <IconBadge icon={TrendingDown} color="orange" />
          <div>
            <p className="text-xs text-muted">Revenue at risk <span className="opacity-60">(model-estimated)</span></p>
            <p className="text-lg font-medium font-currency">{formatINR(kpis.revenueAtRiskModelEstimated)}</p>
            <p className="text-[11px] text-muted mt-1">Sum of most recent billing amounts across all {kpis.customersAtRisk.toLocaleString('en-US')} at-risk accounts. See Methodology for calculation.</p>
            <p className="text-[11px] text-muted mt-1">Avg. per customer: {formatINR(kpis.revenueAtRiskModelEstimated / kpis.customersAtRisk)}</p>
          </div>
        </div>
        <div data-tour="drift-kpi" className="bg-panel border border-border rounded-xl p-4 flex items-center gap-3">
          <IconBadge icon={TrendingUp} color="green" />
          <div>
            <p className="text-xs text-muted">Clients drifting <span className="opacity-60">(observed)</span></p>
            <p className="text-lg font-medium font-nums">{drift.n_customers_drifting.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-4 flex items-center gap-3">
          <IconBadge icon={Users} color="blue" />
          <div>
            <p className="text-xs text-muted">Customers at risk <span className="opacity-60">(predicted cohort)</span></p>
            <p className="text-lg font-medium font-nums">{kpis.customersAtRisk.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-4 flex items-center gap-3">
          <IconBadge icon={Percent} color="violet" />
          <div>
            <p className="text-xs text-muted">Model precision <span className="opacity-60">(held-out test)</span></p>
            <p className="text-lg font-medium font-nums">{(modelValidation.precision * 100).toFixed(1)}%</p>
            <p className="text-[11px] text-muted mt-1">Evaluated prototype baseline; precision and recall in the 0.5 range are expected for this simple model.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div data-tour="health-trend" className="bg-panel border border-border rounded-xl p-5">
          <p className="text-sm font-medium mb-1">Payment health trend (observed)</p>
          <p className="text-xs text-muted mb-4">Population-average months-overdue across the dataset's 6-month window, converted to a 0-100 health score.</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={paymentHealthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="health" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-panel border border-border rounded-xl p-5">
          <p className="text-sm font-medium mb-4">Risk distribution (observed)</p>
          <div className="space-y-3">
            {riskDistribution.map((r) => (
              <div key={r.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{r.label}</span>
                  <span className="font-nums">{r.count.toLocaleString('en-US')}</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(r.count / riskDistributionTotal) * 100}%`,
                      background: `var(--${r.key}-fg)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-tour="attention-table" className="bg-panel border border-border rounded-xl overflow-hidden">
        <p className="text-sm font-medium px-5 py-4 border-b border-border">Customers needing attention</p>
        <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-border">
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Payment health</th>
              <th className="px-5 py-3 font-normal">Drift level</th>
              <th className="px-5 py-3 font-normal">Revenue at risk</th>
              <th className="px-5 py-3 font-normal">Recommended action</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg">
                <td className="px-5 py-3">
                  <Link to={`/customers/${c.id}`} className="hover:text-accent font-nums">{c.name}</Link>
                </td>
                <td className="px-5 py-3 text-muted">{c.health}</td>
                <td className="px-5 py-3"><StatusBadge level={c.driftLevel} /></td>
                <td className="px-5 py-3 font-currency">{formatINR(c.revenueAtRisk)}</td>
                <td className="px-5 py-3 text-muted">{c.recommendedAction}</td>
                <td className="px-5 py-3 text-muted">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <p className="text-sm font-medium mb-3">Data & Model</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div><p className="text-xs text-muted mb-1">Dataset</p><p>{dataset.name}</p></div>
          <div><p className="text-xs text-muted mb-1">Records analyzed</p><p className="font-nums">{overall.n_records.toLocaleString('en-US')}</p></div>
          <div><p className="text-xs text-muted mb-1">Observation period</p><p>{dataset.period}</p></div>
          <div><p className="text-xs text-muted mb-1">Drift cases</p><p className="font-nums">{drift.n_customers_drifting.toLocaleString('en-US')} ({drift.pct_drifting}%)</p></div>
          <div><p className="text-xs text-muted mb-1">Model status</p><p>Evaluated / Prototype</p></div>
          <div><p className="text-xs text-muted mb-1">Data source</p><Link data-tour="methodology-link" to="/methodology" className="text-accent hover:underline">{dataset.publisher} →</Link></div>
        </div>
      </div>
      <Walkthrough open={isWalkthroughOpen} onClose={() => setIsWalkthroughOpen(false)} />
    </div>
  )
}
