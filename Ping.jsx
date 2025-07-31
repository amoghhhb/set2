"use client"

import { useState, useEffect } from "react"
import "./Ping.css"

const Ping = ({ timer, TimerDisplay, onNext }) => {
  const [answer, setAnswer] = useState("")
  const [resultMsg, setResultMsg] = useState("") // Renamed from 'result' for clarity with 'showResultIndicator'
  const [isCorrect, setIsCorrect] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showResultIndicator, setShowResultIndicator] = useState(false) // State for showing success/error message
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false) // State for showing time's up message

  // Effect to manage showing/hiding the result message
  useEffect(() => {
    let timeoutId;
    if (resultMsg) {
      setShowResultIndicator(true);
      // Auto-hide incorrect messages, but keep correct ones visible until navigation
      if (!isCorrect) {
        timeoutId = setTimeout(() => {
          setResultMsg("");
          setShowResultIndicator(false);
        }, 3000); // Message disappears after 3 seconds
      }
    } else {
      setShowResultIndicator(false);
    }
    return () => clearTimeout(timeoutId);
  }, [resultMsg, isCorrect]);

  // Effect to manage time's up message visibility
  useEffect(() => {
    if (timer === 0) {
      setShowTimeoutMessage(true);
      // Optionally disable input/buttons if time is up
      // You might already have this in your disabled logic
    } else {
      setShowTimeoutMessage(false);
    }
  }, [timer]);


  const checkAnswer = (e) => {
    if (e) {
      e.preventDefault()
    }

    if (timer === 0) return // Do nothing if timer is 0

    // Hide previous result message immediately when a new check is performed
    setResultMsg("")
    setShowResultIndicator(false)

    if (answer.trim() === "0") {
      setResultMsg("✅ Correct! When a host is unreachable, you receive 0 bytes of data")
      setIsCorrect(true)
      setAttempts(0)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setResultMsg("❌ Incorrect! When ping fails, no data is received.")
      setIsCorrect(false)
    }
  }

  // Determine if the main content area should be "expanded"
  const isContentExpanded = showResultIndicator || showTimeoutMessage;


  return (
    <div className="file-lab">
      {/* Assuming TimerDisplay is a component passed as prop */}
      <div className="clock-display">{TimerDisplay}</div>

      <div className={`lab-workstation ${isContentExpanded ? 'expanded' : ''}`}>
        <h1 className="lab-banner">Ping Timeout</h1>
        <div className="challenge-prompt-container">
          <div className="challenge-prompt">
            If a host is unreachable & ping fails with no reply,
            <br />
            How many bytes of data is received?
          </div>
        </div>
        <form onSubmit={checkAnswer} className="ping-form"> {/* Added a class for the form */}
          <input
            type="number"
            className="analysis-field"
            placeholder="?"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={timer === 0 || isCorrect} // Disable input if time is up or answer is correct
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                checkAnswer()
              }
            }}
          />

          {/* START: Combined button group */}
          <div className="action-buttons-group"> {/* New container for buttons */}
            <button
              type="submit" // Changed to submit type to trigger form onSubmit
              className="analyze-btn"
              disabled={answer.trim() === "" || timer === 0 || isCorrect}
            >
              Submit
            </button>
            
            <button
              className={`analyze-btn advance-btn ${!isCorrect || timer === 0 ? "disabled" : ""}`}
              onClick={onNext}
              disabled={!isCorrect || timer === 0}
            >
              Click to Continue <span>➡️</span> {/* Wrapped emoji in span */}
            </button>
          </div>
          {/* END: Combined button group */}
          
          {/* Result message section (positioned to be above timeout message) */}
          <section className="result-section" aria-live="polite" aria-atomic="true">
            {showResultIndicator && resultMsg && (
              <div className={`status-indicator ${isCorrect ? "success-indicator" : "error-indicator"} active`}>
                {resultMsg}
              </div>
            )}
          </section>

          {/* Moved separate timeout message here, below indicator and above attempts */}
          {showTimeoutMessage && <div className="timeout-message active">⏰ Time's up!</div>}

          {/* Attempts Section (positioned to be below timeout message) */}
          <section className="attempts-section">
            <div className="attempts-tracker">
              <span className="attempts-label">Attempts:</span>
              <div className="attempts-dots" role="img" aria-label={`${attempts} out of 3 attempts used`}>
                {[1, 2, 3].map((attempt) => (
                  <div
                    key={attempt}
                    className={`attempts-dot ${attempts >= attempt ? "used" : ""}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </section>

        </form>
        
        {!isCorrect && <div className="lab-hint">💡 Hint: What happens when there's no response at all?</div>}
        
      </div>
    </div>
  )
}

export default Ping