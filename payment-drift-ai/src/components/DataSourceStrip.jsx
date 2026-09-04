import { Link } from 'react-router-dom'
import { dataset, overall } from '../data/customers'

export default function DataSourceStrip() {
  return (
    <div className="bg-panel border border-border rounded-xl px-5 py-3 flex items-center justify-between text-xs text-muted">
      <span>
        Source: <span className="text-text font-medium">{dataset.name}</span>{' '}
        · n = {overall.n_records.toLocaleString('en-US')} · {dataset.period}
      </span>
      <Link to="/methodology" className="text-accent hover:underline shrink-0 ml-4">
        Data & Methodology →
      </Link>
    </div>
  )
}
