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
          {copied ? '✓ Copied' : 'Copy'}
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

export default function ChatArea({ messages, onNewMessage, onRegenerate, metadata, isLoading }) {
  const [input, setInput] = useState('')
  const [company, setCompany] = useState('All Companies')
  const [topic, setTopic] = useState('All Topics')
  const [recency, setRecency] = useState('All Time')
  const [easyOn, setEasyOn] = useState(true)
  const [mediumOn, setMediumOn] = useState(true)
  const [hardOn, setHardOn] = useState(true)
  const chatMessagesRef = useRef(null)
  const textareaRef = useRef(null)

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

  function autoResize(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function handleSend(e) {
    e.preventDefault()
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
    <div className="chat-column">

      {/* Filter Panel — FIXED AT TOP, compact single row */}
      <form className="filter-panel-top" onSubmit={handleSearch}>
        <div className="filter-top-row">
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
                {isLastAssistant && !isLoading && (
                  <button className="chat-resend-btn" onClick={onRegenerate} title="Resend / Regenerate Response">
                    ↻ Resend Prompt
                  </button>
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
      <div className="chat-input-wrap">
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
