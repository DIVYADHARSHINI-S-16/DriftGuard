import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

const steps = [
  { selector: '[data-tour="risk-kpi"]', title: 'Revenue at risk', text: 'This model-estimated exposure sums the most recent billing amounts for the at-risk accounts in realStats.json.' },
  { selector: '[data-tour="drift-kpi"]', title: 'Clients drifting', text: 'This observed count comes from customers whose average repayment delay increased across the dataset window.' },
  { selector: '[data-tour="health-trend"]', title: 'Payment health trend', text: 'This chart converts the observed population-average months-overdue values into a comparable health score.' },
  { selector: '[data-tour="attention-table"]', title: 'Customers needing attention', text: 'These row-level records are the real top at-risk sample provided in realStats.json.' },
  { selector: '[data-tour="methodology-link"]', title: 'Data & Methodology', text: 'This page documents the UCI source, calculations, model validation, and currency conversion.' },
]

export default function Walkthrough({ open, onClose, steps: providedSteps = steps }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [position, setPosition] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    setStepIndex(0)
    return undefined
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const updatePosition = () => {
      const target = document.querySelector(providedSteps[stepIndex].selector)
      if (!target) return
      const rect = target.getBoundingClientRect()
      const tooltipWidth = window.innerWidth < 768 ? 200 : 320
      const tooltipGap = 16
      const placement = providedSteps[stepIndex].placement
      const canPlaceRight = window.innerWidth - rect.right >= tooltipWidth + tooltipGap
      const canPlaceLeft = rect.left >= tooltipWidth + tooltipGap
      const left = placement === 'left'
        ? tooltipGap
        : canPlaceRight
        ? rect.right + tooltipGap
        : canPlaceLeft
          ? rect.left - tooltipWidth - tooltipGap
          : Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - tooltipGap))
      const top = placement === 'left' || canPlaceRight || canPlaceLeft
        ? Math.max(16, Math.min(rect.top, window.innerHeight - 190))
        : Math.min(rect.bottom + 12, window.innerHeight - 190)
      setPosition({ top, left, rect })
    }
    const target = document.querySelector(providedSteps[stepIndex].selector)
    target?.scrollIntoView({ behavior: 'auto', block: 'center' })
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, stepIndex, providedSteps])

  if (!open || !position) return null
  const step = providedSteps[stepIndex]
  const isLast = stepIndex === providedSteps.length - 1
  const tooltipWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 320

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/10 pointer-events-none" />
      <div
        className="fixed z-40 rounded-xl border-2 border-accent pointer-events-none"
        style={{ top: position.rect.top - 5, left: position.rect.left - 5, width: position.rect.width + 10, height: position.rect.height + 10 }}
      />
      <aside className="fixed z-50 rounded-xl border border-border bg-panel p-4 shadow-lg" style={{ top: position.top, left: position.left, width: tooltipWidth }} aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted font-nums">Step {stepIndex + 1} of {providedSteps.length}</p>
            <h2 className="text-base font-medium mt-1">{step.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Skip walkthrough" className="text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"><X size={16} /></button>
        </div>
        <p className="text-sm text-muted leading-relaxed mt-2">{step.text}</p>
        <div className="flex justify-between items-center mt-4">
          <button type="button" onClick={onClose} className="text-xs text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent">Skip</button>
          <button type="button" onClick={() => (isLast ? onClose() : setStepIndex((value) => value + 1))} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-accent">
            {isLast ? 'Done' : 'Next'} {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </aside>
    </>
  )
}
