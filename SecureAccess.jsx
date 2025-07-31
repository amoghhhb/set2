"use client"

import { useState, useEffect, useRef } from "react"
import "./SecureAccess.css"

const SecureAccess = ({ timer, TimerDisplay, onNext }) => {
  const [passcode, setPasscode] = useState("")
  const [status, setStatus] = useState("idle")
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (timer === 0 && status === "idle") {
      setStatus("timeout")
    }
  }, [timer, status])

  const handleInputChange = (e) => {
    const value = e.target.value
    if (/^\d{0,6}$/.test(value)) {
      setPasscode(value)

      if (status !== "idle") {
        setStatus("idle")
      }
    }
  }

  const handleSubmit = () => {
    if (passcode.length === 6 && timer > 0) {
      checkCode(passcode)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && passcode.length === 6 && timer > 0) {
      checkCode(passcode)
    }
  }

  const checkCode = (entered) => {
    if (entered === "182025") {
      setStatus("success")
      setAttempts(0) // Reset attempts on success
      setTimeout(() => {
        onNext()
      }, 1500)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setStatus("fail")
      setPasscode("")
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  return (
    <div className="vault-chamber">
      {TimerDisplay}

      <div className="access-terminal">
        <h1 className="terminal-header">🔐 SECURE ACCESS PORTAL</h1>
        <p className="terminal-prompt">Enter the 6-digit passcode to unlock the leaderboard</p>

        <div className="keypad-zone">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={passcode}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="keypad-display"
            placeholder="Enter passcode"
            disabled={timer === 0 || status === "success"}
          />
          <button className="execute-btn" onClick={handleSubmit} disabled={passcode.length !== 6 || timer === 0}>
            Submit
          </button>
        </div>

        {status === "success" && (
          <div className="status-indicator success-indicator">✅ Access Granted! Redirecting to leaderboard...</div>
        )}

        {status === "fail" && (
          <div className="status-indicator error-indicator">❌ Access Denied: Invalid Passcode!</div>
        )}

        {status === "timeout" && (
          <div className="status-indicator error-indicator">⏰ Time's up! Challenge expired</div>
        )}

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

        <footer className="terminal-footer">World Wide Web Day Access Challenge © 2025</footer>
      </div>
    </div>
  )
}

export default SecureAccess
