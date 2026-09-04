const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export function login(email, password) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout(sessionToken) {
  return request('/api/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sessionToken}` },
  })
}

export function getRecoveryActions(sessionToken) {
  return request('/api/recovery-actions', {
    headers: { Authorization: `Bearer ${sessionToken}` },
  })
}

export function getAuditEvents(sessionToken) {
  return request('/api/audit-events', {
    headers: { Authorization: `Bearer ${sessionToken}` },
  })
}

export function recordRecoveryAction(sessionToken, customerId, decision, actionType, simulatedRecoveryAmount) {
  return request(`/api/recovery-actions/${customerId}/${decision}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify({ action_type: actionType, simulated_recovery_amount: simulatedRecoveryAmount }),
  })
}
