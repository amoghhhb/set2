"use client"

import { useState, useEffect } from "react"
import "./GamePage2.css"

function GamePage2({ onNext, timer, TimerDisplay }) {
  const [answer, setAnswer] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [tries, setTries] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimer, setBlockTimer] = useState(10)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    let timerId
    if (isBlocked) {
      if (blockTimer > 0) {
        timerId = setTimeout(() => setBlockTimer(blockTimer - 1), 1000)
      } else {
        setIsBlocked(false)
        setTries(0)
        setBlockTimer(10)
        setErrorMessage("")
      }
    }
    return () => clearTimeout(timerId)
  }, [isBlocked, blockTimer])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isBlocked || timer === 0) return
    if (answer === "1") {
      setIsCorrect(true)
      setErrorMessage("")
    } else {
      setIsCorrect(false)
      const newTries = tries + 1
      setTries(newTries)
      if (newTries >= 3) {
        setIsBlocked(true)
        setErrorMessage("Too many tries! Please wait 10 seconds ⏳")
      } else {
        setErrorMessage("Incorrect answer ❌")
      }
    }
  }

  const handleSimulatorClick = () => {
    window.open("https://circuitverse.org/simulator", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="logic-arena">
      <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <div className="toggle-bar"></div>
        <div className="toggle-bar"></div>
        <div className="toggle-bar"></div>
      </div>

      <div className={`info-panel ${isMenuOpen ? "show" : ""}`}>
        <div className="panel-header">Clue Info</div>
        <div className="info-item">
          <strong>Topic:</strong> Logic Gates
        </div>
        <div className="info-item">
          <strong>Hint:</strong> The NOT operation flips the bit.
        </div>
        <div className="info-item">
          <strong>Tool:</strong> Use the CircuitVerse simulator if needed.
        </div>
        <div className="info-item">
          <strong>Tip:</strong> Select Inputs from the input bar and the required gate from the gate bar to simulate.
        </div>
      </div>

      <div className="countdown-display">{TimerDisplay}</div>

      <div className="arena-content">
        <header className="challenge-header">
          <h1 className="arena-title">Logic Gate Puzzle</h1>
        </header>

        <section className="logic-problem">
          <div className="problem-workspace">
            <h2 className="workspace-heading">
              <span className="workspace-emoji" role="img" aria-label="lightning">⚡</span>
              <span>Solve the Logic Expression</span>
            </h2>
            <div className="formula-showcase">
              <code className="logic-formula">If A = 0 then A' = ?</code>
            </div>
            <div className="hint-section">
              <p className="hint-text">Hint: A' represents the NOT operation on A</p>
            </div>
          </div>
        </section>

        <section className="response-section">
          <form onSubmit={handleSubmit} className="response-form">
            <div className="response-group">
              <label htmlFor="answer" className="response-label">Your Answer</label>
              <input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="response-field"
                disabled={isBlocked || timer === 0 || isCorrect}
                placeholder=""
                maxLength={1}
                pattern="[01]"
                inputMode="numeric"
                aria-describedby="answer-help"
                autoComplete="off"
              />
              <div id="answer-help" className="sr-only">
                Enter either 0 or 1 as your answer to the logic expression
              </div>
            </div>

            <button
              type="button"
              className="tool-btn"
              onClick={handleSimulatorClick}
              aria-label="Open CircuitVerse simulator"
            >
              <span className="tool-icon" role="img" aria-hidden="true">🔧</span>
              <span>Circuit Simulator</span>
            </button>
          </form>
        </section>

        <section className="button-row-section">
          <div className="button-container">
            <button
              type="button"
              className="solve-btn"
              onClick={handleSubmit}
              disabled={isBlocked || timer === 0 || isCorrect || !answer.trim()}
              aria-describedby="submit-status"
            >
              {isBlocked ? `Wait ${blockTimer}s` : "Submit"}
            </button>

            <button
              className={`navigate-btn ${!isCorrect || timer === 0 ? "disabled" : ""}`}
              onClick={onNext}
              disabled={!isCorrect || timer === 0}
              aria-describedby="next-help"
            >
              <span className="navigate-text">Go to Next Clue</span>
              <span className="navigate-icon" aria-hidden="true">➡️</span>
            </button>
          </div>
          <div id="next-help" className="sr-only">
            Available only after answering correctly and within time limit
          </div>
        </section>

        <section className="status-section" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <div className="status-alert error-alert" role="alert">
              <span className="alert-icon">❌</span>
              <span className="alert-text">
                {errorMessage} {isBlocked && ` (${blockTimer}s)`}
              </span>
            </div>
          )}
          {isCorrect && (
            <div className="status-alert success-alert" role="alert">
              <span className="alert-icon">✅</span>
              <span className="alert-text">Correct! Click next to continue.</span>
            </div>
          )}
          {timer === 0 && (
            <div className="status-alert timeout-alert" role="alert">
              <span className="alert-icon">⏰</span>
              <span className="alert-text">{"Time's up!"}</span>
            </div>
          )}
        </section>

        <section className="progress-section">
          <div className="progress-tracker">
            <span className="tracker-label">Attempts:</span>
            <div className="progress-dots" role="img" aria-label={`${tries} out of 3 attempts used`}>
              {[1, 2, 3].map((attempt) => (
                <div key={attempt} className={`progress-dot ${tries >= attempt ? "used" : ""}`} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default GamePage2
