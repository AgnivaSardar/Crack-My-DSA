import React, { useState, useEffect } from 'react'
import { askDSADoubt } from '../api/client'

// Minimalist Monochrome SVG Icons
const IconBack = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const IconAI = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="9" cy="16" r="1" fill="currentColor" />
    <circle cx="15" cy="16" r="1" fill="currentColor" />
    <path d="M12 7v4M8 7h8" />
  </svg>
)

const IconQuestion = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconApproach = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const IconCode = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconDatabase = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

const IconMessage = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconExternal = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

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
      {/* Sleek Compact Header */}
      <div className="dsa-lesson-header">
        <div className="dsa-header-left">
          <button className="dsa-back-btn" onClick={onBackToRoadmap} title="Back to Topics List">
            <IconBack /> Back
          </button>
          <div className="dsa-header-title-box">
            <h2 className="dsa-lesson-title">{topic?.title || 'DSA Topic'}</h2>
            <span className="dsa-lesson-subtitle">
              Strivers A2Z Sheet • {completedCount}/{totalProblems} Completed ({percentage}%)
            </span>
          </div>
        </div>

        {/* Progress & Language Toggle */}
        <div className="dsa-header-right">
          <div className="dsa-header-progress-wrap">
            <div className="dsa-progress-bar-bg">
              <div className="dsa-progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="dsa-lang-toggle-bar">
            <span className="dsa-lang-label">Language:</span>
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
          <div className="dsa-ai-badge">
            <IconAI /> AI Instructor
          </div>
          <p>
            Welcome to <strong>{topic?.title}</strong>. Below are all {totalProblems} core problems parsed from Strivers A2Z DSA Sheet.
            Review intuition, step-by-step approach, complexity, and solution code in <strong>{language === 'cpp' ? 'C++' : 'Java'}</strong>.
            Ask private doubts under any code block for instant AI guidance.
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
                      className="dsa-btn-action ghost"
                      title="Open on LeetCode"
                    >
                      LeetCode <IconExternal />
                    </a>
                  )}
                  <button
                    className={`dsa-btn-action ${isDone ? 'solid' : 'ghost'}`}
                    onClick={() => handleCheckToggle(prob.problem_id, isDone)}
                  >
                    {isDone ? <><IconCheck /> Solved</> : 'Mark Solved'}
                  </button>
                </div>
              </div>

              {/* Question Description */}
              <div className="dsa-card-section">
                <div className="dsa-section-label">
                  <IconQuestion /> Question & Examples
                </div>
                <div className="dsa-text-content pre-wrap">{prob.question_text}</div>
              </div>

              {/* Intuition & Approach Breakdown */}
              <div className="dsa-card-section">
                <div className="dsa-section-label">
                  <IconApproach /> AI Intuition & Step-by-Step Approach
                </div>
                <div className="dsa-text-content pre-wrap">{prob.approach_text}</div>
              </div>

              {/* Code Snippet Block */}
              <div className="dsa-card-section">
                <div className="dsa-code-header">
                  <span className="dsa-section-label">
                    <IconCode /> Solution ({language === 'cpp' ? 'C++' : 'Java'})
                  </span>
                  <button
                    className="dsa-btn-action ghost sm"
                    onClick={() => copyCode(prob.problem_id, activeCode)}
                  >
                    {copiedId === prob.problem_id ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                  </button>
                </div>
                <pre className="dsa-code-block">
                  <code>{activeCode}</code>
                </pre>
              </div>

              {/* Complexity Analysis Cards */}
              <div className="dsa-complexity-row">
                <div className="dsa-complexity-box">
                  <span className="dsa-comp-title"><IconClock /> Time Complexity</span>
                  <span className="dsa-comp-value">{prob.time_complexity || 'O(N)'}</span>
                </div>
                <div className="dsa-complexity-box">
                  <span className="dsa-comp-title"><IconDatabase /> Space Complexity</span>
                  <span className="dsa-comp-value">{prob.space_complexity || 'O(1)'}</span>
                </div>
              </div>

              {/* Private User Doubt & Notes Section */}
              <div className="dsa-doubt-container">
                <button
                  className="dsa-doubt-toggle-btn"
                  onClick={() => toggleDoubtSection(prob.problem_id)}
                >
                  <span className="dsa-doubt-toggle-left">
                    <IconMessage /> Private Doubts & Notes ({doubtsList.length})
                  </span>
                  <span className="dsa-doubt-toggle-arrow">{isDoubtOpen ? '▲' : '▼'}</span>
                </button>

                {isDoubtOpen && (
                  <div className="dsa-doubt-content">
                    {doubtsList.length === 0 ? (
                      <div className="dsa-no-doubts-msg">
                        No private doubts asked for this problem yet. Type below to ask a question or write a private note.
                      </div>
                    ) : (
                      <div className="dsa-doubts-list">
                        {doubtsList.map((d, dIdx) => (
                          <div key={d.id || dIdx} className="dsa-doubt-item">
                            <div className="dsa-user-doubt-bubble">
                              <span className="dsa-doubt-role">You:</span> {d.doubt_text}
                            </div>
                            <div className="dsa-ai-doubt-response">
                              <span className="dsa-doubt-role ai">
                                <IconAI /> Private AI Response:
                              </span>
                              <div className="pre-wrap" style={{ marginTop: '3px' }}>{d.ai_response}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Doubt Input Row */}
                    <div className="dsa-doubt-input-row">
                      <input
                        type="text"
                        className="dsa-doubt-input"
                        placeholder="Ask a doubt or write a private note..."
                        value={doubtInputs[prob.problem_id] || ''}
                        onChange={(e) => setDoubtInputs({ ...doubtInputs, [prob.problem_id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendDoubt(prob.problem_id, prob.title, activeCode)
                        }}
                        disabled={isAsking}
                      />
                      <button
                        className="dsa-btn-action solid"
                        onClick={() => handleSendDoubt(prob.problem_id, prob.title, activeCode)}
                        disabled={isAsking || !(doubtInputs[prob.problem_id] || '').trim()}
                      >
                        {isAsking ? 'Asking...' : 'Ask AI'}
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
