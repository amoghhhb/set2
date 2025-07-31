"use client"

import { useState, useEffect } from "react"
import "./ROT13.css"

export default function CaesarCipherQuiz({ onNext, timer, TimerDisplay }) {
  const [userAnswer, setUserAnswer] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultColor, setResultColor] = useState("#fff")
  const [nextEnabled, setNextEnabled] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTime, setBlockTime] = useState(0)
  const [showResultIndicator, setShowResultIndicator] = useState(false) // New state for showing result messages
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false); // New state for showing time's up message

  const correctAnswer = "two"

  useEffect(() => {
    let timerId
    if (isBlocked && blockTime > 0) {
      timerId = setTimeout(() => setBlockTime(blockTime - 1), 1000)
    } else if (blockTime === 0 && isBlocked) {
      setIsBlocked(false)
      setUserAnswer("")
      setResultMsg("⏱️ You can try again now.")
      setResultColor("#fff") // Neutral color for retry message
      setShowResultIndicator(true); // Show retry message
      // Auto-hide retry message after a delay
      const timeout = setTimeout(() => {
        setResultMsg("");
        setShowResultIndicator(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    return () => clearTimeout(timerId)
  }, [isBlocked, blockTime])

  // Effect to manage showing/hiding the general result message
  useEffect(() => {
    let timeoutId;
    if (resultMsg) {
      setShowResultIndicator(true);
      // Automatically hide the message after some time if it's not a block message or correct message
      // Note: resultColor "#fff" is used for "try again now" and should also be hidden automatically if not correct.
      if (!isBlocked && resultColor !== "#00ff00") { // If not blocked AND not correct
        timeoutId = setTimeout(() => {
          setResultMsg("");
          setResultColor("#fff"); // Reset color
          setShowResultIndicator(false);
        }, 3000); // Message disappears after 3 seconds
      }
    } else {
      setShowResultIndicator(false);
    }
    return () => clearTimeout(timeoutId);
  }, [resultMsg, isBlocked, resultColor]);

  // Effect to manage time's up message visibility
  useEffect(() => {
    if (timer === 0) {
      setShowTimeoutMessage(true);
      setNextEnabled(false); // Disable next button if time is up
    } else {
      setShowTimeoutMessage(false);
    }
  }, [timer]);


  const checkAnswer = () => {
    if (isBlocked || timer === 0) return

    setShowResultIndicator(false); // Hide previous message instantly
    setResultMsg(""); // Clear message immediately

    if (userAnswer.trim().toLowerCase() === correctAnswer) {
      setResultMsg("✅ Correct! Well done!")
      setResultColor("#00ff00")
      setNextEnabled(true)
      setAttempts(0)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        const penalty = 10 + 5 * (newAttempts - 3)
        setIsBlocked(true)
        setBlockTime(penalty)
        setResultMsg(`❌ Blocked for ${penalty} second${penalty > 1 ? "s" : ""}. Try again later!`)
      } else {
        setResultMsg(`❌ Incorrect. Attempts left: ${3 - newAttempts}`)
      }
      setResultColor("#ff6b6b")
      setNextEnabled(false)
    }
    // This will trigger the useEffect for resultMsg to show the indicator
  }

  // Determine if the main content area should be "expanded"
  const isContentExpanded = showResultIndicator || showTimeoutMessage;


  return (
    <div className="cipher-studio">
      {/* Assuming TimerDisplay is a component passed as prop */}
      <div className="clock-display">{TimerDisplay}</div>

      <div className={`decryption-workspace ${isContentExpanded ? 'expanded' : ''}`}>
        <h2 className="studio-title">🔐 ROT13 Decryption Quiz</h2>
        <div className="coded-transmission">
          <p>
            <strong>Decrypt the given code to obtain the clue:</strong>
            <br />
            <code className="cipher-text">GJB</code>
          </p>
          <p className="shift-indicator">Key Shift: 13</p>
          <p className="tip">Tip: Either you add or subtract 13, answer will be the same</p>
        </div>
        <input
          type="text"
          placeholder={isBlocked ? `Blocked (${blockTime}s)` : "Enter your decrypted answer here"}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isBlocked || timer === 0 || nextEnabled}
          className="decode-field"
        />

        {/* START: Combined button group */}
        <div className="button-group">
          <button
            onClick={checkAnswer}
            disabled={isBlocked || userAnswer.trim() === "" || timer === 0 || nextEnabled}
            className={`decode-btn ${isBlocked || userAnswer.trim() === "" || nextEnabled ? "disabled" : ""}`}
          >
            {isBlocked ? `⏳ ${blockTime}s` : "Submit"}
          </button>

          <button
            onClick={onNext}
            disabled={!nextEnabled || timer === 0}
            className={`continue-btn ${!nextEnabled || timer === 0 ? "disabled" : ""}`}
          >
            Go to Next Clue <span>➡️</span> {/* Wrapped emoji in span */}
          </button>
        </div>
        {/* END: Combined button group */}

        {/* Result messages section - Only shows resultMsg from state */}
        <section className="result-section" aria-live="polite" aria-atomic="true">
            {showResultIndicator && resultMsg && (
                <div className={`status-indicator ${resultColor === "#ff6b6b" || resultColor === "#ff0000ff" ? "error-indicator" : "success-indicator"} active`}>
                    <span className="result-text">{resultMsg}</span>
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
        
        {/* Restored separate timeout message and added 'active' class */}
        {showTimeoutMessage && <div className="timeout-message active">⏰ Time's up!</div>}
      </div>
    </div>
  )
}