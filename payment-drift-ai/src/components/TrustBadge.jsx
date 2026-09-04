import { useState } from 'react'
import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NTD_TO_INR_RATE } from '../data/constants'

export default function TrustBadge() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative px-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text"
        aria-expanded={open}
        aria-label="View data and simulation disclosures"
      >
        Real data · Simulated actions <Info size={13} />
      </button>
      {open && (
        <div
          className="absolute left-3 bottom-full z-20 mb-2 w-64 rounded-lg border border-border bg-panel p-3 text-xs text-muted shadow-sm"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="space-y-2 leading-relaxed">
            <p>The underlying dataset is native NT$ (New Taiwan Dollar); displayed ₹ figures use {NTD_TO_INR_RATE} INR per NT$ for demo relatability.</p>
            <p>This is publicly available real-world data, not Razorpay merchant data.</p>
            <p>Revenue at risk is model-estimated exposure, not actual recovered or lost revenue.</p>
            <p>Recovery actions are simulated and do not trigger real payments or contacts.</p>
            <Link to="/methodology" className="inline-block text-accent hover:underline">Full methodology →</Link>
          </div>
        </div>
      )}
    </div>
  )
}