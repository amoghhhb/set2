"use client"

import { useState, useRef, useEffect } from "react"
import "./EmojiRiddle2.css"

export default function EmojiRiddle2({ onNext, timer, TimerDisplay }) {
  const [answer, setAnswer] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultColor, setResultColor] = useState("#fff")
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showResultIndicator, setShowResultIndicator] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false) // State for hamburger menu

  const submitBtnRef = useRef(null)

  useEffect(() => {
    let timerId = null
    if (isBlocked && blockTimeLeft > 0) {
      timerId = setTimeout(() => setBlockTimeLeft((prev) => prev - 1), 1000)
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false)
      setResultMsg("⏱️ You can try again now.")
      setResultColor("#fff")
      setShowResultIndicator(true) // Show indicator
    }
    return () => clearTimeout(timerId)
  }, [isBlocked, blockTimeLeft])

  useEffect(() => {
    let timeoutId
    if (resultMsg) {
      setShowResultIndicator(true)
      if (!isBlocked && !isCorrect) {
        timeoutId = setTimeout(() => {
          setShowResultIndicator(false)
          setResultMsg("") // Clear message
          setResultColor("#fff") // Reset color
        }, 3000) // Message disappears after 3 seconds
      }
    } else {
      setShowResultIndicator(false)
    }
    return () => clearTimeout(timeoutId)
  }, [resultMsg, isBlocked, isCorrect])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const updateResult = () => {
    if (isBlocked || timer === 0) return

    setShowResultIndicator(false) // Hide previous message before showing new one
    setResultMsg("") // Clear message immediately

    if (answer.trim().toLowerCase() === "phishing") {
      setResultMsg("✅ Correct! Well done!")
      setResultColor("#00ff00")
      setIsNextDisabled(false)
      setWrongAttempts(0)
      setIsCorrect(true)
    } else {
      const newAttempts = wrongAttempts + 1
      setWrongAttempts(newAttempts)
      setResultMsg(`❌ Incorrect. Attempts left: ${3 - newAttempts}`)
      setResultColor("#ff3333")
      setIsNextDisabled(true)

      if (newAttempts >= 3) {
        const blockDuration = 10 + 5 * (newAttempts - 3)
        setIsBlocked(true)
        setBlockTimeLeft(blockDuration)
        setResultMsg(`⏳ Too many wrong attempts. Try again in ${blockDuration} second${blockDuration > 1 ? "s" : ""}.`)
        setResultColor("#ff0000ff")
      }
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      updateResult()
    }
  }

  return (
    <div className="symbol-chamber">
      <div className="clock-display">{TimerDisplay}</div>

      {/* Hamburger Menu Toggle */}
      <div className={`nav-toggle ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <div className="toggle-bar"></div>
        <div className="toggle-bar"></div>
        <div className="toggle-bar"></div>
      </div>

      {/* Information Panel */}
      <div className={`info-panel ${isMenuOpen ? "show" : ""}`}>
        <h3 className="panel-header">Riddle Hint</h3>
        <div className="info-item">
          <strong>Tip:</strong> The number of letters is your answer.
        </div>
      </div>

      <div className={`chamber-content ${showResultIndicator || timer === 0 ? "expanded" : ""}`}>
        <header className="riddle-header">
          <h1 className="chamber-title">Emoji Riddle Puzzle</h1>
          <div className="riddle-badge">
            <span className="riddle-icon" role="img" aria-label="puzzle">
              🧩
            </span>
            <span className="riddle-label">Level 2</span>
          </div>
        </header>

        <section className="symbol-problem">
          <div className="symbol-workspace">
            <h2 className="symbol-heading">
              <span className="symbol-emoji" role="img" aria-label="lightbulb">
                💡
              </span>
              <span>Decode the Emoji Sequence</span>
            </h2>
            <div className="symbol-showcase">
              <div className="emoji-formula" aria-label="Emoji sequence: fish, fishing pole">
                🐟 + 🎣
              </div>
            </div>
          </div>
        </section>

        <section className="word-section">
          <div className="word-inputs single-input">
            <div className="word-group">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKey}
                disabled={isBlocked || timer === 0 || isCorrect}
                className="word-field"
                placeholder={isBlocked ? `Blocked (${blockTimeLeft}s)` : "Enter your answer"}
                aria-label="Answer input"
                maxLength={8} // "phishing" is 8 letters
              />
              <div className="word-counter">
                {answer.trim().length} letters
              </div>
            </div>
          </div>

          <div className="word-form">
            <button
              ref={submitBtnRef}
              onClick={updateResult}
              disabled={isBlocked || answer.trim() === "" || timer === 0 || isCorrect}
              className="word-submit"
              type="button"
            >
              {isBlocked ? `Wait ${blockTimeLeft}s` : isCorrect ? "Submitted" : "Submit Answer"}
            </button>

            <button
              className={`advance-button ${isNextDisabled || timer === 0 ? "disabled" : ""}`}
              onClick={onNext}
              disabled={isNextDisabled || timer === 0}
              aria-describedby="next-help"
            >
              <span className="advance-text">Go to Next Clue</span>
              <span className="advance-arrow" aria-hidden="true">
                ➡️
              </span>
            </button>
            <div id="next-help" className="sr-only">
              Available only after answering correctly and within time limit
            </div>
          </div>
        </section>

        <section className="result-section" aria-live="polite" aria-atomic="true">
          {showResultIndicator && resultMsg && (
            <div
              className={`status-indicator ${resultColor === "#00ff00" ? "success-indicator" : resultColor === "#ff3333" || resultColor === "#ff0000ff" ? "error-indicator" : ""} active`}
              role="alert"
            >
              <span className="result-text">{resultMsg}</span>
            </div>
          )}

          {timer === 0 && (
            <div className="status-indicator error-indicator active" role="alert">
              <span className="timeout-icon" aria-hidden="true">
                ⏰
              </span>
              <span className="timeout-text">{"Time's up!"}</span>
            </div>
          )}
        </section>

        <section className="tries-section">
          <div className="tries-tracker">
            <span className="tries-label">Attempts:</span>
            <div className="tries-dots" role="img" aria-label={`${wrongAttempts} out of 3 attempts used`}>
              {[1, 2, 3].map((attempt) => (
                <div
                  key={attempt}
                  className={`tries-dot ${wrongAttempts >= attempt ? "used" : ""}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}