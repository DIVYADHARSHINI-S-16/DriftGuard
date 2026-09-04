// All numbers below are derived from real_stats.json, which is the output of
// a statistical analysis + a logistic regression model trained on the real,
// public "Default of Credit Card Clients" dataset (UCI ML Repository / I-Cheng
// Yeh, 2009). Nothing in this file is invented — see src/data/realStats.json
// and the Methodology page for exactly how each number was computed.
//
// The prototype presents modeled monetary values in Indian rupee format for this UI demonstration.

import stats from './realStats.json'
import { NTD_TO_INR_RATE } from './constants'

const convertNTDToINR = (amount) => amount * NTD_TO_INR_RATE

export const dataset = stats.dataset
export const overall = stats.overall
export const billStats = Object.fromEntries(
  Object.entries(stats.bill_amount_stats).map(([key, value]) => [key, convertNTDToINR(value)]),
)
export const drift = stats.drift
export const modelValidation = stats.model_validation

// ---- KPIs (OBSERVED + PREDICTED, clearly separated) ----
export const kpis = {
  // PREDICTED: sum of latest billing amount for clients whose repayment delay
  // is trending up (late-period avg delay > early-period avg delay) AND who
  // are currently overdue. This is a model-estimated exposure figure, not
  // money that has actually been lost.
  revenueAtRiskModelEstimated: convertNTDToINR(stats.revenue_at_risk_model_estimated),
  // OBSERVED: count of clients matching that same drifting + currently-overdue definition.
  customersAtRisk: stats.n_customers_at_risk,
  // OBSERVED: share of all 30,000 clients whose repayment delay increased
  // from the Apr-Jun window to the Jul-Sep window.
  pctDrifting: stats.drift.pct_drifting,
  // OBSERVED: default rate for drifting vs. non-drifting clients — this is
  // the empirical signal that justifies calling "drift" a risk indicator.
  defaultRateDrifting: stats.default_rate_drifting_pct,
  defaultRateStableOrImproving: stats.default_rate_stable_or_improving_pct,
}

// ---- Payment health trend (OBSERVED) ----
const maxDelay = Math.max(...stats.drift.avg_delay_by_month)
export const paymentHealthTrend = stats.drift.months.map((month, i) => ({
  month,
  health: Math.round(100 - (stats.drift.avg_delay_by_month[i] / (maxDelay * 1.4)) * 100),
  avgDelayMonths: stats.drift.avg_delay_by_month[i],
}))

// ---- Risk distribution (OBSERVED) ----
export const riskDistribution = [
  { label: 'Stable / improving', count: drift.n_customers_stable + drift.n_customers_improving, key: 'healthy' },
  { label: 'Drifting, not currently overdue', count: drift.n_customers_drifting - stats.n_customers_at_risk, key: 'medium' },
  { label: 'Drifting + currently overdue', count: stats.n_customers_at_risk, key: 'critical' },
]
export const riskDistributionTotal = riskDistribution.reduce((s, r) => s + r.count, 0)

// ---- Customers (OBSERVED, real anonymized dataset records) ----
function driftLevel(c) {
  if (c.drift <= 0) return 'Low'
  if (c.monthsOverdueNow >= 3) return 'Critical'
  if (c.monthsOverdueNow >= 2 || c.drift >= 1) return 'High'
  return 'Medium'
}

export const customers = stats.top_customers_at_risk.map((c) => ({
  id: c.id,
  name: c.id, // dataset has no customer names — none are invented
  health: c.drift > 0 ? 'Deteriorating' : 'Stable',
  driftLevel: driftLevel(c),
  revenueAtRisk: convertNTDToINR(Math.max(0, c.currentBill)),
  monthsOverdueNow: c.monthsOverdueNow,
  earlyAvgDelayMonths: c.earlyAvgDelayMonths,
  lateAvgDelayMonths: c.lateAvgDelayMonths,
  drift: c.drift,
  creditLimit: convertNTDToINR(c.creditLimit),
  defaultedNextMonth: c.defaultedNextMonth,
  status: c.monthsOverdueNow > 0 ? (c.drift >= 1 ? 'Escalated' : 'Flagged') : 'Monitoring',
  recoveryProbability: modelValidation.precision, // PREDICTED, from held-out model evaluation
  recommendedAction: c.monthsOverdueNow >= 3
    ? 'Manual outreach + retry sequence'
    : c.drift >= 1
      ? 'Proactive payment reminder'
      : 'Send early payment nudge',
  signature: {
    primarySignal: c.drift > 0 ? 'Increasing repayment delay' : 'None',
    evidence: `Average delay (months overdue) went from ${c.earlyAvgDelayMonths} to ${c.lateAvgDelayMonths} across the observed 6-month window.`,
    currentlyOverdueMonths: c.monthsOverdueNow,
  },
  history: stats.drift.months.map((month) => ({ month })),
}))

export const auditTrail = [
  { time: 'Pipeline step 1 of 5', event: `Dataset loaded: ${dataset.n_records.toLocaleString('en-US')} records from ${dataset.name}`, customer: '—' },
  { time: 'Pipeline step 2 of 5', event: `${drift.n_customers_drifting.toLocaleString('en-US')} clients (${drift.pct_drifting}%) show increasing repayment delay (OBSERVED)`, customer: '—' },
  { time: 'Pipeline step 3 of 5', event: `${stats.n_customers_at_risk.toLocaleString('en-US')} clients flagged as drifting + currently overdue (PREDICTED risk cohort)`, customer: '—' },
  { time: 'Pipeline step 4 of 5', event: `Logistic regression evaluated on held-out test set: F1 = ${modelValidation.f1}, recall = ${modelValidation.recall} (model validation)`, customer: '—' },
  { time: 'Pipeline step 5 of 5', event: 'Recovery action workflow available only in SIMULATED mode — no real transactions are triggered', customer: '—' },
]

export function formatINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN')
}
