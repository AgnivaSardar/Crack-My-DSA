import { useState, useEffect, useCallback, useMemo } from 'react'
import AuthPortal from './components/AuthPortal'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ReferencePanel from './components/ReferencePanel'
import LeetCodeDashboard from './components/LeetCodeDashboard'
import OnboardingTourModal from './components/OnboardingTourModal'
import DSALessonChat from './components/DSALessonChat'
import {
  getMetadata,
  runQuery,
  saveSession,
  deleteSession,
  getUserSessions,
  getUserSolvedProblems,
  toggleProblemSolved,
  getDSATopics,
  getDSATopicProblems,
  toggleDSAProgress
} from './api/client'

const LS_GUEST = 'dsa_cracker_guest_sessions'
const LS_GUEST_SOLVED = 'dsa_cracker_guest_solved'
const LS_AUTH = 'dsa_cracker_auth'
const LS_LANG = 'dsa_cracker_language'
const LS_ACTIVE_TAB = 'dsa_cracker_active_tab'
const LS_SELECTED_TOPIC = 'dsa_cracker_selected_topic'
const LS_DSA_SUBTAB = 'dsa_cracker_dsa_subtab'
const LS_SESSION_ID = 'dsa_cracker_session_id'

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
  const [currentSessionId, setCurrentSessionIdState] = useState(null)
  const [messages, setMessages] = useState([])
  const [lastReferences, setLastReferences] = useState([])
  const [solvedProblems, setSolvedProblems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [metadata, setMetadata] = useState(null)

  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  // DSA Roadmap States with LocalStorage Persistence
  const [sidebarTab, setSidebarTabState] = useState(() => localStorage.getItem(LS_ACTIVE_TAB) || 'past_chats')
  const [language, setLanguage] = useState(() => localStorage.getItem(LS_LANG) || 'cpp')
  const [dsaTopics, setDsaTopics] = useState([])
  const [selectedTopicId, setSelectedTopicIdState] = useState(() => {
    const saved = localStorage.getItem(LS_SELECTED_TOPIC)
    return saved !== null ? Number(saved) : null
  })
  const [dsaSubtab, setDsaSubtabState] = useState(() => localStorage.getItem(LS_DSA_SUBTAB) || 'theory')
  const [topicProblems, setTopicProblems] = useState([])

  const setSidebarTab = useCallback((tab) => {
    setSidebarTabState(tab)
    try { localStorage.setItem(LS_ACTIVE_TAB, tab) } catch {}
  }, [])

  const setSelectedTopicId = useCallback((tId) => {
    setSelectedTopicIdState(tId)
    if (tId !== null) {
      try { localStorage.setItem(LS_SELECTED_TOPIC, String(tId)) } catch {}
    } else {
      try { localStorage.removeItem(LS_SELECTED_TOPIC) } catch {}
    }
  }, [])

  const setDsaSubtab = useCallback((subtab) => {
    setDsaSubtabState(subtab)
    try { localStorage.setItem(LS_DSA_SUBTAB, subtab) } catch {}
  }, [])

  const setCurrentSessionId = useCallback((sId) => {
    setCurrentSessionIdState(sId)
    if (sId) {
      try { localStorage.setItem(LS_SESSION_ID, sId) } catch {}
    }
  }, [])

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

      const savedSessId = localStorage.getItem(LS_SESSION_ID)

      if (cached.guestUser) {
        const guestSessions = loadGuestSessions()
        setSessions(guestSessions)
        setSolvedProblems(loadGuestSolved())
        if (Object.keys(guestSessions).length === 0) {
          createNewSession(guestSessions, true)
        } else {
          const targetId = savedSessId && guestSessions[savedSessId]
            ? savedSessId
            : Object.keys(guestSessions).sort().reverse()[0]
          setCurrentSessionId(targetId)
          setMessages(guestSessions[targetId]?.messages || [])
          setLastReferences(guestSessions[targetId]?.lastReferences || [])
        }
      } else {
        // User account — fetch sessions & solved list from server
        getUserSessions(cached.userEmail).then(userSessions => {
          const sessMap = userSessions || {}
          setSessions(sessMap)
          if (Object.keys(sessMap).length === 0) {
            createNewSession(sessMap, false)
          } else {
            const targetId = savedSessId && sessMap[savedSessId]
              ? savedSessId
              : Object.keys(sessMap).sort().reverse()[0]
            setCurrentSessionId(targetId)
            setMessages(sessMap[targetId]?.messages || [])
            setLastReferences(sessMap[targetId]?.lastReferences || [])
          }
        })
        getUserSolvedProblems(cached.userEmail).then(setSolvedProblems)
      }
    }
  }, [setCurrentSessionId])

  // Load DSA Roadmap topics when tab changes or email changes
  useEffect(() => {
    if (sidebarTab === 'dsa_roadmap') {
      const email = guestUser ? null : userEmail
      getDSATopics(email).then(topics => {
        setDsaTopics(topics || [])
        if (!selectedTopicId && topics && topics.length > 0) {
          setSelectedTopicId(topics[0].topic_id)
        }
      })
    }
  }, [sidebarTab, userEmail, guestUser])

  // Load DSA Roadmap problems for selected topic
  useEffect(() => {
    if (selectedTopicId !== null && sidebarTab === 'dsa_roadmap') {
      const email = guestUser ? null : userEmail
      getDSATopicProblems(selectedTopicId, email).then(probs => {
        setTopicProblems(probs || [])
      })
    }
  }, [selectedTopicId, sidebarTab, userEmail, guestUser])

  function handleToggleLanguage(lang) {
    setLanguage(lang)
    try { localStorage.setItem(LS_LANG, lang) } catch {}
  }

  function handleSelectTopic(tId) {
    setSelectedTopicId(tId)
    setSidebarTab('dsa_roadmap')
    const email = guestUser ? null : userEmail
    getDSATopicProblems(tId, email).then(probs => {
      setTopicProblems(probs || [])
    })
  }

  async function handleToggleDSAProgress(problemId, isCompleted) {
    const email = guestUser ? null : userEmail
    await toggleDSAProgress(email, problemId, isCompleted)
    // Refresh topics list to update completed counts in sidebar
    getDSATopics(email).then(topics => setDsaTopics(topics || []))
  }

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
    setSidebarTab('past_chats')
    createNewSession(sessions, guestUser)
  }

  function handleSelectSession(id) {
    setSidebarTab('past_chats')
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
      const { answer, references } = await runQuery(query, messages, null, userEmail)
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

  const handleStartTour = useCallback(() => {
    setDashboardOpen(false)
    setRefDrawerOpen(false)
    setSidebarTab('past_chats')
    setTourOpen(true)
  }, [setSidebarTab])

  const handleTourStepChange = useCallback((actionKey) => {
    if (actionKey === 'past_chats') {
      setSidebarTab('past_chats')
      setDashboardOpen(false)
      setRefDrawerOpen(false)
    } else if (actionKey === 'dsa_roadmap') {
      setSidebarTab('dsa_roadmap')
      setDashboardOpen(false)
      setRefDrawerOpen(false)
      if (!selectedTopicId) setSelectedTopicId(1)
    } else if (actionKey === 'dsa_theory') {
      setSidebarTab('dsa_roadmap')
      setDashboardOpen(false)
      setRefDrawerOpen(false)
      if (!selectedTopicId) setSelectedTopicId(1)
      setDsaSubtab('theory')
    } else if (actionKey === 'dsa_problems') {
      setSidebarTab('dsa_roadmap')
      setDashboardOpen(false)
      setRefDrawerOpen(false)
      if (!selectedTopicId) setSelectedTopicId(1)
      setDsaSubtab('problems')
    } else if (actionKey === 'ai_assistant') {
      setSidebarTab('past_chats')
      setDashboardOpen(false)
      setRefDrawerOpen(false)
    } else if (actionKey === 'references') {
      setSidebarTab('past_chats')
      setDashboardOpen(false)
      setRefDrawerOpen(true)
    } else if (actionKey === 'dashboard') {
      setDashboardOpen(true)
    }
  }, [setSidebarTab, selectedTopicId, setSelectedTopicId, setDsaSubtab])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const [refDrawerOpen, setRefDrawerOpen] = useState(false)

  if (!authenticated) {
    return <AuthPortal onAuth={handleAuth} />
  }

  const currentTopic = dsaTopics.find(t => t.topic_id === selectedTopicId) || dsaTopics[0]

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
        onOpenTour={handleStartTour}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        dsaTopics={dsaTopics}
        selectedTopicId={selectedTopicId}
        onSelectTopic={handleSelectTopic}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      <div className="main-content">
        {sidebarTab === 'dsa_roadmap' && selectedTopicId !== null ? (
          <DSALessonChat
            topic={currentTopic}
            problems={topicProblems}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            userEmail={userEmail}
            guestUser={guestUser}
            onToggleProblemProgress={handleToggleDSAProgress}
            onBackToRoadmap={() => setSidebarTab('past_chats')}
            onToast={addToast}
            activeSubtab={dsaSubtab}
            onSubtabChange={setDsaSubtab}
          />
        ) : (
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
        )}
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
        onSyncSuccess={(newList) => setSolvedProblems(newList)}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onStepChange={handleTourStepChange}
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
