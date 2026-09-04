import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TrustBadge from '../components/TrustBadge'

export default function DemoLogin({ onEnter }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) return

    setError('')
    setIsSubmitting(true)
    try {
      await onEnter(email.trim(), password)
      navigate('/')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page min-h-screen bg-bg text-text flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <TrustBadge />
      </div>
      <div className="login-shell w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] bg-panel border border-border rounded-2xl overflow-hidden shadow-sm">
        <section className="login-intro p-8 sm:p-12 flex flex-col justify-between min-h-[560px]">
          <div>
            <div className="text-accent text-sm font-medium">Payment intelligence workspace</div>
            <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] mt-20 max-w-sm">
              See drift before it becomes loss.
            </h1>
            <p className="text-muted text-sm leading-relaxed max-w-sm mt-6">
              A focused view of payment health, customer risk, and simulated recovery decisions.
            </p>
          </div>
        </section>

        <section className="p-8 sm:p-12 flex items-center border-t lg:border-t-0 lg:border-l border-border">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-medium">Login</h2>
            <p className="text-sm text-muted mt-2 mb-6">Demo login — any email and password will work</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-xs text-muted mb-1.5">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-xs text-muted mb-1.5">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-accent text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? 'Entering...' : 'Enter'}
                <ArrowRight size={16} />
              </button>
              {error && <p className="text-xs text-critical" role="alert">{error}</p>}
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}