import { useState } from 'react'
import { billStats, drift, modelValidation, overall } from '../data/customers'

const derivedDefaults = {
  maxRetries: Math.max(1, Math.round(drift.n_customers_drifting / 2000)),
  maxContacts: Math.max(1, Math.round(overall.n_records / 15000)),
  maxAutoAmount: Math.round(billStats.p95),
  minConfidence: Math.round(modelValidation.precision * 100),
  escalationThreshold: Math.round((1 - modelValidation.false_positive_rate) * 100),
}

const fields = [
  { key: 'maxRetries', label: 'Maximum automated retries', description: 'Caps retry attempts in the simulated recovery workflow; changing it does not affect displayed KPIs.', type: 'number', value: derivedDefaults.maxRetries },
  { key: 'maxContacts', label: 'Maximum customer contacts', description: 'Caps simulated customer contacts before manual review; changing it does not affect displayed KPIs.', type: 'number', value: derivedDefaults.maxContacts },
  { key: 'maxAutoAmount', label: 'Maximum automated recovery amount (₹)', description: 'Recovery actions above this amount require manual approval in the simulated workflow; changing it does not affect displayed KPIs.', type: 'number', value: derivedDefaults.maxAutoAmount },
  { key: 'minConfidence', label: 'Minimum confidence threshold (%)', description: 'Sets the simulated workflow threshold for automated approval; changing it does not affect the model evaluation metrics.', type: 'number', value: derivedDefaults.minConfidence },
  { key: 'escalationThreshold', label: 'Human escalation threshold (%)', description: 'Sets when the simulated policy routes an action to a human; changing it does not affect displayed KPIs.', type: 'number', value: derivedDefaults.escalationThreshold },
]

export default function Settings() {
  const [values, setValues] = useState(Object.fromEntries(fields.map((f) => [f.key, f.value])))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Settings</h1>

      <div className="bg-panel border border-border rounded-xl p-5 max-w-lg space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm block mb-1.5">{f.label}</label>
            <p className="text-xs text-muted mb-2">{f.description}</p>
            <input
              type={f.type}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none font-nums"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
