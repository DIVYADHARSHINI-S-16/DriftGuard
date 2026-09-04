import { useEffect, useState } from 'react'
import { customers, formatINR } from '../data/customers'
import { getRecoveryActions, recordRecoveryAction } from '../utils/api'

export default function RecoveryActions({ demoMode, sessionToken, sessionRecoveries, onRecoveryRecorded }) {
  const flagged = customers.filter((c) => c.status !== 'Monitoring')
  const [decisions, setDecisions] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRecoveryActions(sessionToken)
      .then((actions) => {
        if (active) setDecisions(Object.fromEntries(actions.map((action) => [action.customer_id, action.approved ? 'approved' : 'rejected'])))
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [sessionToken])

  async function decide(customer, value, expected) {
    setError('')
    try {
      await recordRecoveryAction(sessionToken, customer.id, value === 'approved' ? 'approve' : 'reject', customer.recommendedAction, expected)
      setDecisions((current) => ({ ...current, [customer.id]: value }))
      if (value === 'approved') onRecoveryRecorded(expected)
    } catch (actionError) {
      setError(actionError.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Recovery actions</h1>
      <p className="text-sm text-muted -mt-4">
        Waiting for approval on {flagged.length} recommended actions. Approving here only runs a{' '}
        <span className="text-text">simulated</span> test action — no real payment or contact is sent.
      </p>
      <p className="text-xs text-muted -mt-3">Current scenario: <span className="text-text">{demoMode}</span>. Expected recovery changes with this scenario and is session-local.</p>
      <div className="bg-panel border border-border rounded-xl p-4">
        <p className="text-xs text-muted">Simulated recoveries this session</p>
        <p className="text-lg font-medium font-currency">{formatINR(sessionRecoveries)}</p>
        <p className="text-xs text-muted mt-1">Session-local counter; approving actions does not change Overview's fixed revenue-at-risk KPI.</p>
      </div>
      {error && <p className="text-xs text-critical" role="alert">{error}</p>}
      {isLoading && <p className="text-xs text-muted">Loading saved recovery actions...</p>}

      <div className="grid grid-cols-2 gap-4">
        {flagged.map((c) => {
          const decision = decisions[c.id]
          const expected = demoMode === 'failure' ? 0 : Math.round(c.revenueAtRisk * c.recoveryProbability)
          const afterRecovery = Math.max(0, c.revenueAtRisk - expected)
          return (
            <div key={c.id} className="bg-panel border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted font-nums mt-0.5">{c.id}</p>
                </div>
                {decision && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-md font-medium"
                    style={{
                      background: decision === 'approved' ? 'var(--healthy-bg)' : 'var(--critical-bg)',
                      color: decision === 'approved' ? 'var(--healthy-fg)' : 'var(--critical-fg)',
                    }}
                  >
                    {decision === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-xs text-muted mb-1">Revenue at risk</p>
                  <p className="font-currency">{formatINR(c.revenueAtRisk)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Recovery probability</p>
                  <p className="font-nums">{(c.recoveryProbability * 100).toFixed(0)}% <span className="text-xs text-muted">(cohort estimate)</span></p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Recommended action</p>
                  <p>{c.recommendedAction} <span className="text-xs text-muted">({demoMode} scenario)</span></p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Simulated expected recovery</p>
                  <p className="font-currency">{formatINR(expected)}</p>
                </div>
                {decision === 'approved' && (
                  <div className="col-span-2 border-t border-border pt-3">
                    <p className="text-xs text-muted mb-1">Simulated effect for this customer</p>
                    <p className="font-currency">{formatINR(c.revenueAtRisk)} before → {formatINR(afterRecovery)} after</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted mb-4">{c.signature.evidence}</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => decide(c, 'approved', expected)}
                  disabled={!!decision || isLoading}
                  className="flex-1 bg-accent text-white text-sm font-medium rounded-lg py-2 disabled:opacity-50"
                >
                  {decision === 'approved' ? 'Approved' : 'Approve action'}
                </button>
                <button
                  type="button"
                  onClick={() => decide(c, 'rejected', expected)}
                  disabled={!!decision || isLoading}
                  className="flex-1 border border-border text-sm rounded-lg py-2 disabled:opacity-50"
                >
                  {decision === 'rejected' ? 'Rejected' : 'Reject'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
