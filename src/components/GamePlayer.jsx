import { useState, useEffect, useRef } from 'react';
import { raiseHand } from '../firebase';
import { GENRE_POOL } from './GameHost';
import TimesUpPanel from './TimesUpPanel';

export default function GamePlayer({ gameCode, playerId, gameData }) {
  const [handRaised, setHandRaised] = useState(false);
  const audioRef = useRef(null);
  const syncRef = useRef(null);
  const [genreDisplay, setGenreDisplay] = useState('🎰');
  const [genreLanded, setGenreLanded] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);

  const gameState = gameData?.gameState || {};
  const players = gameData?.players || {};
  const songs = gameData?.songs ? Object.values(gameData.songs) : [];
  const shuffledIds = gameData?.shuffledSongIds || [];
  const round = gameState.round || 0;
  const isPaused = gameState.paused === true;
  const syncToPlayers = gameState.syncToPlayers === true;
  const playback = gameState.playback || null;
  const genrePicker = gameState.genrePicker === true;
  const genreTarget = gameState.genreTarget || '🎵 Music';
  const genrePickedAt = gameState.genrePickedAt || 0;
  const timesUp = gameState.timesUp === true;

  const songId = shuffledIds[round];
  const song = songs.find(s => s.id === songId);

  const phase = gameState.phase || 'idle';
  const answeredPlayerId = gameState.answeredPlayerId;
  const isAnswering = answeredPlayerId === playerId;
  const me = players[playerId] || {};

  useEffect(() => {
    setHandRaised(false);
  }, [gameState.round, gameState.phase]);

  useEffect(() => {
    if (timesUp) setShowTimesUp(true);
  }, [timesUp]);

  useEffect(() => {
    if (!genrePicker) return;
    setGenreLanded(false);
    const items = [genreTarget, ...GENRE_POOL.filter(g => g !== genreTarget)];
    const start = genrePickedAt || Date.now();
    let frame;
    const spin = () => {
      const elapsed = Date.now() - start;
      const idx = Math.floor(elapsed / 60) % items.length;
      setGenreDisplay(items[idx] || '🎰');
      if (elapsed < 2200) { frame = requestAnimationFrame(spin); return; }
      setGenreDisplay(genreTarget);
      setGenreLanded(true);
    };
    frame = requestAnimationFrame(spin);
    return () => { cancelAnimationFrame(frame); setGenreDisplay('🎰'); setGenreLanded(false); };
  }, [genrePicker, genreTarget, genrePickedAt]);

  useEffect(() => {
    if (!syncToPlayers || !playback || playback.paused) return;
    if (!song || song.id !== playback.songId) return;
    if (phase !== 'playing' && phase !== 'guessing') return;

    const elapsedMs = playback.offsetMs + (Date.now() - playback.startedAt);
    const audio = new Audio(song.file);
    audioRef.current = audio;
    audio.preload = 'auto';
    audio.currentTime = Math.max(0, elapsedMs / 1000);
    audio.play().catch(() => {});
    syncRef.current = { token: `${playback.songId}-${round}-${playback.startedAt}` };

    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      syncRef.current = null;
    };
  }, [syncToPlayers, phase, song, playback?.paused, playback?.songId, playback?.startedAt, playback?.offsetMs, round]);

  const handleRaiseHand = () => {
    raiseHand(gameCode, playerId);
    setHandRaised(true);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const processedLines = song?.lyrics?.split('\n') || [];
  const hintWord = phase !== 'revealed' && song ? (() => {
    const words = song.answer.trim().split(/[\s\n]+/);
    return words.length ? words[words.length - 1].replace(/[^a-zA-Z0-9äëïöüñáéíóúàèìòù'’-]/g, '') : '';
  })() : '';

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  const sortedPlayers = Object.entries(players).sort(([, a], [, b]) => (b.score || 0) - (a.score || 0));
  const handRaiseOrder = Object.entries(players)
    .filter(([, p]) => p.handRaisedAt)
    .sort(([, a], [, b]) => a.handRaisedAt - b.handRaisedAt);
  const myHandPosition = handRaiseOrder.findIndex(([pid]) => pid === playerId);

  return (
    <div className="screen active player-view">
      {isPaused && (
        <div className="countdown-overlay">
          <div className="pause-overlay">
            <div className="pause-icon">⏸</div>
            <div className="pause-text">Game Paused</div>
            <div className="pause-sub">Waiting for host to resume...</div>
          </div>
        </div>
      )}
      {isAnswering && (
        <div className="answering-banner">🎤 You're answering!</div>
      )}
      {syncToPlayers && playback && (phase === 'playing' || phase === 'guessing') && (
        <div className="sync-indicator">{playback.paused ? '⏸' : '🔊'} Synced to host audio</div>
      )}
      {genrePicker && (
        <div className="countdown-overlay">
          <div className="genre-picker">
            <div className="genre-label">🎵 Category</div>
            <div className={`genre-display${genreLanded ? ' landed' : ' spinning'}`}>
              {genreDisplay}
            </div>
          </div>
        </div>
      )}
      {showTimesUp && <TimesUpPanel onDismiss={() => setShowTimesUp(false)} />}

      <div className="player-game-area">
        <div className="game-header">
          <div className="round-info">
            <span className="round-badge">Round {round + 1}</span>
            {song && <span className="hint-badge">🎵 {song.hint}</span>}
          </div>
          <div className="timer-display">
            <span className="timer-icon">⏱</span>
            <span>{phase === 'guessing' ? 'GO!' : phase === 'playing' ? '▶' : '--'}</span>
          </div>
        </div>

        {song && phase !== 'idle' && (
          <div className="lyrics-area">
            <div className="lyrics-text visible">
              {processedLines.map((line, i) => {
                if (line.trim() === '____' && phase !== 'revealed') {
                  return <div key={i} className="lyric-line blank-line">________________{hintWord ? <span className="blank-hint"> … <span className="last-word">{hintWord}</span></span> : ''}</div>;
                }
                if (line.trim() === '____' && phase === 'revealed') {
                  return <div key={i} className="lyric-line revealed">{sanitize(song.answer)}</div>;
                }
                return <div key={i} className="lyric-line active">{sanitize(line)}</div>;
              })}
            </div>
            <div className="song-info visible">
              {song.title} — {song.artist}
            </div>
          </div>
        )}

        <div className="player-controls">
          {phase === 'guessing' && !handRaised && !isAnswering && (
            <button className="btn btn-primary raise-hand-btn pulse" onClick={handleRaiseHand}>
              🙋 RAISE HAND
            </button>
          )}
          {handRaised && !isAnswering && (
            <div className="hand-raised-msg">
              <span className="hand-waiting">🙋 Hand raised! #{myHandPosition >= 0 ? myHandPosition + 1 : '?'} in line</span>
            </div>
          )}
          {phase !== 'guessing' && phase !== 'idle' && (
            <div className="phase-indicator">
              {phase === 'playing' ? '🎵 Listening...' : phase === 'revealed' ? '🎉 Answer revealed!' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="player-sidebar">
        <div className="score-display">
          <h3>My Score</h3>
          <div className="my-score">{me.score || 0}</div>
        </div>

        <div className="leaderboard">
          <h3>🏆 Leaderboard</h3>
          {sortedPlayers.map(([pid, p], idx) => (
            <div key={pid} className={`score-item${pid === playerId ? ' me' : ''}`}>
              <span className="score-rank">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
              <span className="score-name">{p.name}</span>
              <span className="score-value">{p.score || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
