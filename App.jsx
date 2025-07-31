import React, { useState, useRef, useEffect } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import HomePage from "./HomePage";
import GamePage2 from "./GamePage2";
import EmojiRiddle2 from "./EmojiRiddle2";
import ROT13 from "./ROT13";
import Ping from "./Ping";
import InspectPage from "./InspectPage";
import Binary from "./Binary";
import SecureAccess from "./SecureAccess";
import Leaderboard from "./Leaderboard";

function ErrorFallback({ error }) {
  return (
    <div role="alert" style={{ color: 'red', padding: '20px', background: '#fff' }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function TimerDisplay({ seconds }) {
  return (
    <div style={{
      position: "fixed",
      left: 25,
      top: 10,
      zIndex: 2000,
      fontFamily: "'Orbitron', 'Oswald', 'Arial Black', Arial, sans-serif",
      fontWeight: 900,
      fontSize: "1.6rem",
      color: "#fff",
      letterSpacing: "2px",
      textShadow: `0 0 2px #fff, 0 0 4px #fff`,
    }}>
      ⏳ {formatTime(seconds)}
    </div>
  );
}

const PAGE_ORDER = [
  "home", "game", "emoji", "rot13", "ping", 
  "inspect", "binary", "secure", "leaderboard"
];

function App() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [timer, setTimer] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [userData, setUserData] = useState({ name: "", department: "" });
  const timerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const loadAssets = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(loadAssets);
  }, []);

  const showTimer = PAGE_ORDER.indexOf(page) >= PAGE_ORDER.indexOf("game") &&
                   PAGE_ORDER.indexOf(page) <= PAGE_ORDER.indexOf("secure");

  useEffect(() => {
    if (timerActive && showTimer && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, showTimer]);

  useEffect(() => {
    if (timer === 0 && timerActive) setTimerActive(false);
  }, [timer, timerActive]);

  const handleStartGame = (user) => {
    setUserData(user);
    setTimer(600);
    setTimerActive(true);
    setPage("game");
  };

  const handleCompleteSecureAccess = () => {
    setTimeTaken(600 - timer);
    setTimerActive(false);
    setPage("leaderboard");
  };

  if (!isClient || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000'
      }}>
        <h1 style={{ color: '#fff' }}>Loading WebVerse...</h1>
      </div>
    );
  }

  const sharedProps = {
    timer,
    TimerDisplay: showTimer ? <TimerDisplay seconds={timer} /> : null
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {(() => {
        switch (page) {
          case "home": return <HomePage onNext={handleStartGame} />;
          case "game": return <GamePage2 {...sharedProps} onNext={() => setPage("emoji")} />;
          case "emoji": return <EmojiRiddle2 {...sharedProps} onNext={() => setPage("rot13")} />;
          case "rot13": return <ROT13 {...sharedProps} onNext={() => setPage("ping")} />;
          case "ping": return <Ping {...sharedProps} onNext={() => setPage("inspect")} />;
          case "inspect": return <InspectPage {...sharedProps} onNext={() => setPage("binary")} />;
          case "binary": return <Binary {...sharedProps} onNext={() => setPage("secure")} />;
          case "secure": return <SecureAccess {...sharedProps} onNext={handleCompleteSecureAccess} />;
          case "leaderboard": return <Leaderboard timeTaken={timeTaken} userData={userData} />;
          default: return <div style={{ color: '#fff', padding: '20px' }}>404 Not Found</div>;
        }
      })()}
    </ErrorBoundary>
  );
}

export default App;