import React, { useState, useEffect } from 'react'
import { askDSADoubt } from '../api/client'
import { dsaTheoryData } from '../data/dsaTheoryData'
import { DSADiagram } from './DSADiagrams'

// Minimalist Monochrome SVG Icons (No Emojis!)
const IconBack = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const IconTheory = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const IconProblems = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
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

const IconLightbulb = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4M15.09 14A6 6 0 0 0 18 9a6 6 0 0 0-12 0 6 6 0 0 0 2.91 5" />
  </svg>
)

const IconGear = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const IconCheckCircle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconXCircle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const IconLayers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

// Markdown Formatter
function renderFormattedMarkdown(text) {
  if (!text) return null

  const lines = text.split('\n')
  return lines.map((line, lIdx) => {
    let cleanLine = line.trim()
    cleanLine = cleanLine.replace(/^(\d+[\.\)])\s*(\d+[\.\)])\s*/, '$1 ')

    const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g)
    const formattedElements = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={pIdx} className="dsa-bold-text">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return <code key={pIdx} className="dsa-inline-code">{part.slice(1, -1)}</code>
      }
      return part
    })

    return (
      <React.Fragment key={lIdx}>
        {formattedElements}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

// IDE / ChatGPT Style Code Syntax Highlighter Component
function SyntaxCodeBlock({ code }) {
  if (!code) return <pre className="dsa-code-block"><code>// No code available</code></pre>

  const lines = code.split('\n')

  return (
    <pre className="dsa-code-block">
      <code>
        {lines.map((line, lineIdx) => {
          const tokens = []
          const regex = /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:class|public|private|protected|void|int|bool|boolean|double|float|char|string|String|vector|unordered_map|map|set|unordered_set|stack|queue|priority_queue|if|else|for|while|return|new|delete|import|include|using|namespace|const|static|struct|NULL|nullptr|true|false|this)\b|\b[A-Z][a-zA-Z0-9_]*\b|\b\d+\b)/g

          let match
          let lastIndex = 0

          while ((match = regex.exec(line)) !== null) {
            const tokenText = match[0]
            const index = match.index

            if (index > lastIndex) {
              tokens.push(<span key={`txt-${lastIndex}`} className="syn-plain">{line.slice(lastIndex, index)}</span>)
            }

            let tokenClass = "syn-plain"
            if (tokenText.startsWith("//") || tokenText.startsWith("/*")) {
              tokenClass = "syn-comment"
            } else if (tokenText.startsWith('"') || tokenText.startsWith("'")) {
              tokenClass = "syn-string"
            } else if (/^\b\d+\b$/.test(tokenText)) {
              tokenClass = "syn-number"
            } else if (/^\b[A-Z][a-zA-Z0-9_]*\b$/.test(tokenText)) {
              tokenClass = "syn-type"
            } else {
              tokenClass = "syn-keyword"
            }

            tokens.push(<span key={`tok-${index}`} className={tokenClass}>{tokenText}</span>)
            lastIndex = regex.lastIndex
          }

          if (lastIndex < line.length) {
            tokens.push(<span key={`txt-${lastIndex}`} className="syn-plain">{line.slice(lastIndex)}</span>)
          }

          return (
            <div key={lineIdx} className="code-line">
              <span className="code-line-num">{lineIdx + 1}</span>
              <span className="code-line-content">{tokens.length > 0 ? tokens : ' '}</span>
            </div>
          )
        })}
      </code>
    </pre>
  )
}

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
  // CRITICAL DIRECTIVE: Always open Theory & Concepts first!
  const [viewTab, setViewTab] = useState('theory')
  const [openDoubts, setOpenDoubts] = useState({})
  const [doubtInputs, setDoubtInputs] = useState({})
  const [doubtLoading, setDoubtLoading] = useState({})
  const [localProblems, setLocalProblems] = useState(problems)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    setLocalProblems(problems)
    // Whenever topic changes, force default to Theory sub-tab first!
    setViewTab('theory')
  }, [topic, problems])

  const topicId = topic?.topic_id || 1
  const theoryData = dsaTheoryData[topicId] || dsaTheoryData[1]

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
      {/* Prominent Header with Increased Title Font Size */}
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

        {/* Navigation Sub-Tabs (Theory First!) */}
        <div className="dsa-view-subtabs">
          <button
            className={`dsa-subtab-btn ${viewTab === 'theory' ? 'active' : ''}`}
            onClick={() => setViewTab('theory')}
          >
            <IconTheory /> Topic Theory & Concepts
          </button>
          <button
            className={`dsa-subtab-btn ${viewTab === 'problems' ? 'active' : ''}`}
            onClick={() => setViewTab('problems')}
          >
            <IconProblems /> Problems & Solutions ({totalProblems})
          </button>
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

      {/* Main View Area (Theory vs Problems Stream) */}
      <div className="dsa-lesson-stream">
        {viewTab === 'theory' ? (
          /* --- TOPIC THEORY & CONCEPT TAB --- */
          <div className="dsa-theory-document">
            <div className="dsa-theory-banner">
              <div className="dsa-ai-badge">
                <IconTheory /> Topic Theory Guide
              </div>
              <h3 className="dsa-theory-title">{theoryData.title} — Comprehensive Concept Guide</h3>
              <div className="dsa-text-content" style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                {renderFormattedMarkdown(theoryData.summary)}
              </div>
            </div>

            {/* Visual Diagram Representation */}
            <DSADiagram topicId={topicId} />

            {/* Data Structure Basics & Fundamentals (Access, Insertion, Deletion, Traversal) */}
            {theoryData.basics && theoryData.basics.length > 0 && (
              <div className="dsa-theory-section">
                <h4 className="dsa-theory-section-title">
                  <IconLayers /> Data Structure Fundamentals & Core Operations
                </h4>
                <div className="dsa-basics-list">
                  {theoryData.basics.map((b, bIdx) => (
                    <div key={bIdx} className="dsa-basic-item">
                      <span className="dsa-basic-head">{b.op}</span>
                      <div className="dsa-text-content" style={{ marginTop: '3px' }}>
                        {renderFormattedMarkdown(b.detail)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Elaborate Patterns & Mechanics */}
            <div className="dsa-theory-section">
              <h4 className="dsa-theory-section-title">
                <IconApproach /> Core Patterns, Step-by-Step Approaches & Trade-offs
              </h4>

              <div className="dsa-patterns-list">
                {theoryData.patterns.map((pat, pIdx) => (
                  <div key={pIdx} className="dsa-pattern-article">
                    <h5 className="dsa-pattern-title">{pat.name}</h5>
                    
                    <div className="dsa-pattern-subblock">
                      <span className="dsa-pattern-subhead">
                        <IconLightbulb /> Explanation & Core Mechanics:
                      </span>
                      <p className="dsa-pattern-text">{pat.explanation}</p>
                    </div>

                    <div className="dsa-pattern-subblock">
                      <span className="dsa-pattern-subhead">
                        <IconGear /> Full Algorithmic Approach & Step-by-Step Execution:
                      </span>
                      <div className="dsa-text-content" style={{ marginTop: '4px' }}>
                        {renderFormattedMarkdown(pat.approach)}
                      </div>
                    </div>

                    <div className="dsa-pattern-complexity-row">
                      <span className="dsa-comp-pill">
                        <IconClock /> <strong>Time Complexity:</strong> {pat.timeComplexity}
                      </span>
                      <span className="dsa-comp-pill">
                        <IconDatabase /> <strong>Space Complexity:</strong> {pat.spaceComplexity}
                      </span>
                    </div>

                    <div className="dsa-pattern-apply-grid">
                      <div className="dsa-apply-box apply-yes">
                        <span className="dsa-apply-head">
                          <IconCheckCircle /> When to Apply:
                        </span>
                        <p className="dsa-apply-text">{pat.whenToApply}</p>
                      </div>
                      <div className="dsa-apply-box apply-no">
                        <span className="dsa-apply-head">
                          <IconXCircle /> When NOT to Apply (Pitfalls & Counter-scenarios):
                        </span>
                        <p className="dsa-apply-text">{pat.whenNotToApply}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Operations Cheat Sheet */}
            <div className="dsa-theory-section">
              <h4 className="dsa-theory-section-title">
                <IconClock /> Operation Complexity Cheat Sheet
              </h4>
              <div className="dsa-complexity-table-wrap">
                <table className="dsa-complexity-table">
                  <thead>
                    <tr>
                      <th>Operation / Sub-type</th>
                      <th>Time Complexity</th>
                      <th>Space Complexity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theoryData.complexities.map((row, cIdx) => (
                      <tr key={cIdx}>
                        <td>{row.operation}</td>
                        <td><code className="dsa-code-tag">{row.time}</code></td>
                        <td><code className="dsa-code-tag">{row.space}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Master Strategy */}
            <div className="dsa-theory-section">
              <h4 className="dsa-theory-section-title">
                <IconAI /> Master Problem-Solving Strategy
              </h4>
              <div className="dsa-strategy-box">
                {renderFormattedMarkdown(theoryData.strategy)}
              </div>
            </div>

            <div className="dsa-theory-footer-action">
              <button className="dsa-btn-action solid" onClick={() => setViewTab('problems')}>
                Start Solving {totalProblems} Problems in {topic?.title} →
              </button>
            </div>
          </div>
        ) : (
          /* --- PROBLEMS & SOLUTIONS CODE STREAM TAB --- */
          <>
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
                    <div className="dsa-text-content">
                      {renderFormattedMarkdown(prob.question_text)}
                    </div>
                  </div>

                  {/* Intuition & Approach Breakdown */}
                  <div className="dsa-card-section">
                    <div className="dsa-section-label">
                      <IconApproach /> AI Intuition & Step-by-Step Approach
                    </div>
                    <div className="dsa-text-content">
                      {renderFormattedMarkdown(prob.approach_text)}
                    </div>
                  </div>

                  {/* Syntax Highlighted Code Snippet Block */}
                  <div className="dsa-card-section">
                    <div className="dsa-code-header">
                      <span className="dsa-section-label">
                        Solution ({language === 'cpp' ? 'C++' : 'Java'})
                      </span>
                      <button
                        className="dsa-btn-action ghost sm"
                        onClick={() => copyCode(prob.problem_id, activeCode)}
                      >
                        {copiedId === prob.problem_id ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                      </button>
                    </div>
                    <SyntaxCodeBlock code={activeCode} />
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
                                  <div style={{ marginTop: '3px' }}>
                                    {renderFormattedMarkdown(d.ai_response)}
                                  </div>
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
          </>
        )}
      </div>
    </div>
  )
}
