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
    const link = q.link || q.problem_link

    return (
      <div key={idx} className={`ref-card ${isDone ? 'ref-card-done' : ''}`}>
        <div className="ref-card-header">
          <div className="ref-card-title-wrap">
            <span className="ref-card-title">{title}</span>
            <a
              className="yt-card-btn"
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Watch YouTube solution for ${title}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
          <span className={`diff-badge ${getDiffClass(diff)}`}>{diff}</span>
        </div>

        <div className="ref-card-meta">
          Company: <strong>{q.company || 'Unknown'}</strong><br />
          Frequency: <strong>{freq}</strong><br />
          Topics: {Array.isArray(q.topics) ? q.topics.join(', ') : (q.topics || 'DSA')}
        </div>

        <div className="ref-card-actions">
          {link && link !== '#' && (
            <a
              className="ref-card-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on LeetCode ↗
            </a>
          )}
          <a
            className="ref-card-yt-link"
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ Solution
          </a>
          <button
            type="button"
            className={`ref-card-solve-btn ${isDone ? 'done' : ''}`}
            onClick={() => onToggleSolved && onToggleSolved(q, !isDone)}
            title={isDone ? 'Mark as Unsolved' : 'Mark as Solved'}
          >
            {isDone ? '✓ Solved' : '+ Mark Solved'}
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
                  <span className="ref-table-title">🎯 Recommended Todo Questions</span>
                  <span className="ref-table-count">{todoQuestions.length}</span>
                </div>
                {todoQuestions.length === 0 ? (
                  <div className="ref-section-empty">
                    Great job! All retrieved questions in this query have already been completed by you! 🎉
                  </div>
                ) : (
                  todoQuestions.map((q, idx) => renderProblemCard(q, idx, false))
                )}
              </div>

              {/* BOTTOM TABLE: Already Done Questions */}
              <div className="ref-table-section" style={{ marginTop: '1.25rem' }}>
                <div className="ref-table-header done">
                  <span className="ref-table-title">✓ Already Done Questions</span>
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF0000" style={{ marginRight: '6px' }}>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
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
                  ▶ Learn {topic} on YouTube
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
