import { useState, useEffect } from 'react'
import { syncLeetCodeUser, autoSyncUserLeetCodeByEmail, getUserProfile } from '../api/client'
import { getValidLeetCodeLink } from '../utils/leetcodeLinks'

export default function LeetCodeDashboard({
  isOpen,
  onClose,
  guestUser,
  userEmail,
  userName,
  solvedProblems = [],
  onToggleSolved,
  onOpenAuth,
  onSyncSuccess
}) {
  if (!isOpen) return null

  const [searchTerm, setSearchTerm] = useState('')
  const [diffFilter, setDiffFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const [lcUsernameInput, setLcUsernameInput] = useState('')
  const [linkedUsername, setLinkedUsername] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [officialStats, setOfficialStats] = useState(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, diffFilter, companyFilter])

  useEffect(() => {
    if (isOpen && userEmail && !guestUser) {
      getUserProfile(userEmail).then(prof => {
        if (prof && prof.leetcode_username) {
          setLinkedUsername(prof.leetcode_username)
          setLcUsernameInput(prof.leetcode_username)
        }
      })
      handleRefreshSync()
    }
  }, [isOpen, userEmail, guestUser])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        if (onClose) onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleRefreshSync() {
    if (!userEmail) return
    setIsSyncing(true)
    setSyncMsg('Refreshing sync with LeetCode...')
    try {
      const res = await autoSyncUserLeetCodeByEmail(userEmail)
      if (res) {
        if (res.username) setLinkedUsername(res.username)
        if (res.stats) setOfficialStats(res.stats)
        if (res.solved_problems) {
          setSyncMsg(`Synced with LeetCode! Total Solved: ${res.stats?.total || res.solved_problems.length}`)
          if (onSyncSuccess) onSyncSuccess(res.solved_problems)
        }
      }
    } catch {
      setSyncMsg('Failed to sync. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleManualSyncSubmit(e) {
    e.preventDefault()
    if (!lcUsernameInput.trim() || !userEmail) return
    setIsSyncing(true)
    setSyncMsg('Connecting to LeetCode account...')
    try {
      const res = await syncLeetCodeUser(userEmail, lcUsernameInput.trim())
      if (res) {
        setLinkedUsername(lcUsernameInput.trim())
        setIsEditing(false)
        if (res.stats) setOfficialStats(res.stats)
        if (res.solved_problems) {
          setSyncMsg(`Successfully linked @${lcUsernameInput.trim()}! Total Solved: ${res.stats?.total || res.synced_count}`)
          if (onSyncSuccess) onSyncSuccess(res.solved_problems)
        }
      } else {
        setSyncMsg('Profile synced.')
      }
    } catch {
      setSyncMsg('Failed to sync profile. Please check LeetCode username.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Calculate statistics
  const totalSolved = officialStats?.total != null ? officialStats.total : solvedProblems.length
  const easyCount = officialStats?.easy != null ? officialStats.easy : solvedProblems.filter(p => (p.difficulty || '').toLowerCase() === 'easy').length
  const mediumCount = officialStats?.medium != null ? officialStats.medium : solvedProblems.filter(p => (p.difficulty || '').toLowerCase() === 'medium').length
  const hardCount = officialStats?.hard != null ? officialStats.hard : solvedProblems.filter(p => (p.difficulty || '').toLowerCase() === 'hard').length

  // HackerRank skill rating logic based on solved count
  let starRating = 'Novice Solver'
  if (totalSolved >= 30) starRating = 'DSA Master'
  else if (totalSolved >= 20) starRating = 'Advanced Solver'
  else if (totalSolved >= 10) starRating = 'Intermediate Solver'
  else if (totalSolved >= 5) starRating = 'Rising Coder'

  // Company distribution
  const companyCounts = {}
  solvedProblems.forEach(p => {
    const comp = p.company
    if (comp) {
      companyCounts[comp] = (companyCounts[comp] || 0) + 1
    }
  })
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Filter solved problems list
  const filteredProblems = solvedProblems.filter(p => {
    const title = (p.problem_title || p.title || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase())
    const diff = (p.difficulty || '').toLowerCase()
    const matchesDiff = diffFilter === 'All' || diff === diffFilter.toLowerCase()
    const comp = (p.company || '').toLowerCase()
    const matchesComp = companyFilter === 'All' || comp.includes(companyFilter.toLowerCase())
    return matchesSearch && matchesDiff && matchesComp
  })

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="dashboard-overlay" onClick={() => onClose && onClose()}>
      <div className="dashboard-modal" onClick={e => e.stopPropagation()} id="tour-dashboard-modal">
        {/* Modal Header */}
        <div className="dashboard-header" id="tour-dashboard-header">
          <div>
            <div className="dashboard-title-row">
              <span className="dashboard-title">LeetCode & DSA Dashboard</span>
              {!guestUser && (
                <span className="hackerrank-badge">{starRating}</span>
              )}
            </div>
            <div className="dashboard-subtitle">
              {guestUser ? 'Guest Mode Account' : `Connected Email: ${userEmail || userName}`}
            </div>
          </div>
          <button
            type="button"
            className="dashboard-close-btn"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onClose) onClose()
            }}
            title="Close Dashboard"
            style={{ cursor: 'pointer', zIndex: 10, position: 'relative' }}
          >
            ✕
          </button>
        </div>

        {guestUser ? (
          /* Locked State for Guest Users */
          <div className="dashboard-guest-card">
            <div className="guest-lock-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3>LeetCode Analytics Dashboard</h3>
            <p>
              The LeetCode Dashboard is personalized for registered accounts.
              Sign up or log in with your email address to unlock your problem tracker, company target stats, and personalized unsolved question recommendations.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose()
                onOpenAuth()
              }}
              style={{ marginTop: '1rem', width: 'auto', padding: '0.65rem 1.75rem' }}
            >
              Sign Up / Sign In Now
            </button>
          </div>
        ) : (
          /* Full Dashboard View for Signed-In Users */
          <div className="dashboard-body">
            {/* LeetCode Sync Bar */}
            <div className="dash-company-section" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
              {linkedUsername && !isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div className="dash-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', margin: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                      Connected LeetCode Account: <strong style={{ color: '#fff', marginLeft: '4px' }}>@{linkedUsername}</strong>
                    </div>
                    {syncMsg && (
                      <div style={{ fontSize: '0.76rem', color: syncMsg.includes('Failed') ? '#fca5a5' : '#34d399', marginTop: '0.25rem' }}>
                        {syncMsg}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={handleRefreshSync}
                      disabled={isSyncing}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                      {isSyncing ? 'Syncing...' : 'Refresh Sync'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setIsEditing(true)}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Change LeetCode ID
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualSyncSubmit}>
                  <div className="dash-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    {linkedUsername ? 'Change LeetCode Username' : 'Link Your LeetCode Account'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="dash-search-input"
                      placeholder="Enter LeetCode Username (e.g. AgnivaSardar)"
                      value={lcUsernameInput}
                      onChange={e => setLcUsernameInput(e.target.value)}
                      style={{ flex: 1, minWidth: '220px' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary"
                      disabled={isSyncing || !lcUsernameInput.trim()}
                      style={{ padding: '0.38rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isSyncing ? 'Syncing...' : 'Connect & Import Solved Questions'}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setIsEditing(false)}
                        style={{ padding: '0.38rem 0.75rem' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {syncMsg && (
                    <div style={{ fontSize: '0.76rem', color: syncMsg.includes('Failed') ? '#fca5a5' : '#34d399', marginTop: '0.4rem' }}>
                      {syncMsg}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Top Stat Cards Grid */}
            <div className="dashboard-stats-grid">
              <div className="dash-stat-card total">
                <div className="dash-stat-label">Total Problems Solved</div>
                <div className="dash-stat-val">{totalSolved}</div>
                <div className="dash-stat-sub">Tracked in database</div>
              </div>
              <div className="dash-stat-card easy">
                <div className="dash-stat-label">Easy Solved</div>
                <div className="dash-stat-val easy">{easyCount}</div>
                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill easy"
                    style={{ width: `${totalSolved ? (easyCount / totalSolved) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="dash-stat-card medium">
                <div className="dash-stat-label">Medium Solved</div>
                <div className="dash-stat-val medium">{mediumCount}</div>
                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill medium"
                    style={{ width: `${totalSolved ? (mediumCount / totalSolved) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="dash-stat-card hard">
                <div className="dash-stat-label">Hard Solved</div>
                <div className="dash-stat-val hard">{hardCount}</div>
                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill hard"
                    style={{ width: `${totalSolved ? (hardCount / totalSolved) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Company Breakdown Badges if available */}
            {topCompanies.length > 0 && (
              <div className="dash-company-section">
                <div className="dash-section-title">Top Target Companies Solved</div>
                <div className="dash-company-chips">
                  {topCompanies.map(([comp, count]) => (
                    <div key={comp} className="dash-company-chip">
                      <span>{comp}</span>
                      <span className="dash-chip-count">{totalSolved} solved</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solved Problems Table Section */}
            <div className="dash-table-section">
              <div className="dash-table-header-row">
                <div className="dash-section-title" style={{ margin: 0 }}>
                  Solved Questions Log ({totalSolved})
                </div>
                <div className="dash-table-filters">
                  <input
                    type="text"
                    className="dash-search-input"
                    placeholder="Search solved questions…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="filter-select-sm"
                    value={diffFilter}
                    onChange={e => setDiffFilter(e.target.value)}
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="dash-table-wrap">
                {filteredProblems.length === 0 ? (
                  <div className="dash-table-empty">
                    {solvedProblems.length === 0
                      ? 'No problems marked as solved yet! Click "Mark as Solved" on reference questions in your chat.'
                      : 'No solved problems match your current search filter.'}
                  </div>
                ) : (
                  <>
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Problem Title</th>
                          <th>Difficulty</th>
                          <th>Company</th>
                          <th>Topics</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProblems.map((p, idx) => {
                          const title = p.problem_title || p.title || 'Unknown'
                          const diff = p.difficulty || 'Medium'
                          const comp = p.company || '—'
                          const rawLink = p.problem_link || p.link
                          const link = getValidLeetCodeLink(title, rawLink)
                          const topics = p.topics || '—'

                          return (
                            <tr key={idx}>
                              <td className="dash-title-td">
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dash-problem-link"
                                >
                                  {title} ↗
                                </a>
                              </td>
                              <td>
                                <span className={`diff-badge ${diff.toLowerCase()}`}>{diff}</span>
                              </td>
                              <td>{comp}</td>
                              <td className="dash-topics-td">{topics}</td>
                              <td>
                                <button
                                  type="button"
                                  className="dash-unmark-btn"
                                  onClick={() => onToggleSolved(p, false)}
                                  title="Unmark problem"
                                >
                                  Solved
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>

                    {/* Pagination Bar */}
                    <div className="dash-pagination-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', marginTop: '0.5rem', borderRadius: '0 0 8px 8px', flexWrap: 'wrap', gap: '0.6rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap' }}>
                        Showing <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + ITEMS_PER_PAGE, filteredProblems.length)}</strong> of <strong>{filteredProblems.length}</strong> solved problems
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', height: '34px' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                          Previous
                        </button>
                        <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', minWidth: '85px', textAlign: 'center', display: 'inline-block' }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', height: '34px' }}
                        >
                          Next
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
