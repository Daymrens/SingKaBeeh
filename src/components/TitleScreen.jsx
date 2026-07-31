const GENRE_STRIP = ['🎸 Rock', '🎤 Pop', '🎹 EDM', '🎻 Classical', '🎷 Jazz', '🎧 Hip Hop', '🎵 R&B', '🎶 Soul', '🪘 Funk', '🎤 K-Pop', '🇵🇭 OPM', '🎸 Metal', '🎹 Disco', '🎧 Rap', '🎵 Reggae'];

const FEATURES = [
  { icon: '🎵', title: 'Listen', text: 'A song clip plays — catch the beat' },
  { icon: '✍️', title: 'Fill the Blank', text: 'Lyrics show up with a word missing' },
  { icon: '🙋', title: 'Raise Your Hand', text: 'Know it? Tap fast to get picked' },
  { icon: '🏆', title: 'Win Points', text: 'Correct answers = +10. Top score wins!' },
];

const NOTES = ['♪', '♫', '♬', '🎵', '🎶', '♩'];

export default function TitleScreen({ onCreate, onJoin, onAdmin }) {
  return (
    <div className="screen active fade-in title-screen">
      <div className="title-bg" aria-hidden="true">
        <div className="bg-orbs"><span className="orb o1"></span><span className="orb o2"></span><span className="orb o3"></span></div>
        <div className="music-notes">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={`note n${i % 6}`} style={{ left: `${(i * 8.3 + 3) % 96}%`, animationDelay: `${(i * 0.9) % 7}s`, animationDuration: `${6 + (i % 5)}s` }}>{NOTES[i % NOTES.length]}</span>
          ))}
        </div>
      </div>

      <button className="admin-gear" onClick={onAdmin} title="Admin Panel">⚙️</button>

      <div className="title-content">
        <div className="hero-logo" aria-hidden="true">
          <span className="mic-ring"></span>
          <span className="mic-emoji">🎤</span>
        </div>
        <h1 className="title-gradient">Sing ka Beeh?</h1>
        <p className="subtitle">"Finish the Lyrics"</p>
        <p className="tagline">The party game that puts your music knowledge to the test.</p>

        <div className="title-actions">
          <button className="btn btn-primary btn-cta" onClick={onCreate}>🎮 CREATE GAME</button>
          <button className="btn btn-secondary btn-cta" onClick={onJoin}>🔗 JOIN GAME</button>
        </div>

        <div className="howto-cards">
          {FEATURES.map((f, i) => (
            <div key={i} className="howto-card">
              <div className="howto-card-icon">{f.icon}</div>
              <div className="howto-card-title">{f.title}</div>
              <div className="howto-card-text">{f.text}</div>
            </div>
          ))}
        </div>

        <div className="genre-strip">
          {GENRE_STRIP.map((g, i) => (
            <span key={i} className="genre-chip">{g}</span>
          ))}
        </div>
      </div>

      <div className="credits">
        Developed by <a href="https://github.com/Daymrens" target="_blank" rel="noopener noreferrer">Dime👽</a>
      </div>
    </div>
  );
}
