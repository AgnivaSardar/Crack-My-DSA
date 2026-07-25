import { useState, useEffect, useCallback } from 'react'

const TOUR_STEPS = [
  {
    targetId: 'tour-sidebar',
    title: 'Sidebar & Chat History',
    text: 'Manage all your past company DSA prep conversations here. Start new chats or switch between sessions anytime.',
    position: 'right'
  },
  {
    targetId: 'tour-filters',
    title: 'Company & Topic Filters',
    text: 'Filter LeetCode questions by Company (Google, Meta, Amazon, etc.), Topic (DP, Graphs, Trees), Recency, and Difficulty.',
    position: 'bottom'
  },
  {
    targetId: 'tour-references',
    title: 'Todo & Already Done Questions',
    text: 'Retrieved LeetCode problems are split into two tables: Unsolved Todo questions at top, and Already Done questions beneath!',
    position: 'bottom-right'
  },
  {
    targetId: 'tour-dashboard-btn',
    title: 'LeetCode Analytics Dashboard',
    text: 'Click here anytime to view your personal LeetCode dashboard, total solved metrics, Easy/Medium/Hard breakdown, and target company progress.',
    position: 'bottom'
  }
]

export default function OnboardingTourModal({ isOpen, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [coords, setCoords] = useState(null)
  const [spotlightStyle, setSpotlightStyle] = useState(null)

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
      }

      // Constrain within viewport boundaries
      if (left + 320 > window.innerWidth) left = window.innerWidth - 340
      if (left < 10) left = 10
      if (top + 200 > window.innerHeight) top = window.innerHeight - 220

      setCoords({ top, left })
    } else {
      // Fallback position if element is collapsed/not visible yet
      setSpotlightStyle(null)
      setCoords({ top: 120, left: Math.max(20, window.innerWidth / 2 - 160) })
    }
  }, [isOpen, currentStepIndex])

  useEffect(() => {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [updatePosition])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStepIndex]
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1

  function handleNext() {
    if (isLastStep) {
      onClose()
      setCurrentStepIndex(0)
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  function handleBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
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
          <button className="tour-close-btn" onClick={onClose} title="Skip Tour">✕</button>
        </div>

        <h4 className="tour-title">{step.title}</h4>
        <p className="tour-text">{step.text}</p>

        <div className="tour-actions">
          <button className="tour-skip-btn" onClick={onClose}>
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {currentStepIndex > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleBack}>
                Back
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {isLastStep ? 'Finish Tour ✓' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
