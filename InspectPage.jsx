"use client"

import { useState, useEffect } from "react"
import "./InspectPage.css"

function InspectPage({ onNext, timer, TimerDisplay }) {
 const [answer, setAnswer] = useState("")
 const [attempts, setAttempts] = useState(0)
 const [isBlocked, setIsBlocked] = useState(false)
 const [timeLeft, setTimeLeft] = useState(0)
 const [error, setError] = useState("")
 const [isVerified, setIsVerified] = useState(false)
 const [successMsg, setSuccessMsg] = useState("")
 const [showResultIndicator, setShowResultIndicator] = useState(false) // New state for showing indicator

 const handleInputChange = (e) => {
   const val = e.target.value
   if (/^[0-9]*$/.test(val)) {
     setAnswer(val)
     setError("")
     setSuccessMsg("")
     setShowResultIndicator(false) // Hide indicator on input change
   }
 }

 const handleSubmit = (e) => {
   e.preventDefault()
   if (isBlocked || answer === "" || timer === 0) return

   setShowResultIndicator(false) // Hide previous messages instantly
   setError("") // Clear previous error
   setSuccessMsg("") // Clear previous success

   if (answer === "2") {
     setIsVerified(true)
     setSuccessMsg("✅ Access granted! Clue accepted.")
     setShowResultIndicator(true) // Show success message
   } else {
     const newAttempts = attempts + 1
     setAttempts(newAttempts)

     if (newAttempts >= 3) {
       const penalty = 10 + 5 * (newAttempts - 3)
       setIsBlocked(true)
       setTimeLeft(penalty)
       setError(`❌ Locked for ${penalty} second${penalty > 1 ? "s" : ""}`)
       setShowResultIndicator(true) // Show error message (locked)
     } else {
       setError(`❌ Incorrect. ${3 - newAttempts} attempt${3 - newAttempts === 1 ? "" : "s"} left.`)
       setShowResultIndicator(true) // Show error message (attempts left)
     }
   }
 }

 useEffect(() => {
   let timerId
   if (isBlocked && timeLeft > 0) {
     timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
   } else if (isBlocked && timeLeft === 0) {
     setIsBlocked(false)
     setAnswer("")
     setError("") // Clear error when block ends
     setSuccessMsg("⏱️ You can try again now.") // Optional: give a message when block ends
     setShowResultIndicator(true) // Show message when block ends

     // Automatically hide the "try again now" message
     const timeout = setTimeout(() => {
       setSuccessMsg("");
       setShowResultIndicator(false);
     }, 3000);
     return () => clearTimeout(timeout);
   }
   return () => clearTimeout(timerId)
 }, [isBlocked, timeLeft])

 // Effect to manage showing/hiding the result message and adjusting content height
 useEffect(() => {
   let timeoutId;
   if (error || successMsg) {
     setShowResultIndicator(true);
     // If it's an error not related to block, or a success message that should disappear
     if (error && !isBlocked && !isVerified) { // Only hide incorrect messages, not locked/success
       timeoutId = setTimeout(() => {
         setError("");
         setShowResultIndicator(false);
       }, 3000);
     }
   } else {
     setShowResultIndicator(false);
   }
   return () => clearTimeout(timeoutId);
 }, [error, successMsg, isBlocked, isVerified]); // Depend on error, successMsg, block, and verified states


 // Determine container class based on state (for visual feedback on border, etc. if desired, but not for expansion logic now)
 const getContainerClass = () => {
   // This part is for visual styling (e.g. border color). The expansion is handled by `isContentExpanded`
   if (isVerified) return "investigation-panel success-border" // Changed to success-border for consistent border color
   if (error && !isBlocked) return "investigation-panel error-border" // Changed to error-border
   if (isBlocked) return "investigation-panel blocked-border" // New class for blocked state
   return "investigation-panel"
 }

 // Determine if the main content area should be "expanded"
 const isContentExpanded = showResultIndicator || timer === 0;

 return (
   <div className="detective-wrapper">
     {TimerDisplay}
     <div className={`${getContainerClass()} ${isContentExpanded ? 'expanded' : ''}`}>
       <h1 className="mystery-title">INSPECT TILL YOU SUSPECT 🕵️</h1>
       <p className="riddle-text">Discover the hidden verification code:</p>
       <form onSubmit={handleSubmit} className="verification-form" id="verification-form-id">
         <div className="code-input-section">
           <input
             type="number"
             value={answer}
             onChange={handleInputChange}
             disabled={isBlocked || isVerified || timer === 0}
             placeholder={isBlocked ? `Blocked (${timeLeft}s)` : "Enter The Discovered Code"}
             className="secret-code-field"
           />
         </div>

         {/* Result Messages */}
         <section className="result-section" aria-live="polite" aria-atomic="true">
           {showResultIndicator && error && (
             <div className={`status-indicator error-indicator active`}>
               <span className="result-text">{error}</span>
             </div>
           )}
           {showResultIndicator && successMsg && (
             <div className={`status-indicator success-indicator active`}>
               <span className="result-text">{successMsg}</span>
             </div>
           )}
           {timer === 0 && ( // Timer's up message
             <div className="status-indicator error-indicator active">
               <span className="timeout-icon" aria-hidden="true">⏰</span>
               <span className="timeout-text">{"Time's up!"}</span>
             </div>
           )}
         </section>

         {/* Attempts Section */}
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

       {/* Hidden Clue - kept for reference, but display: none will hide it */}
       <p
         style={{
           color: "#222",
           fontSize: "12px",
           opacity: 0.23,
           marginTop: "18px",
           userSelect: "none",
           display: "none",
         }}
       >
         Your Clue is 266/133
       </p>

       {/* Go to Next Clue button - moved into the same "buttons-container" as the verify button */}
       <div className="combined-buttons-group"> {/* New flex container for buttons */}
         <button
           type="submit" // This button will now handle submission of the form directly
           form="verification-form-id" // Link to the form
           disabled={isBlocked || answer === "" || isVerified || timer === 0}
           className="verify-btn"
         >
           {isBlocked ? `⏳ ${timeLeft}s` : (isVerified ? "Verified!" : "Verify")}
         </button>
         <button
           className={`proceed-btn ${!isVerified || timer === 0 ? "disabled" : ""}`}
           onClick={onNext}
           disabled={!isVerified || timer === 0}
         >
           Go to Next Clue ➡️
         </button>
       </div> {/* End of .combined-buttons-group */}
     </div>
   </div>
 )
}

export default InspectPage