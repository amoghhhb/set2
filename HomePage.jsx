"use client"

import { useState } from "react"
import "./HomePage.css"

function HomePage({ onNext }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [department, setDepartment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleStart = async (e) => {
    e.preventDefault()

    if (!fullName.trim() || !department.trim()) {
      alert("Please enter your full name AND class/department.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("https://webverse-production.up.railway.app/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          department: department.trim(),
        }),
      })

      const data = await res.json()

      onNext({
        name: fullName.trim(),
        department: department.trim(),
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Connection error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="welcome-arena">
        <div
          className={`nav-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          role="button"
          tabIndex={0}
          aria-label="Toggle menu"
        >
          <div className="toggle-bar"></div>
          <div className="toggle-bar"></div>
          <div className="toggle-bar"></div>
        </div>

        <div className={`info-panel ${isMenuOpen ? "show" : ""}`}>
          <h3 className="panel-header">🎮 Game Information</h3>
          <div className="info-item">
            <strong>Instructions:</strong> Enter your full name and class/department and click START to begin the game.
          </div>
          <div className="info-item">
            <strong>Objective:</strong> Test your web development knowledge and speed
          </div>
          <div className="info-item">
            <strong>Scoring:</strong> Based on accuracy and completion time
          </div>
          <div className="info-item">
            <strong>Tip:</strong> Only those who remember the clues will find the way out
          </div>
          <div className="info-item">
            <strong>Leaderboard:</strong> Compete with other players globally
          </div>
        </div>

        <div className="main-arena">
          <div className="hero-section">
            <h1 className="greeting-text">WELCOME TO</h1>
            <h1 className="challenge-text">THE GAME</h1>
            <p className="tagline">Test your skills and climb the leaderboard</p>
          </div>

          <form onSubmit={handleStart} className="registration-form">
            <div className="field-group player-name-group">
              <label htmlFor="fullName" className="field-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullname"
                className="player-input player-name-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                maxLength={50}
                required
              />
            </div>

            <div className="field-group dept-group">
              <label htmlFor="department" className="field-label">
                Class / Department
              </label>
              <input
                id="department"
                type="text"
                name="department"
                className="player-input player-name-field"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Your Class / Department"
                maxLength={50}
                required
              />
            </div>

            <div className="action-section">
              <button
                className="launch-btn"
                type="submit"
                disabled={!fullName.trim() || !department.trim() || isLoading}
              >
                {isLoading ? "STARTING..." : "START"}
              </button>
            </div>
          </form>

          <div className="credits-section">
            <p className="credits-text">World Wide Web Day Challenge © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      <div className={`spinner-overlay ${isLoading ? "show" : ""}`}>
        <div className="spinner-content">
          <div className="spinner-wheel"></div>
          <p>Preparing your challenge...</p>
        </div>
      </div>
    </>
  )
}

export default HomePage
