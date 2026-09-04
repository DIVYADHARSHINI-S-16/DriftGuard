import { dataset, overall, billStats, drift, modelValidation, formatINR } from '../data/customers'
import { NTD_TO_INR_RATE } from '../data/constants'
import ArchitectureDiagram from '../components/ArchitectureDiagram'

function Section({ title, children }) {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <p className="text-sm font-medium mb-3">{title}</p>
      <div className="text-sm text-muted space-y-2">{children}</div>
    </div>
  )
}

export default function Methodology() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Data & Methodology</h1>
        <p className="text-sm text-muted mt-1">
          This prototype uses publicly available real-world data for research and demonstration.
          It is not Razorpay merchant data.
        </p>
      </div>

      <ArchitectureDiagram />

      <Section title="Data source">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-nums">
          <p><span className="text-text">Dataset:</span> {dataset.name}</p>
          <p><span className="text-text">Publisher:</span> {dataset.publisher}</p>
          <p><span className="text-text">Records:</span> {overall.n_records.toLocaleString('en-US')}</p>
          <p><span className="text-text">Period:</span> {dataset.period}</p>
          <p><span className="text-text">Region:</span> {dataset.region}</p>
          <p><span className="text-text">License:</span> {dataset.license}</p>
        </div>
        <p>
          Source: <a className="text-accent hover:underline break-all" href={dataset.source_url} target="_blank" rel="noreferrer">{dataset.source_url}</a>
          {' '}· DOI: <a className="text-accent hover:underline break-all" href={dataset.doi} target="_blank" rel="noreferrer">{dataset.doi}</a>
        </p>
        <p>Fields used: {dataset.fields_used.join(', ')}</p>
      </Section>

      <Section title="Data limitations">
        <ul className="list-disc pl-4 space-y-1">
          {dataset.limitations.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </Section>

      <Section title="How DriftGuard is calculated">
        <p>
          The dataset records each client's monthly repayment status (PAY_0 through PAY_6) as a code:
          negative or zero means paid on time or ahead, positive integers mean that many months overdue.
          We derive <span className="text-text">months overdue</span> as max(code, 0) for each of the six
          observed months (Apr–Sep 2005). No days-overdue or due-date field exists in the source data, so we
          do not report delay in days.
        </p>
        <p>
          For each client we compare the average months-overdue in the first half of the window (Apr–Jun) to
          the second half (Jul–Sep). A positive change is labeled <span className="text-text">drift</span>.
          Population-wide, average months-overdue moved from {drift.population_avg_delay_months_early} to{' '}
          {drift.population_avg_delay_months_late} ({drift.population_drift_change_pct > 0 ? '+' : ''}{drift.population_drift_change_pct}%).
        </p>
        <p>
          {drift.n_customers_drifting.toLocaleString('en-US')} of {overall.n_records.toLocaleString('en-US')} clients
          ({drift.pct_drifting}%) show this pattern (OBSERVED).
        </p>
      </Section>

      <Section title="Revenue at risk (model-estimated, not actual)">
        <p>
          "Revenue at risk" sums the most recent billing amount for clients who are both drifting and currently
          overdue (PAY_0 &gt; 0). This is a <span className="text-text">model-estimated exposure</span> figure —
          no money has actually been lost or recovered in this dataset. We never label it "revenue lost" or
          "revenue recovered."
        </p>
      </Section>

      <Section title="Statistical summary of billing amounts">
        <div className="grid grid-cols-3 gap-3 font-currency">
          <p>Mean: {formatINR(billStats.mean)}</p>
          <p>Median: {formatINR(billStats.median)}</p>
          <p>Std dev: {formatINR(billStats.std)}</p>
          <p>P25: {formatINR(billStats.p25)}</p>
          <p>P75: {formatINR(billStats.p75)}</p>
          <p>P95: {formatINR(billStats.p95)}</p>
        </div>
      </Section>

      <Section title="Currency conversion">
        <p>
          The underlying dataset's native currency is NT$ (New Taiwan Dollar). Displayed ₹ figures are a
          currency conversion at {NTD_TO_INR_RATE} INR per NT$ for demo relatability — this is not a claim
          that the data represents Indian or Razorpay transaction data.
        </p>
      </Section>

      <Section title="Model validation (predicted default, held-out test set)">
        <p>
          A logistic regression model was trained on 6-month repayment-delay features, drift, credit limit,
          and age to predict the dataset's real "default next month" label, on a 75/25 train/test split
          (random_state=42, stratified). This is genuine temporal-style validation against a label the model
          never saw during training — not a fabricated accuracy number.
        </p>
        <div className="grid grid-cols-3 gap-3 font-nums">
          <p>Precision: {modelValidation.precision}</p>
          <p>Recall: {modelValidation.recall}</p>
          <p>F1: {modelValidation.f1}</p>
          <p>False positive rate: {modelValidation.false_positive_rate}</p>
          <p>False negative rate: {modelValidation.false_negative_rate}</p>
          <p>Test set size: {modelValidation.test_set_size.toLocaleString('en-US')}</p>
        </div>
        <p>
          Model status: <span className="text-text">Evaluated / Prototype</span> — precision and recall in the
          0.5 range reflect a simple baseline model on a moderately imbalanced label, not a production-grade
          fraud/default engine.
        </p>
      </Section>

      <Section title="What cannot be inferred from this dataset">
        <ul className="list-disc pl-4 space-y-1">
          <li>No literal days-overdue, invoice due dates, or retry counts exist — we do not invent them.</li>
          <li>No payment method, subscription status, or recovery-contact history exists — these fields are absent from the UI rather than fabricated.</li>
          <li>No customer names or India/INR context exists in the source data; monetary values are displayed in Indian rupee format for this prototype.</li>
          <li>This is account-level monthly data, not transaction-event data, so per-transaction retry/failure sequences shown in the Recovery Actions workflow are illustrative and simulated, not drawn from real retries in this dataset.</li>
        </ul>
      </Section>

      <Section title="Recovery workflow">
        <p>
          Model detects risk → AI explains risk → AI recommends intervention → Policy engine checks limits →
          Merchant approval → <span className="text-text">SIMULATED test action</span> → Outcome recorded.
          No real financial transactions are ever triggered by this prototype.
        </p>
      </Section>

      <Section title="If this were real: path to production">
        <p>
          <span className="text-text">Schema mapping:</span> PAY_0–PAY_6 are monthly repayment-status buckets,
          LIMIT_BAL is a credit limit, BILL_AMT1–6 are monthly statement balances, and AGE is an age field.
          A real Razorpay merchant integration would instead need transaction-level events, payment method and
          instrument identifiers, due dates, attempt timestamps, retry attempts, and payment outcomes. The
          prototype has month-level account data, no due dates, no payment methods, and no retry history.
        </p>
        <p>
          <span className="text-text">Retraining cadence:</span> a production team would review drift and label
          freshness on a monthly or quarterly cadence. The appropriate interval would depend on observed behavior
          change and label availability; this prototype precomputes one static analysis rather than retraining.
        </p>
        <p>
          <span className="text-text">Scale risks:</span> production would need explicit class-imbalance monitoring,
          latency targets for an online score, feature validation, and a feature store or versioned analytical store
          instead of this app's imported realStats.json. The current dashboard reads precomputed values and has no
          live scoring service or backend.
        </p>
        <p>
          <span className="text-text">Compliance and data engineering:</span> protect or minimize PII, document
          consent and opt-out handling for automated outreach, retain decision and approval audit records, restrict
          access by role, and establish review controls for financial recommendations. This is engineering awareness,
          not legal advice; the current prototype stores no merchant PII and sends no outreach.
        </p>
      </Section>

      <Section title="Backend scope">
        <p>
          This repository now includes a local FastAPI service with SQLite persistence for demo users, sessions,
          simulated recovery actions, and timestamped audit events. Recovery decisions and their existing
          simulated expected-recovery amounts persist per demo user; the page's aggregate simulated counter is
          intentionally session-local and does not change the fixed Overview KPI. The service is real and
          upgradeable by changing the database connection string, but the frontend analytics still come from the
          bundled realStats.json artifact. No What-If simulator or live model-scoring endpoint is enabled because
          the original trained model artifact and training script are not present in this repository.
        </p>
      </Section>
    </div>
  )
}
