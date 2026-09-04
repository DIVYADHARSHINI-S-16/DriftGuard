import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import RevenueRisk from './pages/RevenueRisk'
import RecoveryActions from './pages/RecoveryActions'
import AuditTrail from './pages/AuditTrail'
import Settings from './pages/Settings'
import Methodology from './pages/Methodology'
import DemoLogin from './pages/DemoLogin'
import { login, logout } from './utils/api'

export default function App() {
  const [dark, setDark] = useState(false)
  const [isBooting, setIsBooting] = useState(true)
  const [demoMode, setDemoMode] = useState('success')
  const [sessionToken, setSessionToken] = useState(null)
  const [sessionRecoveries, setSessionRecoveries] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 420)
    return () => window.clearTimeout(timer)
  }, [])

  const handleLogin = async (email, password) => {
    const result = await login(email, password)
    setSessionToken(result.session_token)
    setSessionRecoveries(0)
  }

  const handleLogout = async () => {
    if (sessionToken) await logout(sessionToken).catch(() => {})
    setSessionToken(null)
    setSessionRecoveries(0)
  }

  return (
    <BrowserRouter>
      {isBooting ? (
        <main className="min-h-screen bg-bg text-text flex flex-col items-center justify-center gap-4">
          <h1 className="font-display text-4xl text-accent">Payment Drift AI</h1>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-accent-soft" aria-label="Loading Payment Drift AI">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
          </div>
        </main>
      ) : sessionToken ? (
        <div className="flex min-h-screen bg-bg text-text">
          <Sidebar
            dark={dark}
            setDark={setDark}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
            onLogout={handleLogout}
          />
          <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/revenue-risk" element={<RevenueRisk demoMode={demoMode} />} />
              <Route path="/recovery-actions" element={<RecoveryActions demoMode={demoMode} sessionToken={sessionToken} sessionRecoveries={sessionRecoveries} onRecoveryRecorded={(amount) => setSessionRecoveries((total) => total + amount)} />} />
              <Route path="/audit-trail" element={<AuditTrail sessionToken={sessionToken} />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      ) : <DemoLogin onEnter={handleLogin} />}
    </BrowserRouter>
  )
}
