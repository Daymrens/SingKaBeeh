import { useState, useRef, useCallback, useEffect } from 'react';
import DEFAULT_SONGS, { shuffleArray } from './data/songs';
import { loadSongs, saveSongs } from './utils/adminStorage';
import { playTick, playRing, playSound } from './utils/sounds';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import AdminScreen from './components/AdminScreen';
import Confetti from './components/Confetti';
import TimesUpPanel from './components/TimesUpPanel';
import OverlayIcon from './components/OverlayIcon';
import './App.css';

const GUESS_TIME = 5;
const PHASES = { IDLE: 'idle', PLAYING: 'playing', GUESSING: 'guessing', REVEALED: 'revealed' };

export default function App() {
  const [screen, setScreen] = useState('title');
  const [songs, setSongs] = useState(() => loadSongs(DEFAULT_SONGS));
  const [gameSongs, setGameSongs] = useState(null);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [timeLeft, setTimeLeft] = useState(GUESS_TIME);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimerRef = useRef(null);
  const [overlay, setOverlay] = useState(null);
  const overlayTimerRef = useRef(null);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);

  const timerRef = useRef(null);
  const timeLeftRef = useRef(GUESS_TIME);
  const audioTimerRef = useRef(null);
  const audioRef = useRef(null);
  const phaseRef = useRef(PHASES.IDLE);

  const activeSongs = gameSongs || songs;
  const song = activeSongs[round];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    setAudioProgress(0);
  }, []);

  const loadRound = useCallback((s, r) => {
    setRound(r);
    setPhase(PHASES.IDLE);
    timeLeftRef.current = GUESS_TIME;
    setTimeLeft(GUESS_TIME);
    setAudioProgress(0);
    setShowTimesUp(false);
    setShowConfetti(false);
    setOverlay(null);
    stopTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    stopAudio();
  }, [stopTimer, stopAudio]);

  const startGame = useCallback(() => {
    const shuffled = [...songs];
    shuffleArray(shuffled);
    setGameSongs(shuffled);
    setScreen('game');
    setRound(0);
    setPhase(PHASES.IDLE);
    timeLeftRef.current = GUESS_TIME;
    setTimeLeft(GUESS_TIME);
    setAudioProgress(0);
    setShowTimesUp(false);
    setShowConfetti(false);
    setOverlay(null);
    stopTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    stopAudio();
  }, [songs, stopTimer, stopAudio]);

  const handleSaveSongs = useCallback((updated) => {
    setSongs(updated);
    saveSongs(updated);
  }, []);

  const playCurrentRound = useCallback(() => {
    if (!song) return;
    setShowTimesUp(false);
    setShowConfetti(false);
    setOverlay(null);
    stopTimer();
    timeLeftRef.current = GUESS_TIME;
    setTimeLeft(GUESS_TIME);
    setPhase(PHASES.PLAYING);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
    }
    stopAudio();

    const audio = new Audio(song.file);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setAudioProgress(0);

    const progInterval = setInterval(() => {
      if (audio.duration) {
        setAudioProgress(audio.currentTime / audio.duration * 100);
      }
    }, 100);
    audioTimerRef.current = progInterval;
  }, [song, stopTimer, stopAudio]);

  const startTimer = useCallback(() => {
    stopTimer();
    timeLeftRef.current = GUESS_TIME;
    setTimeLeft(GUESS_TIME);
    timerRef.current = setInterval(() => {
      timeLeftRef.current--;
      const val = timeLeftRef.current;
      if (val > 0 && val <= 4) playTick();
      setTimeLeft(val);
      if (val <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        playRing();
        setShowTimesUp(true);
      }
    }, 1000);
  }, [stopTimer]);

  const revealAnswer = useCallback(() => {
    const p = phaseRef.current;
    if (p !== PHASES.GUESSING && p !== PHASES.PLAYING) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopAudio();
    stopTimer();
    setPhase(PHASES.REVEALED);
    setShowConfetti(true);
    playSound('correct');
    setOverlay(null);
  }, [stopAudio, stopTimer]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= (gameSongs || songs).length) {
      setScreen('title');
      setGameSongs(null);
      return;
    }
    loadRound(gameSongs || songs, next);
  }, [round, gameSongs, songs, loadRound]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && screen === 'title') {
      e.preventDefault();
      startGame();
      return;
    }
    if ((e.key === ' ' || e.key === 'Space') && screen === 'game') {
      e.preventDefault();
      const p = phaseRef.current;
      if (p === PHASES.PLAYING) {
        setPhase(PHASES.GUESSING);
        startTimer();
        return;
      }
      if (p === PHASES.GUESSING) {
        revealAnswer();
        return;
      }
      if (p === PHASES.IDLE) {
        playCurrentRound();
      }
    }
    if ((e.which === 49 || e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') && screen === 'game') {
      if (phaseRef.current === PHASES.GUESSING) {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        stopAudio();
        stopTimer();
        setShowConfetti(true);
        playSound('correct');
        setPhase(PHASES.REVEALED);
        return;
      }
    }
    if ((e.which === 50 || e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') && screen === 'game') {
      const p = phaseRef.current;
      if (p === PHASES.GUESSING || p === PHASES.REVEALED) {
        e.preventDefault();
        setOverlay('❌');
        return;
      }
    }
    if ((e.key === 'n' || e.key === 'N') && screen === 'game' && phaseRef.current === PHASES.REVEALED) {
      nextRound();
    }
    if (e.key === 'Escape' && screen === 'game') {
      setScreen('title');
      setGameSongs(null);
      return;
    }
  }, [screen, startGame, startTimer, revealAnswer, playCurrentRound, stopAudio, stopTimer, nextRound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (!overlay) return;
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setOverlay(null), 1500);
    return () => { if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current); };
  }, [overlay]);

  useEffect(() => {
    if (!showConfetti) return;
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 3000);
    return () => { if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current); };
  }, [showConfetti]);

  useEffect(() => {
    return () => {
      stopTimer();
      stopAudio();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopTimer, stopAudio]);

  const roundLabel = song ? `Round ${round + 1} / ${activeSongs.length}` : '';
  const songWithLabel = song ? { ...song, roundLabel } : null;

  return (
    <div id="app">
      {screen === 'title' && <TitleScreen onStart={startGame} onAdmin={() => setShowAdminLogin(true)} />}

      {screen === 'game' && songWithLabel && (
        <GameScreen
          song={songWithLabel}
          phase={phase}
          timeLeft={timeLeft}
          audioProgress={audioProgress}
          onPlay={playCurrentRound}
          onRevealClick={revealAnswer}
          onNext={nextRound}
        />
      )}

      {screen === 'admin' && (
        <AdminScreen songs={songs} onSave={handleSaveSongs} onBack={() => setScreen('title')} />
      )}

      {showConfetti && <Confetti />}
      {showTimesUp && <TimesUpPanel onDismiss={() => setShowTimesUp(false)} />}
      {overlay && <OverlayIcon emoji={overlay} />}

      {showAdminLogin && (
        <div className="admin-login-overlay" onClick={() => { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); }}>
          <div className="admin-login-box" onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Enter') { const ok = adminPass === '@dmin' || adminPass === '@dm1n'; if (ok) { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); setScreen('admin'); } else { setAdminError(true); } } }}>
            <h2>🔐 Admin Access</h2>
            <input type="password" value={adminPass} autoFocus
              onChange={e => { setAdminPass(e.target.value); setAdminError(false); }}
              placeholder="Enter password" className={adminError ? 'shake' : ''} />
            {adminError && <p className="login-error">Incorrect password</p>}
            <div className="login-btns">
              <button className="btn btn-primary btn-small"
                onClick={() => { const ok = adminPass === '@dmin' || adminPass === '@dm1n'; if (ok) { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); setScreen('admin'); } else { setAdminError(true); } }}>Login</button>
              <button className="btn btn-secondary btn-small"
                onClick={() => { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
