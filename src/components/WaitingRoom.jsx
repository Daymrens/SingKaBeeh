import { useState } from 'react';

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase();
}

export default function WaitingRoom({ gameCode, role, playerId, gameData, onStart, onBack, onPromoteHost }) {
  const [copied, setCopied] = useState(false);
  const players = gameData?.players || {};
  const hosts = gameData?.hosts || {};
  const hostIds = Object.keys(hosts);
  const playerCount = Object.keys(players).length;
  const isOriginalHost = gameData?.config?.hostId === playerId;
  const canPromote = isOriginalHost && hostIds.length < 3;

  const handleCopy = () => {
    navigator.clipboard.writeText(gameCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const nonHostPlayers = Object.entries(players).filter(([id]) => !hosts[id]);

  return (
    <div className="screen active fade-in">
      <div className="waiting-room">
        <div className="waiting-header">
          <div className="emoji-header">🎤</div>
          <h1>Waiting Room</h1>
          <div className="game-code-display">
            Code: <span className="code-value">{gameCode}</span>
            <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
              {copied ? '✓ Copied' : '📋'}
            </button>
          </div>
          {isOriginalHost && (
            <p className="waiting-hint">Share this code with players!</p>
          )}
        </div>

        {hostIds.length > 0 && (
          <div className="player-list host-list">
            <h3>👑 Hosts ({hostIds.length})</h3>
            {hostIds.map(id => (
              <div key={id} className={`player-item${id === playerId ? ' me' : ''}`}>
                <div className="player-avatar host-avatar">{getInitial(hosts[id].name)}</div>
                <span className="player-name">{hosts[id].name}</span>
                {id === playerId && <span className="player-you">(you)</span>}
                {id === gameData?.config?.hostId && <span className="player-you">creator</span>}
              </div>
            ))}
          </div>
        )}

        <div className="player-list">
          <h3>Players ({nonHostPlayers.length})</h3>
          {nonHostPlayers.length > 0 ? nonHostPlayers.map(([id, p]) => (
            <div key={id} className={`player-item${id === playerId ? ' me' : ''}`}>
              <div className="player-avatar">{getInitial(p.name)}</div>
              <span className="player-name">{p.name}</span>
              {id === playerId && <span className="player-you">(you)</span>}
              {canPromote && (
                <button className="btn btn-xs btn-primary" onClick={() => onPromoteHost(id, p.name)}>
                  👑
                </button>
              )}
            </div>
          )) : (
            <p className="waiting-empty">No players yet...</p>
          )}
        </div>

        {isOriginalHost ? (
          <button className="btn btn-primary start-btn" onClick={onStart}
            disabled={playerCount < 1}>
            🎬 Start Game
          </button>
        ) : (
          <p className="waiting-host-msg">⏳ Waiting for host to start the game...</p>
        )}

        <button className="btn btn-secondary btn-small leave-btn" onClick={onBack}>
          ✕ Leave
        </button>
      </div>
    </div>
  );
}
