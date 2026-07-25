import { useState, useEffect } from 'react'
import { autoSyncUserLeetCodeByEmail } from '../api/client'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [diffFilter, setDiffFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [officialStats, setOfficialStats] = useState(null)

  useEffect(() => {
    if (isOpen && userEmail && !guestUser) {
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
        if (res.stats) {
          setOfficialStats(res.stats)
        }
        if (res.solved_problems) {
          setSyncMsg(`Synced with registered email! Total Solved: ${res.stats?.total || res.solved_problems.length}`)
          if (onSyncSuccess) onSyncSuccess(res.solved_problems)
        }
      }
    } catch {
      setSyncMsg('Failed to sync. Please try again.')
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
  let starRating = '1★ Novice Solver'
  if (totalSolved >= 30) starRating = '5★ DSA Master'
  else if (totalSolved >= 20) starRating = '4★ Advanced Solver'
  else if (totalSolved >= 10) starRating = '3★ Intermediate Solver'
  else if (totalSolved >= 5) starRating = '2★ Rising Coder'

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

  return (
    <div className="dashboard-overlay" onClick={() => onClose && onClose()}>
      <div className="dashboard-modal" onClick={e => e.stopPropagation()} id="tour-dashboard-modal">
        {/* Modal Header */}
        <div className="dashboard-header">
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
            <div className="guest-lock-icon">🔒</div>
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
            <div className="dash-company-section" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div className="dash-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', margin: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  Automatic LeetCode Sync (Connected: {userEmail})
                </div>
                {syncMsg && (
                  <div style={{ fontSize: '0.76rem', color: syncMsg.includes('Failed') ? '#fca5a5' : '#34d399', marginTop: '0.25rem' }}>
                    {syncMsg}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleRefreshSync}
                disabled={isSyncing}
                style={{ padding: '0.4rem 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                {isSyncing ? 'Syncing...' : 'Refresh Sync'}
              </button>
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
                      {filteredProblems.map((p, idx) => {
                        const title = p.problem_title || p.title || 'Unknown'
                        const diff = p.difficulty || 'Medium'
                        const comp = p.company || '—'
                        const link = p.problem_link || p.link
                        const topics = p.topics || '—'

                        return (
                          <tr key={idx}>
                            <td className="dash-title-td">
                              {link && link !== '#' ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dash-problem-link"
                                >
                                  {title} ↗
                                </a>
                              ) : (
                                <span>{title}</span>
                              )}
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
                                ✓ Solved
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
