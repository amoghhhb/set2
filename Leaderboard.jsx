"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import "./Leaderboard.css"

const Leaderboard = ({ timeTaken, userData }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offlineMode, setOfflineMode] = useState(false)

  const BACKEND_URL = "https://webverse-production.up.railway.app"

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0")
    const secs = String(seconds % 60).padStart(2, "0")
    return `${mins}:${secs}`
  }

  const calculateScore = (time) => Math.floor((600 - time) * 1.5)
  const playerScore = calculateScore(timeTaken)
  const playerTime = formatTime(timeTaken)

  const saveScoreLocally = () => {
    const pendingScores = JSON.parse(localStorage.getItem("pendingScores") || "[]")
    pendingScores.push({
      name: userData.name,
      department: userData.department,
      timeTaken,
      score: playerScore,
      timestamp: Date.now(),
    })
    localStorage.setItem("pendingScores", JSON.stringify(pendingScores))
  }

  const submitScoreToServer = async (signal) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          department: userData.department,
          timeTaken,
          score: playerScore,
        }),
        signal,
      })

      if (!response.ok) throw new Error("Server rejected submission")
      return true
    } catch (err) {
      console.error("Score submission failed:", err)
      return false
    }
  }

  const fetchLeaderboard = async (signal) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/leaderboard`, { signal })
      if (!response.ok) throw new Error("Failed to fetch leaderboard")

      const data = await response.json()
      if (!Array.isArray(data?.data)) throw new Error("Invalid data format")

      return data.data.map((player, index) => ({
        ...player,
        rank: index + 1,
        timeFormatted: formatTime(player.timeTaken),
        isCurrentPlayer: player.name === userData.name,
        score: calculateScore(player.timeTaken),
      }))
    } catch (err) {
      console.error("Leaderboard fetch error:", err)
      throw err
    }
  }

  const submitPendingScores = async (signal) => {
    const pendingScores = JSON.parse(localStorage.getItem("pendingScores") || "[]")
    if (pendingScores.length === 0) return

    try {
      const successfulSubmissions = []

      for (const score of pendingScores) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/players`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(score),
            signal,
          })

          if (response.ok) {
            successfulSubmissions.push(score.timestamp)
          }
        } catch (err) {
          console.error("Failed to submit pending score:", err)
        }
      }

      if (successfulSubmissions.length > 0) {
        const remainingScores = pendingScores.filter((score) => !successfulSubmissions.includes(score.timestamp))
        localStorage.setItem("pendingScores", JSON.stringify(remainingScores))
      }
    } catch (err) {
      console.error("Pending scores submission error:", err)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const loadData = async () => {
      try {
        setLoading(true)
        setOfflineMode(false)

        await submitPendingScores(signal)

        const submitted = await submitScoreToServer(signal)
        if (!submitted) {
          saveScoreLocally()
          setOfflineMode(true)
        }

        const data = await fetchLeaderboard(signal)
        setLeaderboard(data)
        setError(null)
      } catch (err) {
        console.error("Data loading error:", err)
        saveScoreLocally()
        setOfflineMode(true)
        setError({
          message: "Connection issues detected",
          details: "Using offline mode. Scores will sync when connection is restored.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (navigator.onLine) {
      loadData()
    } else {
      setOfflineMode(true)
      setError({
        message: "You are currently offline",
        details: "Scores will be submitted when connection is restored",
      })
      setLoading(false)
    }

    return () => controller.abort()
  }, [timeTaken, userData])

  const handleRetry = () => {
    if (!navigator.onLine) {
      setError({
        message: "Still offline",
        details: "Please check your internet connection",
      })
      return
    }
    setLoading(true)
    setError(null)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="scoreboard-arena">
        <div className="loading-zone">
          <div className="loading-animation"></div>
          <p className="loading-message">Loading leaderboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="scoreboard-arena">
      <div className="rankings-panel">
        {error ? (
          <div className="error-zone">
            <div className="error-symbol">⚠️</div>
            <h2 className="error-heading">{error.message}</h2>
            <p className="error-description">{error.details}</p>

            <div className="player-summary">
              <h3>Your Game Results</h3>
              <div className="summary-grid">
                <div className="summary-stat">
                  <span className="stat-name">Name:</span>
                  <strong className="stat-data">{userData.name}</strong>
                </div>
                <div className="summary-stat">
                  <span className="stat-name">Department:</span>
                  <strong className="stat-data">{userData.department}</strong>
                </div>
                <div className="summary-stat">
                  <span className="stat-name">Time:</span>
                  <strong className="stat-data">{playerTime}</strong>
                </div>
                <div className="summary-stat">
                  <span className="stat-name">Score:</span>
                  <strong className="stat-data">{playerScore}</strong>
                </div>
              </div>
            </div>

            <button className="reconnect-btn" onClick={handleRetry} disabled={!navigator.onLine}>
              {navigator.onLine ? "Retry Connection" : "Offline Mode"}
            </button>

            <div className="server-info">
              <p>Server endpoint:</p>
              <code className="server-url">{BACKEND_URL}</code>
            </div>
          </div>
        ) : (
          <>
            <header className="rankings-header">
              <h1 className="rankings-title">🏆 Game Leaderboard</h1>
              {offlineMode && (
                <div className="offline-banner">
                  <span className="offline-dot"></span>
                  Note: Showing cached data. Scores will sync when back online.
                </div>
              )}
            </header>

            <section className="performance-overview">
              <h2 className="overview-title">Your Performance</h2>
              <div className="performance-cards">
                <div className="performance-card rank-display">
                  <div className="card-symbol">🏅</div>
                  <span className="card-title">Rank</span>
                  <span className="card-number">{leaderboard.find((p) => p.isCurrentPlayer)?.rank || "--"}</span>
                </div>
                <div className="performance-card score-display">
                  <div className="card-symbol">⭐</div>
                  <span className="card-title">Score</span>
                  <span className="card-number">{playerScore}</span>
                </div>
                <div className="performance-card time-display">
                  <div className="card-symbol">⏱️</div>
                  <span className="card-title">Time</span>
                  <span className="card-number">{playerTime}</span>
                </div>
              </div>
            </section>

            <section className="rankings-section">
              <h2 className="overview-title">Top Players</h2>
              <div className="rankings-wrapper">
                <table className="rankings-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Department</th>
                      <th>Time</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length > 0 ? (
                      leaderboard.map((player, index) => (
                        <tr
                          key={player._id || `${player.name}-${player.rank}`}
                          className={`rankings-row ${player.isCurrentPlayer ? "current-player" : ""} ${index < 3 ? `podium-${index + 1}` : ""}`}
                        >
                          <td className="rank-column">
                            {index < 3 ? (
                              <span className={`trophy trophy-${index + 1}`}>
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                              </span>
                            ) : (
                              player.rank
                            )}
                          </td>
                          <td className="player-column">{player.name}</td>
                          <td className="dept-column">{player.department || "-"}</td>
                          <td className="duration-column">{player.timeFormatted}</td>
                          <td className="points-column">{player.score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-data-row">
                        <td colSpan="5">No leaderboard data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <footer className="rankings-footer">
          <p>World Wide Web Day Challenge © {new Date().getFullYear()}</p>
          {localStorage.getItem("pendingScores") && (
            <div className="sync-status">
              <span className="sync-symbol">🔄</span>
              You have {JSON.parse(localStorage.getItem("pendingScores")).length} scores waiting to sync
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}

Leaderboard.propTypes = {
  timeTaken: PropTypes.number.isRequired,
  userData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    department: PropTypes.string,
  }).isRequired,
}

export default Leaderboard
