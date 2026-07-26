import { getValidLeetCodeLink } from '../utils/leetcodeLinks'

export default function ReferencePanel({
  references = [],
  refDrawerOpen,
  onCloseRefDrawer,
  solvedTitles = new Set(),
  onToggleSolved
}) {
  const getDiffClass = (diff) => {
    if (!diff) return ''
    return diff.toLowerCase()
  }

  // Helper function to check if a problem title is solved
  const isSolved = (title) => {
    if (!title) return false
    const cleanTitle = title.trim().toLowerCase()
    return Array.from(solvedTitles).some(t => t.trim().toLowerCase() === cleanTitle)
  }

  // Split retrieved references into Todo and Already Done
  const todoQuestions = references.filter(q => !isSolved(q.title || q.problem_title))
  const alreadyDoneQuestions = references.filter(q => isSolved(q.title || q.problem_title))

  // Extract unique topics from retrieved references for YouTube recommendations
  const topicsSet = new Set()
  if (Array.isArray(references)) {
    references.forEach(r => {
      const raw = Array.isArray(r.topics) ? r.topics.join(',') : (r.topics || '')
      raw.split(',').forEach(t => {
        const clean = t.trim()
        if (clean) topicsSet.add(clean)
      })
    })
  }

  const topicList = Array.from(topicsSet).slice(0, 4)
  const ytLinks = topicList.map(topic => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} DSA tutorial NeetCode Striver`)}`
    return { topic, searchUrl }
  })

  function renderProblemCard(q, idx, isDone) {
    const title = q.title || q.problem_title || 'Unknown'
    const diff = q.difficulty || 'Medium'
    const freq = typeof q.frequency === 'number' ? q.frequency.toFixed(1) : '—'
    const ytQuery = encodeURIComponent(`LeetCode ${title} ${q.company || ''} solution`)
    const ytUrl = `https://www.youtube.com/results?search_query=${ytQuery}`
    const rawLink = q.link || q.problem_link
    const link = getValidLeetCodeLink(title, rawLink)

    return (
      <div key={idx} className={`ref-card ${isDone ? 'ref-card-done' : ''}`}>
        <div className="ref-card-header">
          <span className="ref-card-title">{title}</span>
          <span className={`diff-badge ${getDiffClass(diff)}`}>{diff}</span>
        </div>

        <div className="ref-card-meta">
          Company: <strong>{q.company || 'Unknown'}</strong><br />
          Frequency: <strong>{freq}</strong><br />
          Topics: {Array.isArray(q.topics) ? q.topics.join(', ') : (q.topics || 'DSA')}
        </div>

        <div className="ref-card-actions">
          <a
            className="ref-action-btn"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            LeetCode
          </a>

          <a
            href={ytUrl}
            className="ref-action-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Solution
          </a>

          <button
            type="button"
            className={`ref-action-btn ${isDone ? 'solved' : ''}`}
            onClick={() => onToggleSolved && onToggleSolved(q, !isDone)}
            title={isDone ? 'Mark as Unsolved' : 'Mark as Solved'}
          >
            {isDone ? 'Solved' : 'Mark'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {refDrawerOpen && (
        <div className="ref-backdrop" onClick={onCloseRefDrawer} />
      )}

      <aside className={`ref-column ${refDrawerOpen ? 'drawer-open' : ''}`} id="tour-references">
        <div className="ref-header-row">
          <div>
            <h3 style={{ margin: 0 }}>Retrieved Reference Problems</h3>
            <div className="ref-subtitle">Questions filtered from question database</div>
          </div>
          {onCloseRefDrawer && (
            <button
              type="button"
              className="ref-close-btn"
              onClick={onCloseRefDrawer}
              title="Close Panel"
            >
              ✕
            </button>
          )}
        </div>

        <div className="ref-list">
          {references.length === 0 ? (
            <div className="ref-empty">
              Ask a query or use the search filters to view retrieved problems here.
            </div>
          ) : (
            <>
              {/* TOP TABLE: Recommended Todo Questions */}
              <div className="ref-table-section">
                <div className="ref-table-header todo">
                  <span className="ref-table-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    Recommended Todo Questions
                  </span>
                  <span className="ref-table-count">{todoQuestions.length}</span>
                </div>
                {todoQuestions.length === 0 ? (
                  <div className="ref-section-empty">
                    All retrieved questions in this query have been completed by you!
                  </div>
                ) : (
                  todoQuestions.map((q, idx) => renderProblemCard(q, idx, false))
                )}
              </div>

              {/* BOTTOM TABLE: Already Done Questions */}
              <div className="ref-table-section" style={{ marginTop: '1.25rem' }}>
                <div className="ref-table-header done">
                  <span className="ref-table-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Already Done Questions
                  </span>
                  <span className="ref-table-count">{alreadyDoneQuestions.length}</span>
                </div>
                {alreadyDoneQuestions.length === 0 ? (
                  <div className="ref-section-empty">
                    No questions in this retrieval list are in your solved list yet.
                  </div>
                ) : (
                  alreadyDoneQuestions.map((q, idx) => renderProblemCard(q, idx, true))
                )}
              </div>
            </>
          )}
        </div>

        {ytLinks.length > 0 && (
          <div className="yt-section">
            <div className="yt-section-title">
              Topic Learning Tutorials
            </div>
            <div className="yt-links-wrap">
              {ytLinks.map(({ topic, searchUrl }) => (
                <a
                  key={topic}
                  className="yt-topic-link"
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn {topic}
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
