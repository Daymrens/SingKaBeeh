export default function TitleScreen({ onStart, onAdmin }) {
  return (
    <div className="screen active fade-in">
      <button className="admin-gear" onClick={onAdmin} title="Admin Panel">⚙️</button>
      <div className="title-content">
        <div className="emoji-header">🎤</div>
        <h1>Sing ka Beeh?</h1>
        <p className="subtitle">"Finish the Lyrics"</p>
        <div className="team-banner">🎤 Billing Team | Game Night 🎤</div>
        <button className="btn btn-primary" onClick={onStart}>🎵 START GAME</button>
        <div className="instructions">
          <h3>How to Play</h3>
          <ol>
            <li>A song clip plays — listen carefully!</li>
            <li>Lyrics appear with a blanked-out line</li>
            <li>Shout out or chat the missing lyrics</li>
            <li>Host clicks Reveal to show the answer</li>
            <li>Press Next Round to continue!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
