import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { customers, formatINR } from '../data/customers'

export default function CustomerDetail() {
  const { id } = useParams()
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    return (
      <div>
        <Link to="/customers" className="text-sm text-accent flex items-center gap-1 mb-4">
          <ArrowLeft size={15} /> Back to customers
        </Link>
        <p className="text-sm text-muted">Customer not found.</p>
      </div>
    )
  }

  const {
    name, id: cid, health, driftLevel, revenueAtRisk, recoveryProbability,
    creditLimit, monthsOverdueNow, earlyAvgDelayMonths, lateAvgDelayMonths,
    defaultedNextMonth, signature,
  } = customer

  return (
    <div className="space-y-6">
      <Link to="/customers" className="text-sm text-accent flex items-center gap-1">
        <ArrowLeft size={15} /> Back to customers
      </Link>

      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium font-nums">{name}</h1>
            <p className="text-xs text-muted mt-1">
              Record from the UCI Default of Credit Card Clients dataset — no customer name exists in the source data.
            </p>
          </div>
          <StatusBadge level={driftLevel} />
        </div>

        <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
          <div>
            <p className="text-xs text-muted mb-1">Payment health</p>
            <p className="text-sm font-medium">{health}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Drift level</p>
            <p className="text-sm font-medium">{driftLevel}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Revenue at risk <span className="opacity-60">(model-estimated)</span></p>
            <p className="text-sm font-medium font-currency">{formatINR(revenueAtRisk)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Model precision <span className="opacity-60">(predicted)</span></p>
            <p className="text-sm font-medium font-nums">{(recoveryProbability * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <p className="text-sm font-medium mb-4">Repayment delay trend (observed)</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted mb-1">Avg months overdue — Apr to Jun</p>
            <p className="font-nums">{earlyAvgDelayMonths}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Avg months overdue — Jul to Sep</p>
            <p className="font-nums">{lateAvgDelayMonths}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Currently overdue</p>
            <p className="font-nums">{monthsOverdueNow} month{monthsOverdueNow === 1 ? '' : 's'}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Credit limit (dataset)</p>
            <p className="font-currency">{formatINR(creditLimit)}</p>
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <p className="text-sm font-medium mb-4">Why was this customer flagged?</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted mb-1">Primary signal (observed)</p>
            <p>{signature.primarySignal}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Evidence (observed)</p>
            <p>{signature.evidence}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Actually defaulted next month (observed ground truth)</p>
            <p>{defaultedNextMonth ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Note</p>
            <p className="text-muted">Dataset has no payment-method or retry-count fields, so those are not shown here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
