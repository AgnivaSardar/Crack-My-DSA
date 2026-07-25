import { useState, useEffect, useRef, useCallback } from 'react'

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
  onToast
}) {
  // { id, x, y } — fixed-positioned popup coords
  const [menu, setMenu] = useState(null)
  const menuRef = useRef(null)

  const sortedSessions = Object.entries(sessions).sort(([a], [b]) => b.localeCompare(a))

  // Close menu on outside click
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
      // Position the popup to the right of the ⋮ button, vertically centred on it
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
      <aside className="sidebar">
        {/* Fixed header */}
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

        <div className="sidebar-section-label">Saved Conversations</div>

        {/* Fixed new conversation button */}
        <div className="sidebar-new-btn-wrap">
          <button className="btn" onClick={() => { setMenu(null); onNewSession() }}>
            + Start New Conversation
          </button>
        </div>

        <div className="sidebar-divider" />

        {/* Scrollable conversation list */}
        <div className="sidebar-conversations">
          {sortedSessions.length === 0 && (
            <div style={{ fontSize: '0.78rem', color: '#444', padding: '0.5rem 0.25rem' }}>
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

        {/* Fixed footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-label">
            {guestUser ? 'Guest Mode (No Saving)' : `User: ${userName}`}
          </div>
          {guestUser ? (
            <button className="btn btn-sm" style={{ width: '100%' }} onClick={onOpenAuth}>
              Sign In to Save
            </button>
          ) : (
            <button className="btn btn-sm" style={{ width: '100%' }} onClick={onSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Floating context menu rendered outside sidebar via fixed positioning */}
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
