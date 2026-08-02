import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const COMPANIES_FALLBACK = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix', 'Apple']
const TOPICS_FALLBACK = ['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Graph', 'Tree', 'Binary Search']

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  let lang = (language || 'text').toLowerCase()
  if (lang === 'py') lang = 'python'
  if (lang === 'c++') lang = 'cpp'
  if (lang === 'js') lang = 'javascript'

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0d0d0f',
          fontSize: '0.84rem',
          padding: '0.75rem 1rem'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

const TOUR_DEMO_RESPONSES = {
  demo_filter: `### Top Google Questions on Array (All Time)

Here are top LeetCode questions for **Google** under **Array**:

1. **Two Sum (LeetCode #1)** — *Array, Hash Table*
2. **Median of Two Sorted Arrays (LeetCode #4)** — *Array, Binary Search, Divide and Conquer*
3. **Trapping Rain Water (LeetCode #42)** — *Array, Two Pointers, Dynamic Programming*
4. **Best Time to Buy and Sell Stock (LeetCode #121)** — *Array, Dynamic Programming*
5. **Container With Most Water (LeetCode #11)** — *Array, Two Pointers, Greedy*`,

  demo_prompt1: `### Top 10 Dynamic Programming Questions for Microsoft

Here are the most frequently asked Dynamic Programming questions in Microsoft technical interviews:

1. **Climbing Stairs (LeetCode #70)** — *1D DP / Fibonacci Pattern*
2. **Coin Change (LeetCode #322)** — *Unbounded Knapsack Pattern*
3. **Longest Common Subsequence (LeetCode #1143)** — *String DP Grid*
4. **House Robber (LeetCode #198)** — *Non-Adjacent Max Sum*
5. **Edit Distance (LeetCode #72)** — *String Transformation Matrix*
6. **Unique Paths (LeetCode #62)** — *2D Grid Traversal*
7. **Longest Increasing Subsequence (LeetCode #300)** — *Subsequence Optimization*
8. **Word Break (LeetCode #139)** — *Partition DP*
9. **Partition Equal Subset Sum (LeetCode #416)** — *0/1 Knapsack Pattern*
10. **Maximum Subarray (LeetCode #53)** — *Kadane's DP Algorithm*`,

  demo_prompt2: `### 1. Climbing Stairs (LeetCode #70) — Java Solution & Walkthrough

#### Intuition & Approach
To reach step \`n\`, you can take a single step from \`n - 1\` or a double step from \`n - 2\`. Thus, total ways is \`dp[n] = dp[n - 1] + dp[n - 2]\`.

\`\`\`java
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        
        int prev2 = 1; // dp[i-2]
        int prev1 = 2; // dp[i-1]
        
        for (int i = 3; i <= n; i++) {
            int current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        
        return prev1;
    }
}
\`\`\`

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ single loop pass.
- **Space Complexity:** $O(1)$ constant memory.`
}

export default function ChatArea({ 
  messages, 
  onNewMessage, 
  onDemoMessage,
  onRegenerate, 
  metadata, 
  isLoading,
  sidebarCollapsed,
  onToggleSidebar,
  onToggleRefDrawer,
  onOpenDashboard,
  referenceCount = 0,
  tourActionKey = null
}) {
  const [input, setInput] = useState('')
  const [company, setCompany] = useState('All Companies')
  const [topic, setTopic] = useState('All Topics')
  const [recency, setRecency] = useState('All Time')
  const [easyOn, setEasyOn] = useState(true)
  const [mediumOn, setMediumOn] = useState(true)
  const [hardOn, setHardOn] = useState(true)
  const chatMessagesRef = useRef(null)
  const textareaRef = useRef(null)
  const executedTourActionsRef = useRef({})

  const companies = metadata?.companies || COMPANIES_FALLBACK
  const topics = metadata?.topics || TOPICS_FALLBACK

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  // Tour Automated Typing & Instant Demo Response Handler (Zero LLM API Calls)
  useEffect(() => {
    if (!tourActionKey) return

    if (tourActionKey === 'demo_filter' && !executedTourActionsRef.current['demo_filter']) {
      executedTourActionsRef.current['demo_filter'] = true
      setCompany('Google')
      setTopic('Array')
      setRecency('All Time')
      const userDisplay = "Search: Google | Array | Difficulty: Easy, Medium, Hard | Recency: All Time"
      if (onDemoMessage) {
        onDemoMessage(userDisplay, TOUR_DEMO_RESPONSES.demo_filter)
      }
    }

    if (tourActionKey === 'demo_prompt1' && !executedTourActionsRef.current['demo_prompt1']) {
      executedTourActionsRef.current['demo_prompt1'] = true
      const targetText = "give me top 10 questions on dynamic programming for microsoft"
      let idx = 0
      setInput('')
      const interval = setInterval(() => {
        if (idx < targetText.length) {
          setInput(targetText.slice(0, idx + 1))
          idx++
        } else {
          clearInterval(interval)
          setTimeout(() => {
            setInput('')
            if (onDemoMessage) {
              onDemoMessage(targetText, TOUR_DEMO_RESPONSES.demo_prompt1)
            }
          }, 250)
        }
      }, 20)
    }

    if (tourActionKey === 'demo_prompt2' && !executedTourActionsRef.current['demo_prompt2']) {
      executedTourActionsRef.current['demo_prompt2'] = true
      const targetText = "explain the first topic with code in java"
      let idx = 0
      setInput('')
      const interval = setInterval(() => {
        if (idx < targetText.length) {
          setInput(targetText.slice(0, idx + 1))
          idx++
        } else {
          clearInterval(interval)
          setTimeout(() => {
            setInput('')
            if (onDemoMessage) {
              onDemoMessage(targetText, TOUR_DEMO_RESPONSES.demo_prompt2)
            }
          }, 250)
        }
      }, 20)
    }
  }, [tourActionKey, onDemoMessage])

  function handleEditPrompt(queryText) {
    setInput(queryText)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight || 100, 150) + 'px'
      textareaRef.current.focus()
      textareaRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function autoResize(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function handleSend(e) {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return
    const query = input.trim()
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    await onNewMessage(query)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    const diffs = [easyOn && 'Easy', mediumOn && 'Medium', hardOn && 'Hard'].filter(Boolean)
    if (!diffs.length) return

    const recencyMap = {
      'Last 30 Days': 'in the last 30 days',
      'Last 3 Months': 'recently',
      'Last 6 Months': 'in the last 6 months',
      'All Time': ''
    }

    const companyPart = company !== 'All Companies' ? ` for ${company}` : ''
    const topicPart = topic !== 'All Topics' ? ` ${topic}` : 'coding'
    const recencyPart = recency !== 'All Time' ? ` asked ${recencyMap[recency]}` : ''
    let query = `give top questions${companyPart} on ${topicPart}${recencyPart}`

    const filterParts = []
    if (company !== 'All Companies') filterParts.push(`at ${company}`)
    if (diffs.length) filterParts.push(`rated ${diffs.join(', ')}`)
    if (topic !== 'All Topics') filterParts.push(`about ${topic}`)
    if (filterParts.length) query += ` (focusing strictly ${filterParts.join(' and ')})`

    const userDisplay = `Search: ${company !== 'All Companies' ? company : 'Any Company'} | ${topic !== 'All Topics' ? topic : 'Any Topic'} | Difficulty: ${diffs.join(', ')} | Recency: ${recency}`
    await onNewMessage(query, userDisplay)
  }

  return (
    <div className="chat-column" id="tour-chat-area">

      {/* Filter Panel — FIXED AT TOP, compact single row */}
      <form className="filter-panel-top" id="tour-filters" onSubmit={handleSearch}>
        <div className="filter-top-row">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? "☰" : "✕"}
          </button>
          {/* Selects */}
          <select className="filter-select-sm" value={company} onChange={e => setCompany(e.target.value)} title="Target Company">
            <option>All Companies</option>
            {companies.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select-sm" value={topic} onChange={e => setTopic(e.target.value)} title="DSA Topic">
            <option>All Topics</option>
            {topics.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="filter-select-sm" value={recency} onChange={e => setRecency(e.target.value)} title="Recency">
            {['All Time', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months'].map(r => <option key={r}>{r}</option>)}
          </select>

          {/* Difficulty checkboxes */}
          <div className="filter-sep" />
          {[['Easy', easyOn, setEasyOn], ['Medium', mediumOn, setMediumOn], ['Hard', hardOn, setHardOn]].map(([label, val, setter]) => (
            <label key={label} className="filter-check-sm">
              <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} />
              <span>{label}</span>
            </label>
          ))}

          {/* Search button */}
          <button
            type="submit"
            className="filter-search-btn"
            disabled={isLoading}
          >
            {isLoading ? '…' : 'Search'}
          </button>

          {/* Dashboard Button */}
          <button
            type="button"
            className="dash-top-btn"
            id="tour-dashboard-btn"
            onClick={onOpenDashboard}
            title="Open LeetCode Analytics Dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>
            Dashboard
          </button>

          {/* Solutions Drawer Toggle on Right */}
          <button
            type="button"
            className="ref-drawer-toggle-btn"
            onClick={onToggleRefDrawer}
            title="View Retrieved Problems & Video Tutorials"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            {referenceCount > 0 ? `Solutions (${referenceCount})` : 'Solutions'}
          </button>
        </div>
      </form>

      {/* Scrollable messages */}
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.length === 0 && !isLoading && (
          <div style={{ color: '#444', fontSize: '0.83rem', marginTop: '3rem', textAlign: 'center' }}>
            Use the filter above or type a question to get started.
          </div>
        )}
        {messages.map((msg, i) => {
          const isLastAssistant = (msg.role === 'assistant' && i === messages.length - 1)
          return (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className="chat-msg-header">
                <span className="chat-msg-role">{msg.role === 'user' ? 'You' : 'Crack My DSA'}</span>
                {msg.role === 'user' && !isLoading && (
                  <button
                    className="chat-edit-btn"
                    onClick={() => handleEditPrompt(msg.content)}
                    title="Edit Query Before Resending"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8e8ea0',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginLeft: '8px'
                    }}
                  >
                    ✏️ Edit Query
                  </button>
                )}
                {isLastAssistant && !isLoading && (
                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="chat-edit-btn"
                      onClick={() => {
                        const userMsgs = messages.filter(m => m.role === 'user')
                        if (userMsgs.length > 0) {
                          handleEditPrompt(userMsgs[userMsgs.length - 1].content)
                        }
                      }}
                      title="Edit Last Prompt Before Resending"
                      style={{
                        background: '#202123',
                        border: '1px solid #444654',
                        color: '#d1d5db',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✏️ Edit Query
                    </button>
                    <button className="chat-resend-btn" onClick={onRegenerate} title="Resend Prompt">
                      ↻ Resend Prompt
                    </button>
                  </div>
                )}
              </div>
              <div className="chat-msg-content">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeText = String(children).replace(/\n$/, '')
                        if (!inline && (match || codeText.includes('\n'))) {
                          return <CodeBlock code={codeText} language={match ? match[1] : ''} />
                        }
                        return <code className={className} {...props}>{children}</code>
                      }
                    }}
                  >
                    {msg.content.replace(/<br\s*\/?>/gi, '\n\n')}
                  </ReactMarkdown>
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                )}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="chat-msg assistant">
            <div className="chat-msg-role">Crack My DSA</div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Chat input — pinned at bottom */}
      <div className="chat-input-wrap" id="tour-chat-input">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Ask a question…"
          value={input}
          onChange={e => { setInput(e.target.value); autoResize(e) }}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          title="Send"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
