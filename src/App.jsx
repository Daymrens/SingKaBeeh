import { useState, useRef, useCallback, useEffect } from 'react';
import SONGS, { shuffleArray } from './data/songs';
import { playTick, playRing, playSound } from './utils/sounds';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import Confetti from './components/Confetti';
import TimesUpPanel from './components/TimesUpPanel';
import OverlayIcon from './components/OverlayIcon';
import './App.css';

const GUESS_TIME = 5;
const PHASES = { IDLE: 'idle', PLAYING: 'playing', GUESSING: 'guessing', REVEALED: 'revealed' };

export default function App() {
  const [screen, setScreen] = useState('title');
  const [songs, setSongs] = useState([]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [timeLeft, setTimeLeft] = useState(GUESS_TIME);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimerRef = useRef(null);
  const [overlay, setOverlay] = useState(null);
  const overlayTimerRef = useRef(null);
  const [showTimesUp, setShowTimesUp] = useState(false);

  const timerRef = useRef(null);
  const timeLeftRef = useRef(GUESS_TIME);
  const audioTimerRef = useRef(null);
  const audioRef = useRef(null);

  const song = songs[round];

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
    const shuffled = [...SONGS];
    shuffleArray(shuffled);
    setSongs(shuffled);
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
  }, [stopTimer, stopAudio]);

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
    if (phase !== PHASES.GUESSING && phase !== PHASES.PLAYING) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopAudio();
    stopTimer();
    setPhase(PHASES.REVEALED);
    setOverlay(null);
  }, [phase, stopAudio, stopTimer]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= songs.length) {
      setScreen('title');
      return;
    }
    loadRound(songs, next);
  }, [round, songs, loadRound]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && screen === 'title') {
      startGame();
      return;
    }
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      if (phase === PHASES.PLAYING) {
        setPhase(PHASES.GUESSING);
        startTimer();
        return;
      }
      if (phase === PHASES.GUESSING) {
        revealAnswer();
        return;
      }
      if (phase === PHASES.IDLE) {
        playCurrentRound();
      }
    }
    if (e.which === 49 || e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
      if (phase === PHASES.GUESSING) {
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
    if (e.which === 50 || e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
      if (phase === PHASES.GUESSING || phase === PHASES.REVEALED) {
        e.preventDefault();
        setOverlay('❌');
        return;
      }
    }
    if ((e.key === 'n' || e.key === 'N') && phase === PHASES.REVEALED) {
      nextRound();
    }
  }, [screen, phase, startGame, startTimer, revealAnswer, playCurrentRound, stopAudio, stopTimer, nextRound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  const roundLabel = song ? `Round ${round + 1} / ${songs.length}` : '';
  const songWithLabel = song ? { ...song, roundLabel } : null;

  return (
    <div id="app">
      {screen === 'title' && <TitleScreen onStart={startGame} />}

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

      {showConfetti && <Confetti />}
      {showTimesUp && <TimesUpPanel onDismiss={() => setShowTimesUp(false)} />}
      {overlay && <OverlayIcon emoji={overlay} />}
    </div>
  );
}
