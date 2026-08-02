const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const PRIMARY_BASE = API_BASE
const FALLBACK_BASES = [
  PRIMARY_BASE,
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  '/api'
].filter((v, i, a) => v && a.indexOf(v) === i)

async function safeFetch(url, options = {}) {
  let endpoint = url
  if (PRIMARY_BASE && url.startsWith(PRIMARY_BASE)) {
    endpoint = url.slice(PRIMARY_BASE.length)
  }
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint
  }

  for (const base of FALLBACK_BASES) {
    const cleanBase = base.replace(/\/+$/, '')
    const fullUrl = cleanBase.startsWith('http') || cleanBase.startsWith('/')
      ? `${cleanBase}${endpoint}`
      : `/${cleanBase}${endpoint}`

    try {
      const res = await fetch(fullUrl, options)
      if (res.ok) {
        return await res.json()
      }
    } catch (e) {
      // Try next candidate base URL
    }
  }
  return null
}

export async function checkApiStatus() {
  const data = await safeFetch('/stats')
  return data !== null
}

export async function getMetadata() {
  const data = await safeFetch('/metadata')
  if (data) return data
  return {
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix', 'Apple'],
    topics: ['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Graph', 'Tree', 'Binary Search']
  }
}

export async function runQuery(query, history = [], limit = null, userEmail = null) {
  const payload = {
    query,
    history: history.map(m => ({ role: m.role, content: m.content })),
    ...(limit !== null && { limit }),
    ...(userEmail && { user_email: userEmail })
  }
  const data = await safeFetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (data) return { answer: data.answer, references: data.retrieved_questions || [] }
  return { answer: 'Failed to connect to the backend API.', references: [] }
}

export async function getOrCreateUser(email, password) {
  const data = await safeFetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (data) {
    if (data.detail) return { error: data.detail }
    return data
  }
  return { error: 'Failed to connect to backend server.' }
}

export async function getUserSessions(email) {
  return (await safeFetch(`/users/${encodeURIComponent(email)}/sessions`)) || {}
}

export async function saveSession(sessionId, userEmail, title, messages, lastReferences) {
  return safeFetch('/sessions', {
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
  return safeFetch(`/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function getUserSolvedProblems(email) {
  return (await safeFetch(`/users/${encodeURIComponent(email)}/solved`)) || []
}

export async function toggleProblemSolved(email, problem, isSolved) {
  return safeFetch(`/users/${encodeURIComponent(email)}/solved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem,
      is_solved: isSolved
    })
  })
}

export async function syncLeetCodeUser(email, username) {
  return safeFetch(`/users/${encodeURIComponent(email)}/sync-leetcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
}

export async function autoSyncUserLeetCodeByEmail(email) {
  return safeFetch(`/users/${encodeURIComponent(email)}/auto-sync`, {
    method: 'POST'
  })
}

export async function getUserProfile(email) {
  return safeFetch(`/users/${encodeURIComponent(email)}/profile`)
}

export async function getDSATopics(userEmail = null) {
  const url = userEmail
    ? `/dsa/topics?user_email=${encodeURIComponent(userEmail)}`
    : `/dsa/topics`
  return (await safeFetch(url)) || []
}

export async function getDSATopicProblems(topicId, userEmail = null) {
  const url = userEmail
    ? `/dsa/topics/${topicId}?user_email=${encodeURIComponent(userEmail)}`
    : `/dsa/topics/${topicId}`
  return (await safeFetch(url)) || []
}

export async function toggleDSAProgress(userEmail, problemId, isCompleted) {
  return safeFetch('/dsa/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_email: userEmail,
      problem_id: problemId,
      is_completed: isCompleted
    })
  })
}

export async function askDSADoubt(userEmail, problemId, problemTitle, codeContext, doubtText) {
  return safeFetch('/dsa/doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_email: userEmail,
      problem_id: problemId,
      problem_title: problemTitle,
      code_context: codeContext,
      doubt_text: doubtText
    })
  })
}

export async function runDSACode(language, code, stdin = '', problemId = null, problemTitle = null) {
  return safeFetch('/dsa/run_code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      code,
      stdin,
      problem_id: problemId,
      problem_title: problemTitle
    })
  })
}

export async function submitDSACode(language, code, problemId, problemTitle, userEmail = null) {
  return safeFetch('/dsa/submit_code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      code,
      problem_id: problemId,
      problem_title: problemTitle,
      user_email: userEmail
    })
  })
}
