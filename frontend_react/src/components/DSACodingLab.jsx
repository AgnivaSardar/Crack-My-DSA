import React, { useState, useEffect } from 'react'
import { runDSACode, submitDSACode } from '../api/client'

// Monochrome SVG Icons for Lab
const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const IconSubmit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconTerminal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)

const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconReset = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// Blank Starter Code Templates for Practice Playground
const PRACTICE_BLANK_TEMPLATES = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,

  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,

  c: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,

  python: `# Write your code here
`
}

export default function DSACodingLab({
  topic,
  problems = [],
  userEmail,
  guestUser,
  onToggleProblemProgress,
  onToast
}) {
  const [selectedProblemId, setSelectedProblemId] = useState('practice')
  const [labLanguage, setLabLanguage] = useState('cpp')
  const [code, setCode] = useState('')
  const [stdinInput, setStdinInput] = useState('')
  const [terminalTab, setTerminalTab] = useState('testcases') // 'stdin', 'stdout', 'testcases'

  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [executionResult, setExecutionResult] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // Current problem object (if selected from list)
  const currentProblem = problems.find(p => String(p.problem_id) === String(selectedProblemId)) || null

  // Load code from LocalStorage or Template on problem/language change
  useEffect(() => {
    const storageKey = `dsa_lab_code_${selectedProblemId}_${labLanguage}`
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      setCode(saved)
    } else if (currentProblem && selectedProblemId !== 'practice') {
      const defaultCode = labLanguage === 'java'
        ? (currentProblem.java_code || PRACTICE_BLANK_TEMPLATES.java)
        : (currentProblem.cpp_code || PRACTICE_BLANK_TEMPLATES[labLanguage] || PRACTICE_BLANK_TEMPLATES.cpp)
      setCode(defaultCode)
    } else {
      // Clean blank template for Practice Playground
      setCode(PRACTICE_BLANK_TEMPLATES[labLanguage] || '')
    }

    setExecutionResult(null)
    setSubmissionResult(null)
  }, [selectedProblemId, labLanguage, currentProblem])


  // Save code to LocalStorage on change
  function handleCodeChange(newCode) {
    setCode(newCode)
    const storageKey = `dsa_lab_code_${selectedProblemId}_${labLanguage}`
    localStorage.setItem(storageKey, newCode)
  }

  // Handle Tab Indentation in Code Editor
  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newCode = code.substring(0, start) + '    ' + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4
      }, 0)
    }
  }

  async function handleRunCode() {
    setIsRunning(true)
    setTerminalTab('stdout')
    setSubmissionResult(null)

    try {
      const pTitle = currentProblem ? currentProblem.title : (topic?.title || 'Practice IDE')
      const pId = currentProblem ? currentProblem.problem_id : 'practice'
      const res = await runDSACode(labLanguage, code, stdinInput, pId, pTitle)

      if (res) {
        setExecutionResult(res)
        if (onToast) onToast(`Execution ${res.status || 'Finished'}`)
      } else {
        if (onToast) onToast('Failed to execute code.')
      }
    } catch (err) {
      if (onToast) onToast('Code execution error.')
    } finally {
      setIsRunning(false)
    }
  }

  async function handleSubmitCode() {
    if (!currentProblem && selectedProblemId !== 'practice') return

    setIsSubmitting(true)
    setTerminalTab('testcases')
    setExecutionResult(null)

    try {
      const pTitle = currentProblem ? currentProblem.title : (topic?.title || 'Practice IDE')
      const pId = currentProblem ? currentProblem.problem_id : 'practice'
      const email = guestUser ? 'guest@local' : userEmail
      const res = await submitDSACode(labLanguage, code, pId, pTitle, email)

      if (res) {
        setSubmissionResult(res)
        if (res.status === 'Accepted') {
          if (currentProblem && onToggleProblemProgress) {
            onToggleProblemProgress(currentProblem.problem_id, true)
          }
          if (onToast) onToast('Accepted! All public and private test cases passed!')

        } else {
          if (onToast) onToast(`Submission Status: ${res.status}`)
        }
      }
    } catch (err) {
      if (onToast) onToast('Submission evaluation error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (onToast) onToast('Code copied to clipboard!')
  }

  function handleDownloadCode() {
    const extMap = { cpp: 'cpp', c: 'c', java: 'java', python: 'py' }
    const ext = extMap[labLanguage] || 'txt'
    const filename = currentProblem
      ? `${currentProblem.title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
      : `Solution.${ext}`

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    if (onToast) onToast(`Downloaded ${filename}`)
  }

  function handleResetTemplate() {
    const defaultCode = (currentProblem && selectedProblemId !== 'practice')
      ? (labLanguage === 'java' ? (currentProblem.java_code || PRACTICE_BLANK_TEMPLATES.java) : (currentProblem.cpp_code || PRACTICE_BLANK_TEMPLATES[labLanguage]))
      : (PRACTICE_BLANK_TEMPLATES[labLanguage] || '')
    setCode(defaultCode)
    const storageKey = `dsa_lab_code_${selectedProblemId}_${labLanguage}`
    localStorage.removeItem(storageKey)
    if (onToast) onToast('Reset code template!')
  }


  const lineCount = (code.match(/\n/g) || []).length + 1

  return (
    <div className="dsa-coding-lab-container">
      {/* Selector & Problem Header Bar */}
      <div className="dsa-lab-header">
        <div className="dsa-lab-select-group">
          <label className="dsa-lab-label">Target Problem:</label>
          <select
            className="dsa-lab-select"
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
          >
            <option value="practice">Practice Playground & Custom IDE</option>

            {problems.map((p, idx) => (
              <option key={p.problem_id || idx} value={p.problem_id}>
                #{idx + 1}. {p.title} {p.is_completed ? ' (Solved)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Language Switcher */}
        <div className="dsa-lab-lang-group">
          <span className="dsa-lab-label">Language:</span>
          <div className="dsa-lang-toggle-bar">
            <button
              className={`dsa-lang-btn ${labLanguage === 'cpp' ? 'active' : ''}`}
              onClick={() => setLabLanguage('cpp')}
            >
              C++
            </button>
            <button
              className={`dsa-lang-btn ${labLanguage === 'java' ? 'active' : ''}`}
              onClick={() => setLabLanguage('java')}
            >
              Java
            </button>
            <button
              className={`dsa-lang-btn ${labLanguage === 'c' ? 'active' : ''}`}
              onClick={() => setLabLanguage('c')}
            >
              C
            </button>
            <button
              className={`dsa-lang-btn ${labLanguage === 'python' ? 'active' : ''}`}
              onClick={() => setLabLanguage('python')}
            >
              Python
            </button>
          </div>
        </div>
      </div>

      {/* Selected Problem Overview Banner */}
      {currentProblem && (
        <div className="dsa-lab-problem-banner">
          <div className="dsa-lab-banner-head">
            <h4 className="dsa-lab-problem-title">{currentProblem.title}</h4>
            <span className="dsa-subfolder-tag">{currentProblem.subfolder || 'DSA Problem'}</span>
          </div>
          <div className="dsa-lab-problem-desc">
            {currentProblem.question_text || 'Solve this problem by writing code below and evaluating public & private test cases.'}
          </div>
        </div>
      )}

      {/* Main IDE Code Editor & Action Controls */}
      <div className="dsa-lab-ide-box">
        <div className="dsa-ide-toolbar">
          <div className="dsa-ide-toolbar-left">
            <span className="dsa-ide-file-tag">
              Solution.{labLanguage === 'python' ? 'py' : labLanguage}
            </span>
            <span className="dsa-ide-lines-tag">{lineCount} Lines</span>
          </div>

          <div className="dsa-ide-toolbar-right">
            <button className="dsa-btn-action ghost sm" onClick={handleResetTemplate} title="Reset Template">
              <IconReset /> Reset
            </button>
            <button className="dsa-btn-action ghost sm" onClick={handleCopyCode} title="Copy Code">
              {copied ? <IconCheck /> : <IconCopy />} {copied ? 'Copied' : 'Copy'}
            </button>
            <button className="dsa-btn-action ghost sm" onClick={handleDownloadCode} title="Download File">
              <IconDownload /> Download
            </button>
            <button
              className="dsa-btn-action ghost"
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
            >
              <IconPlay /> {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              className="dsa-btn-action solid"
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
            >
              <IconSubmit /> {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
            </button>
          </div>
        </div>

        {/* Code Editor Textarea with Line Numbers */}
        <div className="dsa-ide-editor-container">
          <div className="dsa-ide-line-numbers">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="dsa-line-num">{i + 1}</div>
            ))}
          </div>
          <textarea
            className="dsa-ide-code-textarea"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Write or paste your solution code here..."
            spellCheck="false"
          />
        </div>
      </div>

      {/* Interactive Terminal Output & Test Cases Runner Panel */}
      <div className="dsa-lab-terminal-box">
        <div className="dsa-terminal-header">
          <div className="dsa-terminal-tabs">
            <button
              className={`dsa-term-tab-btn ${terminalTab === 'stdin' ? 'active' : ''}`}
              onClick={() => setTerminalTab('stdin')}
            >
              Custom Input (stdin)
            </button>
            <button
              className={`dsa-term-tab-btn ${terminalTab === 'stdout' ? 'active' : ''}`}
              onClick={() => setTerminalTab('stdout')}
            >
              Terminal Output (stdout)
            </button>
            <button
              className={`dsa-term-tab-btn ${terminalTab === 'testcases' ? 'active' : ''}`}
              onClick={() => setTerminalTab('testcases')}
            >
              Test Cases Evaluation
            </button>
          </div>

          {/* Execution Metrics Badge */}
          {(executionResult || submissionResult) && (
            <div className="dsa-terminal-status-badge">
              {submissionResult ? (
                <span className={`dsa-status-pill ${submissionResult.status === 'Accepted' ? 'pass' : 'fail'}`}>
                  {submissionResult.status === 'Accepted' ? <IconCheck /> : <IconX />} {submissionResult.status} ({submissionResult.passed_count}/{submissionResult.total_count} Passed)
                </span>
              ) : (
                <span className={`dsa-status-pill ${executionResult?.status === 'Success' ? 'pass' : 'fail'}`}>
                  {executionResult?.status === 'Success' ? <IconCheck /> : <IconX />} {executionResult?.status}
                </span>
              )}
              <span className="dsa-term-metric"><IconClock /> {(submissionResult || executionResult)?.execution_time_ms || 0} ms</span>
            </div>
          )}
        </div>

        {/* Terminal Body */}
        <div className="dsa-terminal-body">
          {terminalTab === 'stdin' && (
            <div className="dsa-stdin-wrap">
              <span className="dsa-term-label">Enter Custom Test Input for Run Code:</span>
              <textarea
                className="dsa-stdin-textarea"
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                placeholder="Type your custom stdin input here..."
              />
            </div>
          )}

          {terminalTab === 'stdout' && (
            <div className="dsa-stdout-wrap">
              {executionResult ? (
                <>
                  {executionResult.stderr && (
                    <div className="dsa-term-error-box">
                      <span className="dsa-term-label error">Compilation / Execution Error:</span>
                      <pre className="dsa-term-pre">{executionResult.stderr}</pre>
                    </div>
                  )}
                  <span className="dsa-term-label">Standard Output (stdout):</span>
                  <pre className="dsa-term-pre">{executionResult.stdout || '(No output returned)'}</pre>
                </>
              ) : (
                <div className="dsa-term-empty-msg">
                  Click "Run Code" above to execute your solution against custom stdin input.
                </div>
              )}
            </div>
          )}

          {terminalTab === 'testcases' && (
            <div className="dsa-testcases-wrap">
              {submissionResult ? (
                <div className="dsa-submission-results">
                  <div className="dsa-results-summary-banner">
                    <h5 className="dsa-results-title">
                      {submissionResult.status === 'Accepted' ? 'All Test Cases Passed!' : `Submission Result: ${submissionResult.status}`}
                    </h5>
                    <span className="dsa-results-sub">
                      Evaluation score: {submissionResult.passed_count} of {submissionResult.total_count} test cases passed.
                    </span>
                  </div>

                  <div className="dsa-test-cards-grid">
                    {submissionResult.test_results?.map((tCase, tcIdx) => (
                      <div key={tcIdx} className={`dsa-test-card ${tCase.passed ? 'pass' : 'fail'}`}>
                        <div className="dsa-test-card-head">
                          <span className="dsa-test-tag">
                            {tCase.is_private ? '[Private] Test Case' : '[Public] Test Case'} #{tCase.id}
                          </span>
                          <span className={`dsa-pass-badge ${tCase.passed ? 'pass' : 'fail'}`}>
                            {tCase.passed ? <><IconCheck /> Passed</> : <><IconX /> Failed</>}
                          </span>
                        </div>
                        <p className="dsa-test-desc">{tCase.description}</p>
                        {!tCase.is_private && (
                          <div className="dsa-test-details">
                            <div className="dsa-test-field">
                              <span className="field-lbl">Input:</span>
                              <code>{tCase.input}</code>
                            </div>
                            <div className="dsa-test-field">
                              <span className="field-lbl">Expected Output:</span>
                              <code>{tCase.expected}</code>
                            </div>
                            <div className="dsa-test-field">
                              <span className="field-lbl">Your Output:</span>
                              <code className={tCase.passed ? 'ok' : 'err'}>{tCase.actual}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : executionResult && executionResult.public_test_results ? (
                <div className="dsa-submission-results">
                  <span className="dsa-term-label">Public Sample Test Cases Output:</span>
                  <div className="dsa-test-cards-grid" style={{ marginTop: '0.4rem' }}>
                    {executionResult.public_test_results.map((tCase, tcIdx) => (
                      <div key={tcIdx} className={`dsa-test-card ${tCase.passed ? 'pass' : 'fail'}`}>
                        <div className="dsa-test-card-head">
                          <span className="dsa-test-tag">[Public] Test Case #{tCase.id}</span>

                          <span className={`dsa-pass-badge ${tCase.passed ? 'pass' : 'fail'}`}>
                            {tCase.passed ? <><IconCheck /> Passed</> : <><IconX /> Failed</>}
                          </span>
                        </div>
                        <p className="dsa-test-desc">{tCase.description}</p>
                        <div className="dsa-test-details">
                          <div className="dsa-test-field">
                            <span className="field-lbl">Input:</span>
                            <code>{tCase.input}</code>
                          </div>
                          <div className="dsa-test-field">
                            <span className="field-lbl">Expected Output:</span>
                            <code>{tCase.expected}</code>
                          </div>
                          <div className="dsa-test-field">
                            <span className="field-lbl">Your Output:</span>
                            <code className={tCase.passed ? 'ok' : 'err'}>{tCase.actual}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="dsa-term-empty-msg">
                  Click "Submit Solution" to run your code against Public and Hidden Private Test Cases.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
