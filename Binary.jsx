"use client"

import { useState, useEffect } from "react"
import "./Binary.css"

function Binary({ onNext, timer, TimerDisplay }) {
  const [numberInput, setNumberInput] = useState("")
  const [result, setResult] = useState({ show: false, isCorrect: false })
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTime, setBlockTime] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showResultIndicator, setShowResultIndicator] = useState(false) // New state for showing indicator

  // Hardcoded correct answer for this puzzle
  const CORRECT_ANSWER = "5"
  const BINARY_PROBLEM = "0101"

  useEffect(() => {
    let timerId
    if (isBlocked && blockTime > 0) {
      timerId = setTimeout(() => setBlockTime(blockTime - 1), 1000)
    } else if (blockTime === 0 && isBlocked) {
      setIsBlocked(false)
      setNumberInput("")
      // If block time ends, show a message for a brief moment
      setShowResultIndicator(true)
      setResult({ show: true, isCorrect: false, message: "⏱️ You can try again now." })
      const timeout = setTimeout(() => {
        setShowResultIndicator(false);
        setResult({ show: false, isCorrect: false });
      }, 3000); // Message disappears after 3 seconds
      return () => clearTimeout(timeout);
    }
    return () => clearTimeout(timerId)
  }, [isBlocked, blockTime])

  // Effect to manage showing/hiding the result message and adjusting content height
  useEffect(() => {
    let timeoutId;
    if (result.show && result.message) { // Use result.message for blocked messages
      setShowResultIndicator(true);
      if (!isBlocked && !result.isCorrect) { // Automatically hide if incorrect and not blocked
        timeoutId = setTimeout(() => {
          setShowResultIndicator(false);
          setResult({ show: false, isCorrect: false, message: "" }); // Clear message
        }, 3000); // Message disappears after 3 seconds
      }
    } else if (result.show && !result.message) { // For correct/incorrect answers without a specific message
        setShowResultIndicator(true);
        if (!isBlocked && !result.isCorrect) { // Still hide incorrect after 3s
            timeoutId = setTimeout(() => {
                setShowResultIndicator(false);
                setResult({ show: false, isCorrect: false, message: "" });
            }, 3000);
        }
    }
     else {
      setShowResultIndicator(false);
    }
    return () => clearTimeout(timeoutId);
  }, [result, isBlocked]);


  const checkAnswer = () => {
    if (isBlocked || timer === 0) return

    setShowResultIndicator(false); // Hide previous message instantly
    setResult({ show: false, isCorrect: false, message: "" }); // Clear previous result state

    if (numberInput.trim() === CORRECT_ANSWER) {
      setResult({ show: true, isCorrect: true, message: `✅ Correct! (${BINARY_PROBLEM} = ${CORRECT_ANSWER})` })
      setAttempts(0)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      let message = `❌ Incorrect. Attempts left: ${3 - newAttempts}`

      if (newAttempts >= 3) {
        const penalty = 10 + 5 * (newAttempts - 3)
        setIsBlocked(true)
        setBlockTime(penalty)
        message = `⏳ Too many wrong attempts. Try again in ${penalty} second${penalty > 1 ? "s" : ""}.`
      }
      setResult({ show: true, isCorrect: false, message })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isBlocked && numberInput.trim() !== "" && timer > 0) {
      checkAnswer()
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  // Determine if the main content area should be "expanded"
  const isContentExpanded = showResultIndicator || timer === 0;


  return (
    <div className="binary-workshop">
      {/* Assuming TimerDisplay is a component passed as prop */}
      <div className="clock-display">{TimerDisplay}</div>

      <div
        className={`nav-toggle ${menuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <div className="toggle-bar"></div>
        <div className="toggle-bar"></div>
        <div className="toggle-bar"></div>
      </div>

      <div className={`info-panel ${menuOpen ? 'show' : ''}`}>
        <div className="panel-header">Binary Conversion Help</div>
        <div className="info-item">
          <strong>Current Problem:</strong> Convert <code>{BINARY_PROBLEM}</code> to decimal
        </div>
        <div className="info-item">
          <strong>Binary Breakdown:</strong>
          <div className="binary-places">
            <span>8</span>
            <span>4</span>
            <span>2</span>
            <span>1</span>
          </div>
          <div className="binary-digits">
            <span>0</span>
            <span>1</span>
            <span>0</span>
            <span>1</span>
          </div>
        </div>
        <div className="info-item">
          <strong>Example:</strong> <code>0011</code> = 0×8 + 0×4 + 1×2 + 1×1 = 3
        </div>
      </div>

      <div className={`conversion-station ${isContentExpanded ? 'expanded' : ''}`}>
        <h2>Convert to Decimal:</h2>
        <p>
          <code className="binary-sequence">{BINARY_PROBLEM}</code>
        </p>
        <p className="conversion-hint">{`{for eg: 0011 = 2+1 = 3}`}</p>
        <div className="conversion-controls">
          <input
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isBlocked ? `Blocked (${blockTime}s)` : "Enter decimal number"}
            className="binary-decoder"
            disabled={isBlocked || timer === 0 || result.isCorrect}
          />
        </div>

        {/* Buttons side by side */}
        <div className="button-group"> {/* Renamed from button-row for consistency */}
          <button
            onClick={checkAnswer}
            disabled={isBlocked || numberInput.length === 0 || timer === 0 || result.isCorrect}
            className={`decode-submit`}
          >
            {isBlocked ? `⏳ ${blockTime}s` : (result.isCorrect ? "Correct!" : "Submit")}
          </button>

          <button
            onClick={onNext}
            disabled={!result.isCorrect || timer === 0}
            className={`workshop-next ${!result.isCorrect || timer === 0 ? "disabled" : ""}`}
            aria-describedby="next-help"
          >
            Go to Next Clue ➡️
          </button>
          <div id="next-help" className="sr-only">
            Available only after answering correctly and within time limit
          </div>
        </div>

        {/* Result Indicator moved to a dedicated section */}
        <section className="result-section" aria-live="polite" aria-atomic="true">
          {showResultIndicator && result.show && (
            <div className={`status-indicator ${result.isCorrect ? "success-indicator" : "error-indicator"} active`}>
              {result.message || (result.isCorrect ? "✅ Correct!" : "❌ Incorrect")}
            </div>
          )}

          {timer === 0 && (
            <div className="status-indicator error-indicator active">
              <span className="timeout-icon" aria-hidden="true">⏰</span>
              <span className="timeout-text">{"Time's up!"}</span>
            </div>
          )}
        </section>


        <section className="attempts-section">
          <div className="attempts-tracker">
            <span className="attempts-label">Attempts:</span>
            <div className="attempts-dots" role="img" aria-label={`${attempts} out of 3 attempts used`}>
              {[1, 2, 3].map((attempt) => (
                <div key={attempt} className={`attempts-dot ${attempts >= attempt ? "used" : ""}`} aria-hidden="true" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Binary