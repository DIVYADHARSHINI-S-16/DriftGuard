import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, TrendingDown, Workflow, ScrollText, Settings, Moon, Sun, BookOpen, LogOut,
} from 'lucide-react'
import TrustBadge from './TrustBadge'
import Walkthrough from './Walkthrough'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/revenue-risk', label: 'Revenue Risk', icon: TrendingDown },
  { to: '/recovery-actions', label: 'Recovery Actions', icon: Workflow },
  { to: '/audit-trail', label: 'Audit Trail', icon: ScrollText },
  { to: '/methodology', label: 'Data & Methodology', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ dark, setDark, demoMode, setDemoMode, onLogout }) {
  const location = useLocation()
  const [tourOpen, setTourOpen] = useState(false)

  const pageSteps = {
    '/': [
      { selector: '[data-tour="risk-kpi"]', title: 'Revenue at risk', text: 'Model-estimated exposure from the most recent billing amounts for at-risk accounts.' },
      { selector: '[data-tour="health-trend"]', title: 'Payment health trend', text: 'Observed population-average months-overdue values shown across the dataset window.' },
      { selector: '[data-tour="attention-table"]', title: 'Customers needing attention', text: 'The real top at-risk customer sample included in realStats.json.' },
      { selector: '[data-tour="methodology-link"]', title: 'Data & Methodology', text: 'The complete source, calculation, validation, and currency-conversion record.' },
    ],
    '/customers': [
      { selector: 'main h1', title: 'Customers', text: 'Explore the real top at-risk customer sample and aggregate cohort counts from realStats.json.' },
      { selector: 'main select', title: 'Cohort selector', text: 'Switch between at-risk rows and the stable or drifting aggregate cohorts available in the source.' },
      { selector: 'main table', title: 'Customer records', text: 'These row-level details come from the real top at-risk sample.' },
    ],
    '/revenue-risk': [
      { selector: 'main h1', title: 'Revenue risk', text: 'Review model-estimated exposure grouped by the available at-risk customer sample.' },
      { selector: 'main .grid', title: 'Risk totals', text: 'These monetary totals are derived from converted real billing values.' },
      { selector: 'main table', title: 'Risk detail', text: 'Compare model-estimated exposure and simulated expected recovery by customer.' },
    ],
    '/recovery-actions': [
      { selector: 'main h1', title: 'Recovery actions', text: 'Review recommended interventions based on observed repayment drift.' },
      { selector: 'main .grid', title: 'Simulated actions', text: 'Approvals here are simulated test actions and do not send real payments or contacts.' },
    ],
    '/audit-trail': [
      { selector: 'main h1', title: 'Audit trail', text: 'Follow the documented pipeline steps from data loading through simulated actions.', placement: 'left' },
      { selector: 'main .bg-panel', title: 'Pipeline history', text: 'Each entry is labeled by pipeline sequence rather than implying live timestamps.', placement: 'left' },
    ],
    '/methodology': [
      { selector: '[aria-label="DriftGuard data pipeline diagram"]', title: 'Data pipeline', text: 'See how the UCI dataset becomes realStats.json and feeds the dashboard pages.' },
      { selector: 'main a[href*="archive.ics.uci.edu"]', title: 'Data source', text: 'Open the public UCI source documented for this prototype.' },
    ],
    '/settings': [
      { selector: 'main h1', title: 'Settings', text: 'Review controls for the simulated recovery workflow.' },
      { selector: 'main .bg-panel', title: 'Policy controls', text: 'Changing these values affects simulated workflow decisions, not displayed KPIs.' },
    ],
  }[location.pathname] || []

  return (
    <aside className="w-60 shrink-0 bg-panel border-r border-border flex flex-col h-screen sticky top-0 max-[1024px]:w-52">
      <div className="px-5 py-6">
        <p className="font-display text-2xl leading-none text-accent">DriftGuard</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'font-medium' : 'text-muted hover:text-text'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                : {}
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-2">
        <TrustBadge />
        <button
          type="button"
          onClick={() => setTourOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-text border border-border"
        >
          Start walkthrough
        </button>
        <div className="px-3 py-2 rounded-lg border border-border">
          <p className="text-xs text-muted mb-1.5">Recovery policy scenario <span title="Changes simulated intervention recommendations; observed signals and model-estimated analytics stay unchanged.">ⓘ</span></p>
          <select
            className="w-full bg-transparent text-sm outline-none"
            value={demoMode}
            onChange={(e) => setDemoMode(e.target.value)}
          >
            <option value="success">Recovery succeeds</option>
            <option value="failure">Recovery fails</option>
          </select>
          <p className="text-[10px] text-muted mt-1.5 leading-snug">Affects simulated outcomes and recommendations only — not analytics.</p>
        </div>

        <button
          type="button"
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-text border border-border"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-text border border-border"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
      <Walkthrough open={tourOpen} onClose={() => setTourOpen(false)} steps={pageSteps} />
    </aside>
  )
}
