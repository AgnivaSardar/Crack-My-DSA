const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function checkApiStatus() {
  const data = await safeFetch(`${API_BASE}/stats`)
  return data !== null
}

export async function getMetadata() {
  const data = await safeFetch(`${API_BASE}/metadata`)
  if (data) return data
  return {
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix', 'Apple'],
    topics: ['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Graph', 'Tree', 'Binary Search']
  }
}

export async function runQuery(query, history = [], limit = null) {
  const payload = {
    query,
    history: history.map(m => ({ role: m.role, content: m.content })),
    ...(limit !== null && { limit })
  }
  const data = await safeFetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (data) return { answer: data.answer, references: data.retrieved_questions || [] }
  return { answer: 'Failed to connect to the backend API.', references: [] }
}

export async function getOrCreateUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data.detail || 'Authentication failed.' }
    }
    return data
  } catch {
    return { error: 'Failed to connect to backend server.' }
  }
}

export async function getUserSessions(email) {
  return safeFetch(`${API_BASE}/users/${encodeURIComponent(email)}/sessions`) || {}
}

export async function saveSession(sessionId, userEmail, title, messages, lastReferences) {
  return safeFetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      user_email: userEmail,
      title,
      messages,
      last_references: lastReferences
    })
  })
}

export async function deleteSession(sessionId) {
  return safeFetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function getUserSolvedProblems(email) {
  return (await safeFetch(`${API_BASE}/users/${encodeURIComponent(email)}/solved`)) || []
}

export async function toggleProblemSolved(email, problem, isSolved) {
  return safeFetch(`${API_BASE}/users/${encodeURIComponent(email)}/solved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem,
      is_solved: isSolved
    })
  })
}

