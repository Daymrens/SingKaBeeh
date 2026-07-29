import { sanitize } from '../utils/helpers';

const BLANK = '____';

export default function GameScreen({ song, phase, timeLeft, audioProgress, onPlay, onNext, onRevealClick }) {
  const lines = song.lyrics.split('\n');
  const hasBlank = lines.some(l => l.trim() === BLANK);

  return (
    <div className="screen active" style={{ display: 'flex' }}>
      <div className="game-header">
        <div className="round-info">
          <span className="round-badge">{song.roundLabel}</span>
          <span className="hint-badge">🎵 {song.hint}</span>
        </div>
        <div className={`timer-display${timeLeft <= 5 && phase === 'guessing' ? ' warning' : ''}`}>
          <span className="timer-icon">⏱</span>
          <span>{phase === 'guessing' || phase === 'playing' ? timeLeft : '--'}</span>
        </div>
        <div className="audio-bar"><div className="fill" style={{ width: audioProgress + '%' }}></div></div>
      </div>

      <div className="lyrics-area">
        <div className="lyrics-text visible">
          {lines.map((line, i) => {
            if (line.trim() === BLANK && phase !== 'revealed') {
              return <div key={i} className="lyric-line blank-line">________________</div>;
            }
            if (line.trim() === BLANK && phase === 'revealed') {
              return <div key={i} className="lyric-line revealed">{sanitize(song.answer)}</div>;
            }
            return <div key={i} className="lyric-line active">{sanitize(line)}</div>;
          })}
          {!hasBlank && phase === 'revealed' && (
            <div className="lyric-line revealed" style={{ marginTop: '0.8rem' }}>{sanitize(song.answer)}</div>
          )}
        </div>
        <div className={`song-info ${phase === 'revealed' ? 'visible' : ''}`}>
          {song.title} — {song.artist}
        </div>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={onPlay} disabled={phase === 'playing'}>
          ▶ Play Song
        </button>
        <button className="btn btn-danger btn-small" onClick={onRevealClick} disabled={phase !== 'guessing'}>
          👁 Reveal
        </button>
        <button className="btn btn-success btn-small" onClick={onNext} disabled={phase !== 'revealed'}>
          ▶ Next Round
        </button>
      </div>
    </div>
  );
}
