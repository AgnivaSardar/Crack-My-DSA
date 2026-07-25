import { useState, useEffect, useRef, useCallback } from 'react'

const IconChat = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconRoadmap = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

export default function Sidebar({
  sessions,
  currentSessionId,
  guestUser,
  userName,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onSignOut,
  onOpenAuth,
  onToggleSidebar,
  onToast,
  onOpenDashboard,
  onOpenTour,
  activeTab = 'past_chats',
  onTabChange,
  dsaTopics = [],
  selectedTopicId = null,
  onSelectTopic,
  language = 'cpp',
  onToggleLanguage
}) {
  const [menu, setMenu] = useState(null)
  const menuRef = useRef(null)

  const sortedSessions = Object.entries(sessions).sort(([a], [b]) => b.localeCompare(a))

  // Calculate overall roadmap progress
  const totalRoadmapProblems = dsaTopics.reduce((acc, t) => acc + (t.total_problems || 0), 0)
  const totalCompletedProblems = dsaTopics.reduce((acc, t) => acc + (t.completed_count || 0), 0)
  const overallRoadmapPercentage = totalRoadmapProblems > 0 ? Math.round((totalCompletedProblems / totalRoadmapProblems) * 100) : 0

  const handleOutsideClick = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenu(null)
    }
  }, [])

  useEffect(() => {
    if (menu) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menu, handleOutsideClick])

  function openMenu(e, id) {
    e.stopPropagation()
    if (menu?.id === id) { setMenu(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenu({
      id,
      x: rect.right + 6,
      y: rect.top - 4
    })
  }

  function handleDelete(id) {
    setMenu(null)
    onDeleteSession(id)
  }

  function handleShare() {
    setMenu(null)
    onToast('Conversation link copied to clipboard!')
  }

  return (
    <>
      <aside className="sidebar" id="tour-sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <span className="sidebar-logo">Crack My DSA</span>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleSidebar}
            title="Close Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Dual Tab Navigation Bar */}
        <div className="sidebar-tab-bar">
          <button
            className={`sidebar-tab-btn ${activeTab === 'past_chats' ? 'active' : ''}`}
            onClick={() => onTabChange('past_chats')}
          >
            <IconChat /> Past Chats
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === 'dsa_roadmap' ? 'active' : ''}`}
            onClick={() => onTabChange('dsa_roadmap')}
          >
            <IconRoadmap /> DSA Roadmap
          </button>
        </div>

        <div className="sidebar-divider" />

        {/* Content based on Active Tab */}
        {activeTab === 'past_chats' ? (
          <>
            <div className="sidebar-section-label">Saved Conversations</div>

            {/* New Conversation Button */}
            <div className="sidebar-new-btn-wrap">
              <button className="btn" onClick={() => { setMenu(null); onNewSession() }}>
                + Start New Conversation
              </button>
            </div>

            {/* Conversations List */}
            <div className="sidebar-conversations">
              {sortedSessions.length === 0 && (
                <div style={{ fontSize: '0.78rem', color: '#666', padding: '0.5rem 0.25rem' }}>
                  No saved conversations yet.
                </div>
              )}

              {sortedSessions.map(([id, data]) => {
                const title = data.title || 'New Conversation'
                const isActive = id === currentSessionId
                const isMenuOpen = menu?.id === id

                return (
                  <div key={id} className="conv-row">
                    <button
                      className={`conv-name-btn ${isActive ? 'active' : ''}`}
                      onClick={() => { setMenu(null); onSelectSession(id) }}
                      title={title}
                    >
                      {title}
                    </button>
                    <button
                      className={`conv-dots-btn ${isMenuOpen ? 'dots-active' : ''}`}
                      onClick={(e) => openMenu(e, id)}
                      title="Options"
                    >
                      ⋮
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          /* DSA Roadmap Tab Content */
          <div className="sidebar-roadmap-container">
            {/* Language Selector Header */}
            <div className="sidebar-roadmap-lang-box">
              <span className="sidebar-roadmap-lang-title">Code Language:</span>
              <div className="sidebar-roadmap-lang-toggle">
                <button
                  className={`sidebar-lang-opt ${language === 'cpp' ? 'active' : ''}`}
                  onClick={() => onToggleLanguage('cpp')}
                >
                  C++
                </button>
                <button
                  className={`sidebar-lang-opt ${language === 'java' ? 'active' : ''}`}
                  onClick={() => onToggleLanguage('java')}
                >
                  Java
                </button>
              </div>
            </div>

            {/* Overall Progress Widget */}
            <div className="sidebar-overall-progress-card">
              <div className="sidebar-progress-title-row">
                <span>Strivers A2Z Progress</span>
                <span className="sidebar-progress-pct">{overallRoadmapPercentage}%</span>
              </div>
              <div className="dsa-progress-bar-bg" style={{ height: '5px', marginTop: '6px' }}>
                <div className="dsa-progress-bar-fill" style={{ width: `${overallRoadmapPercentage}%` }} />
              </div>
              <div className="sidebar-progress-sub">
                {totalCompletedProblems} of {totalRoadmapProblems} problems solved
              </div>
            </div>

            <div className="sidebar-section-label" style={{ marginTop: '0.8rem' }}>
              16 Core Topics (Striver's A2Z)
            </div>

            {/* Topics List */}
            <div className="sidebar-conversations">
              {dsaTopics.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#666', padding: '0.5rem 0.25rem' }}>
                  Loading DSA Topics...
                </div>
              ) : (
                dsaTopics.map((topic) => {
                  const isSelected = selectedTopicId === topic.topic_id
                  const done = topic.completed_count || 0
                  const total = topic.total_problems || 0
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0

                  return (
                    <button
                      key={topic.topic_id}
                      className={`dsa-topic-item-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => onSelectTopic(topic.topic_id)}
                      title={topic.title}
                    >
                      <div className="dsa-topic-title-wrap">
                        <span className="dsa-topic-title-text">{topic.title}</span>
                        <span className="dsa-topic-badge">{done}/{total}</span>
                      </div>
                      <div className="dsa-topic-progress-mini-bar">
                        <div className="dsa-topic-mini-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Sidebar Fixed Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-label">
            {guestUser ? 'Guest Mode' : `User: ${userName}`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            <button className="btn btn-sm" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onOpenDashboard}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>
              LeetCode Dashboard
            </button>
            <button className="btn btn-sm btn-secondary" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onOpenTour}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Take Feature Tour
            </button>
            {guestUser ? (
              <button className="btn btn-sm" style={{ width: '100%', marginTop: '0.2rem' }} onClick={onOpenAuth}>
                Sign In to Save
              </button>
            ) : (
              <button className="btn btn-sm" style={{ width: '100%', marginTop: '0.2rem' }} onClick={onSignOut}>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Floating Context Menu */}
      {menu && (
        <div
          ref={menuRef}
          className="conv-float-menu"
          style={{ top: menu.y, left: menu.x }}
        >
          <button className="conv-float-btn" onClick={handleShare}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
          <div className="conv-float-divider" />
          <button className="conv-float-btn danger" onClick={() => handleDelete(menu.id)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Delete
          </button>
        </div>
      )}
    </>
  )
}
