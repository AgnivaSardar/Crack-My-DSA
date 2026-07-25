import { useState, useEffect, useCallback, useMemo } from 'react'
import AuthPortal from './components/AuthPortal'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ReferencePanel from './components/ReferencePanel'
import LeetCodeDashboard from './components/LeetCodeDashboard'
import OnboardingTourModal from './components/OnboardingTourModal'
import {
  getMetadata,
  runQuery,
  saveSession,
  deleteSession,
  getUserSessions,
  getUserSolvedProblems,
  toggleProblemSolved
} from './api/client'

const LS_GUEST = 'dsa_cracker_guest_sessions'
const LS_GUEST_SOLVED = 'dsa_cracker_guest_solved'
const LS_AUTH = 'dsa_cracker_auth'

function makeId() {
  return String(Date.now())
}

function loadGuestSessions() {
  try {
    return JSON.parse(localStorage.getItem(LS_GUEST) || '{}')
  } catch { return {} }
}

function persistGuestSessions(sessions) {
  try { localStorage.setItem(LS_GUEST, JSON.stringify(sessions)) } catch {}
}

function clearGuestSessions() {
  try { localStorage.removeItem(LS_GUEST) } catch {}
}

function loadGuestSolved() {
  try {
    return JSON.parse(localStorage.getItem(LS_GUEST_SOLVED) || '[]')
  } catch { return [] }
}

function persistGuestSolved(list) {
  try { localStorage.setItem(LS_GUEST_SOLVED, JSON.stringify(list)) } catch {}
}

function loadAuthCache() {
  try {
    return JSON.parse(localStorage.getItem(LS_AUTH) || 'null')
  } catch { return null }
}

// Toast hook
function useToasts() {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((msg) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])
  return { toasts, addToast }
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [guestUser, setGuestUser] = useState(true)
  const [userEmail, setUserEmail] = useState(null)
  const [userName, setUserName] = useState('Guest')

  const [sessions, setSessions] = useState({})
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [lastReferences, setLastReferences] = useState([])
  const [solvedProblems, setSolvedProblems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [metadata, setMetadata] = useState(null)

  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  const { toasts, addToast } = useToasts()

  // Derive quick title Set for solved questions lookup
  const solvedTitles = useMemo(() => {
    const set = new Set()
    solvedProblems.forEach(p => {
      const t = p.problem_title || p.title
      if (t) set.add(t.trim())
    })
    return set
  }, [solvedProblems])

  // On mount: check cached auth, load metadata
  useEffect(() => {
    getMetadata().then(setMetadata)
    const cached = loadAuthCache()
    if (cached && cached.authenticated) {
      setAuthenticated(cached.authenticated)
      setGuestUser(cached.guestUser)
      setUserEmail(cached.userEmail)
      setUserName(cached.userName)

      if (cached.guestUser) {
        const guestSessions = loadGuestSessions()
        setSessions(guestSessions)
        setSolvedProblems(loadGuestSolved())
        if (Object.keys(guestSessions).length === 0) {
          createNewSession(guestSessions, true)
        } else {
          const firstId = Object.keys(guestSessions).sort().reverse()[0]
          setCurrentSessionId(firstId)
          setMessages(guestSessions[firstId]?.messages || [])
          setLastReferences(guestSessions[firstId]?.lastReferences || [])
        }
      } else {
        // User account — fetch sessions & solved list from server
        getUserSessions(cached.userEmail).then(userSessions => {
          const sessMap = userSessions || {}
          setSessions(sessMap)
          if (Object.keys(sessMap).length === 0) {
            createNewSession(sessMap, false)
          } else {
            const firstId = Object.keys(sessMap).sort().reverse()[0]
            setCurrentSessionId(firstId)
            setMessages(sessMap[firstId]?.messages || [])
            setLastReferences(sessMap[firstId]?.lastReferences || [])
          }
        })
        getUserSolvedProblems(cached.userEmail).then(setSolvedProblems)
      }
    }
  }, [])

  function createNewSession(existingSessions, isGuest = guestUser) {
    const id = makeId()
    const newSession = { title: 'New Conversation', messages: [], lastReferences: [] }
    const updated = { ...existingSessions, [id]: newSession }
    setSessions(updated)
    setCurrentSessionId(id)
    setMessages([])
    setLastReferences([])
    if (isGuest) {
      persistGuestSessions(updated)
    }
    return id
  }

  async function handleAuth({ authenticated, guestUser, userEmail, userName, isNewUser }) {
    setAuthenticated(authenticated)
    setGuestUser(guestUser)
    setUserEmail(userEmail)
    setUserName(userName)

    localStorage.setItem(LS_AUTH, JSON.stringify({ authenticated, guestUser, userEmail, userName }))

    if (guestUser) {
      const guestSessions = loadGuestSessions()
      setSessions(guestSessions)
      setSolvedProblems(loadGuestSolved())
      if (Object.keys(guestSessions).length === 0) {
        createNewSession(guestSessions, true)
      } else {
        const firstId = Object.keys(guestSessions).sort().reverse()[0]
        setCurrentSessionId(firstId)
        setMessages(guestSessions[firstId]?.messages || [])
        setLastReferences(guestSessions[firstId]?.lastReferences || [])
      }
    } else {
      // Signed in: migrate any existing guest chats & solved problems to this account
      const guestSessions = loadGuestSessions()
      for (const [id, sess] of Object.entries(guestSessions)) {
        if (sess.messages && sess.messages.length > 0) {
          await saveSession(id, userEmail, sess.title, sess.messages, sess.lastReferences || [])
        }
      }
      clearGuestSessions()

      const guestSolved = loadGuestSolved()
      for (const p of guestSolved) {
        await toggleProblemSolved(userEmail, p, true)
      }
      localStorage.removeItem(LS_GUEST_SOLVED)

      // Load user account sessions & solved problems from server database
      const userSessions = (await getUserSessions(userEmail)) || {}
      setSessions(userSessions)
      if (Object.keys(userSessions).length === 0) {
        createNewSession(userSessions, false)
      } else {
        const firstId = Object.keys(userSessions).sort().reverse()[0]
        setCurrentSessionId(firstId)
        setMessages(userSessions[firstId]?.messages || [])
        setLastReferences(userSessions[firstId]?.lastReferences || [])
      }

      const solvedList = await getUserSolvedProblems(userEmail)
      setSolvedProblems(solvedList)
    }

    // Trigger onboarding spotlight tour for new users / signups
    if (isNewUser) {
      setTimeout(() => setTourOpen(true), 600)
    }
  }

  function handleOpenAuth() {
    setAuthenticated(false)
  }

  function handleSignOut() {
    localStorage.removeItem(LS_AUTH)
    clearGuestSessions()
    localStorage.removeItem(LS_GUEST_SOLVED)
    setAuthenticated(false)
    setGuestUser(true)
    setUserEmail(null)
    setUserName('Guest')
    setSessions({})
    setCurrentSessionId(null)
    setMessages([])
    setLastReferences([])
    setSolvedProblems([])
  }

  function handleNewSession() {
    createNewSession(sessions, guestUser)
  }

  function handleSelectSession(id) {
    const sess = sessions[id]
    setCurrentSessionId(id)
    setMessages(sess?.messages || [])
    setLastReferences(sess?.lastReferences || [])
  }

  function handleDeleteSession(id) {
    const updated = { ...sessions }
    delete updated[id]

    let newCurrentId = currentSessionId
    if (id === currentSessionId) {
      const remaining = Object.keys(updated).sort().reverse()
      if (remaining.length > 0) {
        newCurrentId = remaining[0]
      } else {
        newCurrentId = makeId()
        updated[newCurrentId] = { title: 'New Conversation', messages: [], lastReferences: [] }
      }
    }

    setSessions(updated)
    setCurrentSessionId(newCurrentId)
    setMessages(updated[newCurrentId]?.messages || [])
    setLastReferences(updated[newCurrentId]?.lastReferences || [])

    if (guestUser) {
      persistGuestSessions(updated)
    } else if (userEmail) {
      deleteSession(id)
    }
  }

  async function handleToggleSolved(problem, isSolved) {
    const targetTitle = (problem.problem_title || problem.title || '').trim()
    if (!targetTitle) return

    let updatedList = []
    if (isSolved) {
      const formatted = {
        problem_title: targetTitle,
        title: targetTitle,
        problem_link: problem.problem_link || problem.link || '',
        link: problem.problem_link || problem.link || '',
        company: problem.company || '',
        difficulty: problem.difficulty || 'Medium',
        topics: Array.isArray(problem.topics) ? problem.topics.join(', ') : (problem.topics || '')
      }
      updatedList = [...solvedProblems.filter(p => (p.problem_title || p.title || '').trim().toLowerCase() !== targetTitle.toLowerCase()), formatted]
      addToast(`" ${targetTitle} " marked as Solved! 🎉`)
    } else {
      updatedList = solvedProblems.filter(p => (p.problem_title || p.title || '').trim().toLowerCase() !== targetTitle.toLowerCase())
      addToast(`" ${targetTitle} " unmarked.`)
    }

    setSolvedProblems(updatedList)

    if (guestUser) {
      persistGuestSolved(updatedList)
    } else if (userEmail) {
      await toggleProblemSolved(userEmail, problem, isSolved)
    }
  }

  async function handleNewMessage(query, displayText = null) {
    if (isLoading) return
    const userMsg = { role: 'user', content: displayText || query }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const { answer, references } = await runQuery(query, messages)
      const assistantMsg = { role: 'assistant', content: answer }
      const finalMessages = [...newMessages, assistantMsg]
      setMessages(finalMessages)
      setLastReferences(references)

      const currentTitle = sessions[currentSessionId]?.title || 'New Conversation'
      const newTitle = currentTitle === 'New Conversation'
        ? (displayText || query).slice(0, 28)
        : currentTitle

      const updated = {
        ...sessions,
        [currentSessionId]: {
          title: newTitle,
          messages: finalMessages,
          lastReferences: references
        }
      }
      setSessions(updated)

      if (guestUser) {
        persistGuestSessions(updated)
      } else if (userEmail) {
        saveSession(currentSessionId, userEmail, newTitle, finalMessages, references)
      }
    } catch (err) {
      const errMsg = { role: 'assistant', content: 'Error connecting to the backend API.' }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegenerate() {
    if (isLoading || messages.length === 0) return
    const userMsgs = messages.filter(m => m.role === 'user')
    if (userMsgs.length === 0) return
    const lastUserQuery = userMsgs[userMsgs.length - 1].content

    let newMessages = [...messages]
    if (newMessages[newMessages.length - 1].role === 'assistant') {
      newMessages.pop()
    }
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const { answer, references } = await runQuery(lastUserQuery, newMessages)
      const assistantMsg = { role: 'assistant', content: answer }
      const finalMessages = [...newMessages, assistantMsg]
      setMessages(finalMessages)
      setLastReferences(references)

      const currentTitle = sessions[currentSessionId]?.title || 'New Conversation'
      const updated = {
        ...sessions,
        [currentSessionId]: {
          title: currentTitle,
          messages: finalMessages,
          lastReferences: references
        }
      }
      setSessions(updated)

      if (guestUser) {
        persistGuestSessions(updated)
      } else if (userEmail) {
        saveSession(currentSessionId, userEmail, currentTitle, finalMessages, references)
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error regenerating response.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const [refDrawerOpen, setRefDrawerOpen] = useState(false)

  if (!authenticated) {
    return <AuthPortal onAuth={handleAuth} />
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!sidebarCollapsed && (
        <div className="sidebar-backdrop" onClick={() => setSidebarCollapsed(true)} />
      )}

      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        guestUser={guestUser}
        userName={userName}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onSignOut={handleSignOut}
        onOpenAuth={handleOpenAuth}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        onToast={addToast}
        onOpenDashboard={() => setDashboardOpen(true)}
        onOpenTour={() => setTourOpen(true)}
      />

      <div className="main-content">
        <div className="main-inner">
          <ChatArea
            messages={messages}
            onNewMessage={handleNewMessage}
            onRegenerate={handleRegenerate}
            metadata={metadata}
            isLoading={isLoading}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
            onToggleRefDrawer={() => setRefDrawerOpen(prev => !prev)}
            onOpenDashboard={() => setDashboardOpen(true)}
            referenceCount={lastReferences ? lastReferences.length : 0}
          />
          <ReferencePanel
            references={lastReferences}
            refDrawerOpen={refDrawerOpen}
            onCloseRefDrawer={() => setRefDrawerOpen(false)}
            solvedTitles={solvedTitles}
            onToggleSolved={handleToggleSolved}
          />
        </div>
      </div>

      {/* LeetCode & DSA Dashboard Modal */}
      <LeetCodeDashboard
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        guestUser={guestUser}
        userEmail={userEmail}
        userName={userName}
        solvedProblems={solvedProblems}
        onToggleSolved={handleToggleSolved}
        onOpenAuth={handleOpenAuth}
      />

      {/* Non-centered Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  )
}
