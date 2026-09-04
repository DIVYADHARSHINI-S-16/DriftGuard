import { useEffect, useState } from 'react'
import { getAuditEvents } from '../utils/api'

export default function AuditTrail({ sessionToken }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAuditEvents(sessionToken)
      .then((loadedEvents) => {
        if (active) setEvents(loadedEvents)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [sessionToken])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Audit trail</h1>
      {isLoading && <p className="text-sm text-muted">Loading audit events...</p>}
      {error && <p className="text-sm text-critical" role="alert">{error}</p>}

      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
          <div className="space-y-5">
            {events.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                <p className="text-xs text-muted font-nums">{new Date(event.created_at).toLocaleString()}</p>
                <p className="text-sm mt-0.5">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
