import { useState, useRef, useCallback, useEffect } from 'react';
import { playTick, playRing, playSound, playRollSound } from '../utils/sounds';
import Confetti from './Confetti';
import OverlayIcon from './OverlayIcon';
import { updateGameState, clearHands, setPlayerScore, updateGameConfig } from '../firebase';

const GUESS_TIME = 5;
const PHASES = { IDLE: 'idle', PLAYING: 'playing', GUESSING: 'guessing', REVEALED: 'revealed' };
export const GENRE_POOL = [
  '🎸 Rock', '🎤 Pop', '🎹 EDM', '🎻 Classical', '🎷 Jazz', '🎧 Hip Hop',
  '🎵 R&B', '🎶 Soul', '🪘 Funk', '🎸 Indie', '🎤 K-Pop', '🇵🇭 OPM',
  '🎸 Metal', '🎹 Disco', '🎤 Ballad', '🎧 Rap', '🎵 Reggae', '🎻 Blues',
  '🎸 Punk', '🎤 Folk', '🎹 Synth', '🎧 Trap', '🎵 Country', '🎶 Gospel',
  '🎸 Grunge', '🎤 House', '🎹 Techno', '🎧 Lo-Fi', '🎵 Latin', '🎶 Bossa',
];

export default function GameHost({ gameCode, gameData, onBack }) {
  const songs = gameData?.songs ? Object.values(gameData.songs) : [];
  const shuffledIds = gameData?.shuffledSongIds || [];
  const players = gameData?.players || {};
  const isPaused = gameData?.gameState?.paused === true;
  const syncToPlayers = gameData?.gameState?.syncToPlayers === true;
  const wrongPlayers = gameData?.gameState?.wrongPlayers || {};

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [timeLeft, setTimeLeft] = useState(GUESS_TIME);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [genrePicker, setGenrePicker] = useState(false);
  const [genreDisplay, setGenreDisplay] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const timerRef = useRef(null);
  const timeLeftRef = useRef(GUESS_TIME);
  const audioTimerRef = useRef(null);
  const audioRef = useRef(null);
  const phaseRef = useRef(PHASES.IDLE);
  const playCurrentRoundRef = useRef(null);
  const genreTargetRef = useRef(null);
  const genreItemsRef = useRef([]);
  const confettiTimerRef = useRef(null);
  const overlayTimerRef = useRef(null);
  const startGenrePickerRef = useRef(null);
  const syncToPlayersRef = useRef(syncToPlayers);
  useEffect(() => { syncToPlayersRef.current = syncToPlayers; }, [syncToPlayers]);

  const songId = shuffledIds[round];
  const song = songs.find(s => s.id === songId);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioTimerRef.current) { clearInterval(audioTimerRef.current); audioTimerRef.current = null; }
    setAudioProgress(0);
  }, []);

  const handlePause = async () => {
    if (audioRef.current) audioRef.current.pause();
    stopTimer();
    stopAudio();
    const cur = audioRef.current?.currentTime || 0;
    await updateGameState(gameCode, { paused: true });
    if (syncToPlayersRef.current) {
      await updateGameState(gameCode, { playback: { paused: true, offsetMs: Math.round(cur * 1000) } });
    }
  };

  const handleResume = async () => {
    await updateGameState(gameCode, { paused: false });
    if (syncToPlayersRef.current) {
      const cur = audioRef.current?.currentTime || 0;
      await updateGameState(gameCode, { playback: { startedAt: Date.now(), offsetMs: Math.round(cur * 1000), paused: false } });
    }
    if (audioRef.current && phase === PHASES.PLAYING) {
      audioRef.current.play().catch(() => {});
      const progInterval = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) setAudioProgress(audioRef.current.currentTime / audioRef.current.duration * 100);
      }, 100);
      audioTimerRef.current = progInterval;
    }
    if (phase === PHASES.GUESSING) {
      startTimer();
    }
  };

  const handleAddPoints = async (pid, amount = 10) => {
    const current = players[pid]?.score || 0;
    await setPlayerScore(gameCode, pid, current + amount);
  };

  const handleToggleSync = async () => {
    const next = !syncToPlayers;
    await updateGameState(gameCode, { syncToPlayers: next });
    if (!next) {
      await updateGameState(gameCode, { playback: null });
    }
  };

  const handleStopGame = async () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopTimer();
    stopAudio();
    setSettingsOpen(false);
    if (syncToPlayersRef.current) await updateGameState(gameCode, { playback: null });
    await updateGameState(gameCode, { genrePicker: false, timesUp: false });
    await updateGameConfig(gameCode, { status: 'finished' });
  };

  const handleCancelGame = async () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopTimer();
    stopAudio();
    setSettingsOpen(false);
    if (syncToPlayersRef.current) await updateGameState(gameCode, { playback: null });
    await updateGameState(gameCode, { genrePicker: false });
    await updateGameConfig(gameCode, { status: 'cancelled' });
    onBack();
  };

  useEffect(() => {
    if (isPaused) {
      if (audioRef.current) audioRef.current.pause();
      stopTimer();
      stopAudio();
    }
  }, [isPaused, stopTimer, stopAudio]);

  const startGenrePicker = useCallback((hint) => {
    const target = hint || '🎵 Music';
    genreTargetRef.current = target;
    genreItemsRef.current = [target, ...GENRE_POOL.filter(g => g !== target)];
    setGenrePicker(true);
    setGenreDisplay('🎰');
    updateGameState(gameCode, { genrePicker: true, genreTarget: target, genrePickedAt: Date.now() });
  }, [gameCode]);

  useEffect(() => {
    startGenrePickerRef.current = startGenrePicker;
  });

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { setCountdown(null); startGenrePickerRef.current(song?.hint); return; }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, song]);

  const startRound = useCallback(() => {
    if (!song) return;
    setShowConfetti(false);
    setOverlay(null);
    setSelectedPlayer(null);
    stopTimer();
    stopAudio();
    setAudioProgress(0);
    setCountdown(3);
  }, [song, stopTimer, stopAudio]);  const playCurrentRound = useCallback(() => {
    if (!song) return;
    setShowConfetti(false);
    setOverlay(null);
    stopTimer();
    timeLeftRef.current = GUESS_TIME;
    setTimeLeft(GUESS_TIME);
    setPhase(PHASES.PLAYING);
    updateGameState(gameCode, { phase: PHASES.PLAYING, round, answeredPlayerId: null, timesUp: false, wrongPlayers: null });

    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; }
    stopAudio();

    const audio = new Audio(song.file);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setAudioProgress(0);

    const progInterval = setInterval(() => {
      if (audio.duration) setAudioProgress(audio.currentTime / audio.duration * 100);
    }, 100);
    audioTimerRef.current = progInterval;

    if (syncToPlayersRef.current) {
      updateGameState(gameCode, { playback: { songId: song.id, startedAt: Date.now(), offsetMs: 0, paused: false } });
    }
    updateGameState(gameCode, { genrePicker: false });
  }, [song, stopTimer, stopAudio, gameCode, round]);

  useEffect(() => { playCurrentRoundRef.current = playCurrentRound; });

  useEffect(() => {
    if (!genrePicker) return;
    let stopRoll = null;
    try { stopRoll = playRollSound(); } catch {}
    const target = genreTargetRef.current;
    const items = genreItemsRef.current;
    const start = Date.now();
    let frame;
    const spin = () => {
      const elapsed = Date.now() - start;
      const idx = Math.floor(elapsed / 60) % items.length;
      setGenreDisplay(items[idx]);
      if (elapsed < 2200) { frame = requestAnimationFrame(spin); return; }
      if (stopRoll) try { stopRoll(); } catch {}
      setGenreDisplay(target);
      setTimeout(() => { setGenrePicker(false); playCurrentRoundRef.current(); }, 3000);
    };
    frame = requestAnimationFrame(spin);
    return () => { cancelAnimationFrame(frame); if (stopRoll) try { stopRoll(); } catch {} };
  }, [genrePicker]);

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
        updateGameState(gameCode, { timesUp: true });
      }
    }, 1000);
  }, [stopTimer]);

  const replaySong = useCallback(() => {
    if (!song) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; }
    stopAudio();
    setAudioProgress(0);
    const audio = new Audio(song.file);
    audioRef.current = audio;
    audio.play().catch(() => {});
    const progInterval = setInterval(() => {
      if (audio.duration) setAudioProgress(audio.currentTime / audio.duration * 100);
    }, 100);
    audioTimerRef.current = progInterval;
    if (syncToPlayersRef.current) {
      updateGameState(gameCode, { playback: { songId: song.id, startedAt: Date.now(), offsetMs: 0, paused: false } });
    }
  }, [song, stopAudio, gameCode]);

  const revealAnswer = useCallback(() => {
    const p = phaseRef.current;
    if (p !== PHASES.GUESSING && p !== PHASES.PLAYING) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopAudio();
    stopTimer();
    setPhase(PHASES.REVEALED);
    setShowConfetti(true);
    playSound('correct');
    setOverlay(null);
    updateGameState(gameCode, { phase: PHASES.REVEALED, answeredPlayerId: null, timesUp: false, wrongPlayers: null });
    if (syncToPlayersRef.current) updateGameState(gameCode, { playback: null });
    clearHands(gameCode, players);
  }, [stopAudio, stopTimer, gameCode, players]);

  const handleWrong = async (pid) => {
    setSelectedPlayer(null);
    await updateGameState(gameCode, { answeredPlayerId: null, [`wrongPlayers/${pid}`]: true });
  };

  const handleCorrect = async (pid) => {
    const current = players[pid]?.score || 0;
    await setPlayerScore(gameCode, pid, current + 10);
    await clearHands(gameCode, players);
    setSelectedPlayer(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopAudio();
    stopTimer();
    setPhase(PHASES.REVEALED);
    setShowConfetti(true);
    playSound('correct');
    setOverlay(null);
    updateGameState(gameCode, { phase: PHASES.REVEALED, answeredPlayerId: null, timesUp: false, wrongPlayers: null });
    if (syncToPlayersRef.current) updateGameState(gameCode, { playback: null });
  };

  const pickPlayer = (pid) => {
    setSelectedPlayer(pid);
    updateGameState(gameCode, { answeredPlayerId: pid });
  };

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= shuffledIds.length) {
      updateGameState(gameCode, { genrePicker: false });
      updateGameConfig(gameCode, { status: 'finished' });
      setCountdown(null);
      setGenrePicker(false);
      return;
    }
    setRound(next);
    setPhase(PHASES.IDLE);
    timeLeftRef.current = GUESS_TIME;
    setTimeLeft(GUESS_TIME);
    setAudioProgress(0);
    setShowConfetti(false);
    setOverlay(null);
    setSelectedPlayer(null);
    stopTimer();
    stopAudio();
    updateGameState(gameCode, { round: next, phase: PHASES.IDLE, answeredPlayerId: null });
    if (syncToPlayersRef.current) updateGameState(gameCode, { playback: null });
    setCountdown(null);
  }, [round, shuffledIds, songs, stopTimer, stopAudio, gameCode, onBack]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const handRaiseOrder = Object.entries(players)
    .filter(([, p]) => p.handRaisedAt)
    .sort(([, a], [, b]) => a.handRaisedAt - b.handRaisedAt);

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
    const handler = (e) => {
      if ((e.key === ' ' || e.key === 'Space')) {
        e.preventDefault();
        const p = phaseRef.current;
        if (p === PHASES.PLAYING) {
          setPhase(PHASES.GUESSING);
          startTimer();
          updateGameState(gameCode, { phase: PHASES.GUESSING });
          return;
        }
        if (p === PHASES.GUESSING) {
          revealAnswer();
          return;
        }
        if (p === PHASES.IDLE) {
          e.preventDefault();
          startRound();
        }
      }
      if ((e.which === 49 || e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') && phaseRef.current === PHASES.GUESSING) {
        e.preventDefault();
        revealAnswer();
        return;
      }
      if ((e.which === 50 || e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2')) {
        const p = phaseRef.current;
        if (p === PHASES.GUESSING || p === PHASES.REVEALED) {
          e.preventDefault();
          setOverlay('❌');
          return;
        }
      }
      if ((e.key === 'n' || e.key === 'N') && phaseRef.current === PHASES.REVEALED) {
        nextRound();
      }
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [startTimer, revealAnswer, playCurrentRound, startRound, nextRound, gameCode, onBack]);

  useEffect(() => {
    return () => {
      stopTimer();
      stopAudio();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [stopTimer, stopAudio]);

  const roundLabel = `Round ${round + 1} / ${shuffledIds.length}`;

  const processedLines = song?.lyrics?.split('\n') || [];
  const hasBlank = processedLines.some(l => l.trim() === '____');
  const hintWord = phase !== PHASES.REVEALED && song ? (() => {
    const words = song.answer.trim().split(/[\s\n]+/);
    return words.length ? words[words.length - 1].replace(/[^a-zA-Z0-9äëïöüñáéíóúàèìòù'’-]/g, '') : '';
  })() : '';

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return (
    <div className="screen active game-host-layout">
      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-number" key={countdown}>Let's play</div>
        </div>
      )}
      {genrePicker && (
        <div className="countdown-overlay">
          <div className="genre-picker">
            <div className="genre-label">🎵 Category</div>
            <div className={`genre-display${genreDisplay === genreTargetRef.current ? ' landed' : ' spinning'}`}>
              {genreDisplay}
            </div>
          </div>
        </div>
      )}

      <button className="host-settings-btn" onClick={() => setSettingsOpen(true)} title="Host Settings">⚙️</button>

      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <h3>⚙️ Host Settings</h3>
            {!isPaused ? (
              <button className="settings-item" onClick={() => { setSettingsOpen(false); handlePause(); }}>⏸ Pause Game</button>
            ) : (
              <button className="settings-item" onClick={() => { setSettingsOpen(false); handleResume(); }}>▶ Resume Game</button>
            )}
            <button className="settings-item" onClick={() => { setSettingsOpen(false); handleToggleSync(); }}>
              {syncToPlayers ? '🔊 Music Sync: ON' : '🔇 Music Sync: OFF'}
            </button>
            <button className="settings-item" onClick={handleStopGame}>🛑 Stop Game (See Results)</button>
            <button className="settings-item danger" onClick={handleCancelGame}>🚪 Exit Game</button>
            <button className="settings-item close" onClick={() => setSettingsOpen(false)}>✕ Close</button>
          </div>
        </div>
      )}

      <div className="game-host-main">
        <div className="host-game-area">
          <div className="game-header">
            <div className="round-info">
              <span className="round-badge">{roundLabel}</span>
              {song && <span className="hint-badge">🎵 {song.hint}</span>}
            </div>
            <div className={`timer-display${timeLeft <= 5 && phase === 'guessing' ? ' warning' : ''}`}>
              <span className="timer-icon">⏱</span>
              <span>{phase === 'guessing' || phase === 'playing' ? timeLeft : '--'}</span>
            </div>
            <div className="audio-bar"><div className="fill" style={{ width: audioProgress + '%' }}></div></div>
          </div>

          <div className="lyrics-area">
            {phase !== PHASES.IDLE ? (
              <>
                <div className="lyrics-text visible">
                  {processedLines.map((line, i) => {
                    if (line.trim() === '____' && phase !== PHASES.REVEALED) {
                      return <div key={i} className="lyric-line blank-line">________________{hintWord ? <span className="blank-hint"> … <span className="last-word">{hintWord}</span></span> : ''}</div>;
                    }
                    if (line.trim() === '____' && phase === PHASES.REVEALED) {
                      return <div key={i} className="lyric-line revealed">{sanitize(song.answer)}</div>;
                    }
                    return <div key={i} className="lyric-line active">{sanitize(line)}</div>;
                  })}
                  {!hasBlank && phase === PHASES.REVEALED && (
                    <div className="lyric-line revealed" style={{ marginTop: '0.8rem' }}>{sanitize(song.answer)}</div>
                  )}
                </div>
                <div className="song-info visible">
                  {song?.title} — {song?.artist}
                </div>
              </>
            ) : (
              <div className="lyrics-text visible">
                <div className="lyric-line active" style={{ opacity: 0.4 }}>Loading next song...</div>
              </div>
            )}
          </div>

          <div className="controls">
            <button className="btn btn-primary" onClick={startRound} disabled={phase !== 'idle' || isPaused}>▶ Play Song</button>
            <button className="btn btn-primary btn-small" onClick={replaySong} disabled={(phase !== 'playing' && phase !== 'guessing') || isPaused}>🔁 Replay Song</button>
            <button className="btn btn-danger btn-small" onClick={revealAnswer} disabled={phase !== 'guessing' || isPaused}>👁 Reveal</button>
            <button className="btn btn-success btn-small" onClick={nextRound} disabled={phase !== 'revealed' || isPaused}>▶ Next Round</button>
          </div>
        </div>

        <div className="host-panel">
          <h3>🙋 Hand Raise Order</h3>
          {handRaiseOrder.length === 0 ? (
            <p className="panel-empty">No hands raised yet...</p>
          ) : (
            <div className="hand-raise-list">
              {handRaiseOrder.map(([pid, p], idx) => {
                const isWrong = wrongPlayers[pid];
                return (
                  <div key={pid} className={`hand-raise-item${selectedPlayer === pid ? ' selected' : ''}${isWrong ? ' wrong' : ''}`}>
                    <span className="hand-rank">{isWrong ? '❌' : `#${idx + 1}`}</span>
                    <span className="hand-name">{p.name}</span>
                    {isWrong && <span className="hand-wrong-badge">Wrong</span>}
                    {phase === PHASES.GUESSING && !selectedPlayer && !isWrong && (
                      <button className="btn btn-xs btn-primary" onClick={() => pickPlayer(pid)}>Pick</button>
                    )}
                    {selectedPlayer === pid && !isWrong && (
                      <div className="judge-btns">
                        <button className="btn btn-xs btn-success" onClick={() => handleCorrect(pid)}>✅</button>
                        <button className="btn btn-xs btn-danger" onClick={() => handleWrong(pid)}>❌</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <h3>🏆 Scoreboard</h3>
          <div className="scoreboard">
            {Object.entries(players)
              .sort(([, a], [, b]) => (b.score || 0) - (a.score || 0))
              .map(([pid, p], idx) => (
                <div key={pid} className="score-item">
                  <span className="score-rank">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                  <span className="score-name">{p.name}</span>
                  <button className="btn btn-xs btn-primary add-points-btn" onClick={() => handleAddPoints(pid, 10)}>+10</button>
                  <span className="score-value">{p.score || 0}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showConfetti && <Confetti />}
      {overlay && <OverlayIcon emoji={overlay} />}
    </div>
  );
}
