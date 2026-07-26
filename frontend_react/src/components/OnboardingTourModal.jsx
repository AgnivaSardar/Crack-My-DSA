import { useState, useEffect, useCallback } from 'react'

const TOUR_STEPS = [
  {
    targetId: 'tour-sidebar-tab-chats',
    title: '1. Past Chats & Saved Conversations',
    text: 'Manage all your past company DSA prep conversations here. Start new chats or switch between saved sessions anytime.',
    position: 'right',
    actionKey: 'past_chats'
  },
  {
    targetId: 'tour-chat-area',
    title: '2. Target Company & Topic Filters',
    text: 'Watch filters in action! Selecting Google, Array, and All Time automatically searches top matching LeetCode questions.',
    position: 'chat-area',
    actionKey: 'demo_filter'
  },
  {
    targetId: 'tour-chat-area',
    title: '3. AI Assistant Query Demo',
    text: 'Watch how asking questions works! Typing custom prompts like "give me top 10 questions on dynamic programming for microsoft" generates tailored AI responses.',
    position: 'chat-area',
    actionKey: 'demo_prompt1'
  },
  {
    targetId: 'tour-chat-area',
    title: '4. Follow-up Explanation with Code',
    text: 'Ask follow-up prompts like "explain the first topic with code in java" to get step-by-step explanations and code implementations.',
    position: 'chat-area',
    actionKey: 'demo_prompt2'
  },
  {
    targetId: 'tour-sidebar-tab-dsa',
    title: '5. 16 Core DSA Roadmap Topics',
    text: 'Click the DSA Roadmap tab to access 16 comprehensive topics from Strivers A2Z DSA Sheet. Select any topic to open its guide and problem sheet.',
    position: 'right',
    actionKey: 'dsa_roadmap'
  },
  {
    targetId: 'tour-dsa-theory',
    title: '6. Topic Theory & YouTube Tutorials',
    text: 'Study foundational theory, time and space complexity benchmarks, visual diagrams, and top YouTube video recommendations.',
    position: 'bottom',
    actionKey: 'dsa_theory'
  },
  {
    targetId: 'tour-dsa-problems',
    title: '7. Core Problems & Solutions Stream',
    text: 'Master core problems with AI intuition, step-by-step approach, complexity, C++/Java solution code, private AI doubt asking, and solved checkmarks.',
    position: 'bottom',
    actionKey: 'dsa_problems'
  },
  {
    targetId: 'tour-references',
    title: '8. Reference Problems & Solved Tracking',
    text: 'Retrieved LeetCode problems are split into two tables: Unsolved Todo questions at top, and Already Done questions beneath.',
    position: 'bottom-right',
    actionKey: 'references'
  },
  {
    targetId: 'tour-dashboard-header',
    title: '9. LeetCode Analytics Dashboard',
    text: 'Sync your LeetCode profile, track total solved metrics, Easy/Medium/Hard breakdown, and company progress.',
    position: 'top-modal',
    actionKey: 'dashboard'
  }
]

export default function OnboardingTourModal({ isOpen, onClose, onStepChange, isLoading = false }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [coords, setCoords] = useState(null)
  const [spotlightStyle, setSpotlightStyle] = useState(null)

  // Reset to step 0 when tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0)
      if (onStepChange) onStepChange(TOUR_STEPS[0].actionKey, 0)
    }
  }, [isOpen])

  // Trigger action on step change
  const handleStepIndexChange = useCallback((newIndex) => {
    setCurrentStepIndex(newIndex)
    if (onStepChange && TOUR_STEPS[newIndex]) {
      onStepChange(TOUR_STEPS[newIndex].actionKey, newIndex)
    }
  }, [onStepChange])

  const updatePosition = useCallback(() => {
    if (!isOpen) return
    const step = TOUR_STEPS[currentStepIndex]
    const el = document.getElementById(step.targetId)

    if (el) {
      const rect = el.getBoundingClientRect()
      // Highlight glow ring box
      setSpotlightStyle({
        top: Math.max(0, rect.top - 6),
        left: Math.max(0, rect.left - 6),
        width: rect.width + 12,
        height: rect.height + 12
      })

      // Non-centered popover coordinates (beside the feature)
      let top = rect.bottom + 14
      let left = rect.left

      if (step.position === 'right') {
        top = Math.max(20, rect.top + 20)
        left = Math.min(window.innerWidth - 340, rect.right + 16)
      } else if (step.position === 'bottom-right') {
        top = rect.bottom + 14
        left = Math.max(20, rect.right - 320)
      } else if (step.position === 'bottom') {
        top = rect.bottom + 14
        left = Math.min(window.innerWidth - 340, Math.max(20, rect.left))
      } else if (step.position === 'top') {
        top = Math.max(20, rect.top - 230)
        left = Math.min(window.innerWidth - 340, Math.max(20, rect.left))
      } else if (step.position === 'chat-area') {
        top = Math.max(80, Math.min(window.innerHeight - 240, rect.top + 80))
        left = Math.max(10, rect.left - 335)
      } else if (step.position === 'top-modal') {
        top = Math.max(30, rect.bottom + 12)
        left = Math.max(30, rect.left + 16)
      }

      // Constrain within viewport boundaries
      if (left + 340 > window.innerWidth) left = window.innerWidth - 350
      if (left < 10) left = 10
      if (top + 220 > window.innerHeight) top = window.innerHeight - 230

      setCoords({ top, left })
    } else {
      // Fallback position if element is collapsed/not visible yet
      setSpotlightStyle(null)
      setCoords({ top: 120, left: Math.max(20, window.innerWidth / 2 - 160) })
    }
  }, [isOpen, currentStepIndex])

  useEffect(() => {
    // Delay position update slightly so layout finishes rendering tab changes
    const timer = setTimeout(updatePosition, 150)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [updatePosition])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStepIndex]
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1

  function handleNext() {
    if (isLoading) return
    if (isLastStep) {
      onClose()
    } else {
      handleStepIndexChange(currentStepIndex + 1)
    }
  }

  function handleBack() {
    if (currentStepIndex > 0) {
      handleStepIndexChange(currentStepIndex - 1)
    }
  }

  return (
    <div className="tour-backdrop">
      {/* Target element spotlight glow ring */}
      {spotlightStyle && (
        <div
          className="tour-spotlight-ring"
          style={{
            top: `${spotlightStyle.top}px`,
            left: `${spotlightStyle.left}px`,
            width: `${spotlightStyle.width}px`,
            height: `${spotlightStyle.height}px`
          }}
        />
      )}

      {/* Non-centered Popover Modal placed directly BESIDE the target feature */}
      <div
        className="tour-popover"
        style={{
          top: coords ? `${coords.top}px` : '100px',
          left: coords ? `${coords.left}px` : '50px'
        }}
      >
        <div className="tour-popover-header">
          <span className="tour-step-badge">Step {currentStepIndex + 1} of {TOUR_STEPS.length}</span>
          <button className="tour-close-btn" onClick={onClose} title="Skip Tour">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <h4 className="tour-title">{step.title}</h4>
        <p className="tour-text">{step.text}</p>

        <div className="tour-actions">
          <button className="tour-skip-btn" onClick={onClose}>
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {currentStepIndex > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleBack} disabled={isLoading}>
                Back
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNext} disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  <span>Waiting...</span>
                </>
              ) : isLastStep ? (
                'Finish'
              ) : (
                <>
                  <span>Continue</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

