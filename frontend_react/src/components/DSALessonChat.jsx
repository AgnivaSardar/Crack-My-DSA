import React, { useState, useEffect } from 'react'
import { askDSADoubt } from '../api/client'

export default function DSALessonChat({
  topic,
  problems = [],
  language = 'cpp',
  onToggleLanguage,
  userEmail,
  guestUser,
  onToggleProblemProgress,
  onBackToRoadmap,
  onToast
}) {
  const [openDoubts, setOpenDoubts] = useState({})
  const [doubtInputs, setDoubtInputs] = useState({})
  const [doubtLoading, setDoubtLoading] = useState({})
  const [localProblems, setLocalProblems] = useState(problems)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    setLocalProblems(problems)
  }, [problems])

  const totalProblems = localProblems.length
  const completedCount = localProblems.filter(p => p.is_completed).length
  const percentage = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0

  function handleCheckToggle(pId, currentVal) {
    const newVal = !currentVal
    setLocalProblems(prev => prev.map(p => p.problem_id === pId ? { ...p, is_completed: newVal } : p))
    onToggleProblemProgress(pId, newVal)
  }

  function toggleDoubtSection(pId) {
    setOpenDoubts(prev => ({ ...prev, [pId]: !prev[pId] }))
  }

  async function handleSendDoubt(pId, pTitle, codeCtx) {
    const queryText = (doubtInputs[pId] || '').trim()
    if (!queryText) return

    setDoubtLoading(prev => ({ ...prev, [pId]: true }))

    try {
      const email = guestUser ? 'guest@local' : userEmail
      const res = await askDSADoubt(email, pId, pTitle, codeCtx, queryText)
      if (res && res.doubt) {
        setLocalProblems(prev => prev.map(p => {
          if (p.problem_id === pId) {
            const existingDoubts = p.user_doubts || []
            return { ...p, user_doubts: [...existingDoubts, res.doubt] }
          }
          return p
        }))
        setDoubtInputs(prev => ({ ...prev, [pId]: '' }))
        if (onToast) onToast('Private answer generated!')
      }
    } catch (err) {
      if (onToast) onToast('Failed to get answer for doubt.')
    } finally {
      setDoubtLoading(prev => ({ ...prev, [pId]: false }))
    }
  }

  function copyCode(pId, codeText) {
    navigator.clipboard.writeText(codeText)
    setCopiedId(pId)
    setTimeout(() => setCopiedId(null), 2000)
    if (onToast) onToast('Code copied to clipboard!')
  }

  return (
    <div className="dsa-lesson-chat-container">
      {/* Lesson Sticky Header */}
      <div className="dsa-lesson-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onBackToRoadmap} title="Back to Topics List">
            ← Back to Roadmap
          </button>
          <div>
            <h2 className="dsa-lesson-title">{topic?.title || 'DSA Topic'}</h2>
            <div className="dsa-lesson-subtitle">
              Strivers A2Z Read-Only AI Teaching Module • {completedCount} / {totalProblems} Completed ({percentage}%)
            </div>
          </div>
        </div>

        {/* Controls: Progress bar & Language Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="dsa-header-progress-wrap">
            <div className="dsa-progress-bar-bg">
              <div className="dsa-progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="dsa-lang-toggle-bar">
            <span className="dsa-lang-label">Code Language:</span>
            <button
              className={`dsa-lang-btn ${language === 'cpp' ? 'active' : ''}`}
              onClick={() => onToggleLanguage('cpp')}
            >
              C++
            </button>
            <button
              className={`dsa-lang-btn ${language === 'java' ? 'active' : ''}`}
              onClick={() => onToggleLanguage('java')}
            >
              Java
            </button>
          </div>
        </div>
      </div>

      {/* Main Teaching Chat Stream */}
      <div className="dsa-lesson-stream">
        <div className="dsa-ai-instructor-intro">
          <div className="dsa-ai-badge">🤖 AI Instructor</div>
          <p>
            Welcome to <strong>{topic?.title}</strong>! Below are all {totalProblems} core problems parsed from Strivers A2Z DSA Sheet.
            Review the intuition, step-by-step approach, complexity, and solution code in <strong>{language === 'cpp' ? 'C++' : 'Java'}</strong>.
            You can ask private doubts under any code block to get instant AI assistance!
          </p>
        </div>

        {localProblems.map((prob, index) => {
          const isDone = prob.is_completed
          const activeCode = language === 'java' ? (prob.java_code || prob.cpp_code) : prob.cpp_code
          const doubtsList = prob.user_doubts || []
          const isDoubtOpen = !!openDoubts[prob.problem_id]
          const isAsking = !!doubtLoading[prob.problem_id]

          return (
            <div key={prob.problem_id || index} className={`dsa-problem-card ${isDone ? 'completed-card' : ''}`}>
              {/* Problem Title Bar */}
              <div className="dsa-card-header">
                <div className="dsa-card-header-left">
                  <label className="dsa-checkbox-container" title="Toggle Solved Status">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleCheckToggle(prob.problem_id, isDone)}
                    />
                    <span className="dsa-checkmark" />
                  </label>
                  <span className="dsa-problem-num">#{index + 1}</span>
                  <h3 className="dsa-problem-title">{prob.title}</h3>
                  {prob.subfolder && <span className="dsa-subfolder-tag">{prob.subfolder}</span>}
                </div>

                <div className="dsa-card-header-right">
                  {prob.leetcode_link && (
                    <a
                      href={prob.leetcode_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dsa-leetcode-link-btn"
                      title="Open on LeetCode"
                    >
                      {prob.leetcode_number ? `#${prob.leetcode_number} ` : ''}LeetCode ↗
                    </a>
                  )}
                  <button
                    className={`dsa-status-badge ${isDone ? 'status-done' : 'status-pending'}`}
                    onClick={() => handleCheckToggle(prob.problem_id, isDone)}
                  >
                    {isDone ? '✓ Solved' : 'Mark Solved'}
                  </button>
                </div>
              </div>

              {/* Question Description */}
              <div className="dsa-card-section">
                <div className="dsa-section-label">📌 Question & Example</div>
                <div className="dsa-text-content pre-wrap">{prob.question_text}</div>
              </div>

              {/* Intuition & Approach Breakdown */}
              <div className="dsa-card-section">
                <div className="dsa-section-label">💡 AI Intuition & Step-by-Step Approach</div>
                <div className="dsa-text-content pre-wrap">{prob.approach_text}</div>
              </div>

              {/* Code Snippet Block */}
              <div className="dsa-card-section">
                <div className="dsa-code-header">
                  <span>💻 Solution ({language === 'cpp' ? 'C++' : 'Java'})</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyCode(prob.problem_id, activeCode)}
                  >
                    {copiedId === prob.problem_id ? '✓ Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre className="dsa-code-block">
                  <code>{activeCode}</code>
                </pre>
              </div>

              {/* Complexity Analysis Cards */}
              <div className="dsa-complexity-row">
                <div className="dsa-complexity-box">
                  <span className="dsa-comp-title">⏱️ Time Complexity</span>
                  <span className="dsa-comp-value">{prob.time_complexity || 'O(N)'}</span>
                </div>
                <div className="dsa-complexity-box">
                  <span className="dsa-comp-title">💾 Space Complexity</span>
                  <span className="dsa-comp-value">{prob.space_complexity || 'O(1)'}</span>
                </div>
              </div>

              {/* Private User Doubt & Notes Section */}
              <div className="dsa-doubt-container">
                <button
                  className="dsa-doubt-toggle-btn"
                  onClick={() => toggleDoubtSection(prob.problem_id)}
                >
                  <span>💬 Private Doubts & Notes ({doubtsList.length})</span>
                  <span>{isDoubtOpen ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                {isDoubtOpen && (
                  <div className="dsa-doubt-content">
                    {doubtsList.length === 0 ? (
                      <div className="dsa-no-doubts-msg">
                        No private doubts asked for this problem yet. Type below if you have any questions or notes!
                      </div>
                    ) : (
                      <div className="dsa-doubts-list">
                        {doubtsList.map((d, dIdx) => (
                          <div key={d.id || dIdx} className="dsa-doubt-item">
                            <div className="dsa-user-doubt-bubble">
                              <strong>You:</strong> {d.doubt_text}
                            </div>
                            <div className="dsa-ai-doubt-response">
                              <strong>🤖 Private AI Response:</strong>
                              <div className="pre-wrap" style={{ marginTop: '4px' }}>{d.ai_response}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Doubt Input */}
                    <div className="dsa-doubt-input-wrap">
                      <input
                        type="text"
                        className="dsa-doubt-input"
                        placeholder="Ask a doubt or write a private note for this code..."
                        value={doubtInputs[prob.problem_id] || ''}
                        onChange={(e) => setDoubtInputs({ ...doubtInputs, [prob.problem_id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendDoubt(prob.problem_id, prob.title, activeCode)
                        }}
                        disabled={isAsking}
                      />
                      <button
                        className="btn btn-sm"
                        onClick={() => handleSendDoubt(prob.problem_id, prob.title, activeCode)}
                        disabled={isAsking || !(doubtInputs[prob.problem_id] || '').trim()}
                      >
                        {isAsking ? 'Thinking...' : 'Ask AI'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
