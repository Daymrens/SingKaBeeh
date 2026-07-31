export default function ResultsScreen({ gameData, onHome }) {
  const players = Object.entries(gameData?.players || {}).sort(([, a], [, b]) => (b.score || 0) - (a.score || 0));
  const winner = players[0];
  const podium = players.slice(0, 3);
  const rest = players.slice(3);

  const medal = ['🥇', '🥈', '🥉'];

  return (
    <div className="screen active fade-in results-screen">
      <div className="results-box">
        <div className="emoji-header">🏆</div>
        <h1>Game Over!</h1>
        <p className="results-subtitle">Final Standings</p>

        {winner && (
          <div className="winner-banner">
            <span className="winner-crown">👑</span>
            <span className="winner-name">{winner[1].name}</span>
            <span className="winner-score">{winner[1].score || 0} pts</span>
          </div>
        )}

        {podium.length > 0 && (
          <div className="podium">
            {podium.map(([pid, p], i) => (
              <div key={pid} className={`podium-item rank-${i + 1}`}>
                <span className="podium-medal">{medal[i]}</span>
                <span className="podium-name">{p.name}</span>
                <span className="podium-score">{p.score || 0}</span>
              </div>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="results-list">
            {rest.map(([pid, p], i) => (
              <div key={pid} className="results-list-item">
                <span className="results-rank">#{podium.length + i + 1}</span>
                <span className="results-name">{p.name}</span>
                <span className="results-score">{p.score || 0}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-primary results-home-btn" onClick={onHome}>🏠 Back to Home</button>
      </div>
    </div>
  );
}
