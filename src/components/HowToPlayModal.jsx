import { useState } from 'react';

const STEPS = {
  host: [
    { icon: '🎰', title: 'Category Roulette', text: 'When the game starts, a music category spins — Rock, Pop, OPM, and more. Press ▶ Play Song to start each round.' },
    { icon: '🎶', title: 'Play the Song', text: 'The song intro plays and players see lyrics with a blanked-out word. They listen closely to guess it!' },
    { icon: '🙋', title: 'Watch the Hands', text: 'Players hit RAISE HAND when they know the song. They queue in order on your Host Panel — pick who answers first.' },
    { icon: '🎤', title: 'Judge the Answer', text: 'After a player sings the missing word, tap ✅ Correct or ❌ Wrong. Keep the energy up!' },
    { icon: '🏆', title: 'Score & Control', text: 'Correct answers earn +10 points. Use +10 to reward anyone, then ▶ Next Round. You can ⏸ Pause or ✕ End anytime.' },
  ],
  player: [
    { icon: '🎶', title: 'Listen Closely', text: 'A song starts playing with its lyrics on screen — but the answer word is hidden. Can you guess it?' },
    { icon: '🙋', title: 'Raise Your Hand', text: 'Know the song? Smash the big RAISE HAND button fast. You get queued in the order you raised it!' },
    { icon: '🎤', title: 'Your Turn', text: 'If the host picks you, sing the missing word out loud. Nail it for glory (and points)!' },
    { icon: '🏆', title: 'Score Points', text: 'A correct answer earns +10 points. The player with the most points at the end takes the crown!' },
  ],
};

export default function HowToPlayModal({ role, onClose }) {
  const steps = STEPS[role] || STEPS.player;
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="howto-overlay" onClick={onClose}>
      <div className="howto-box" onClick={e => e.stopPropagation()}>
        <div className="howto-header">
          <span className="howto-badge">{role === 'host' ? '👑 Host' : '🎤 Player'}</span>
          <h2>{role === 'host' ? 'How to Host' : 'How to Play'}</h2>
        </div>

        <div className="howto-dots">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`howto-dot${i === step ? ' active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className="howto-body" key={step} onClick={isLast ? onClose : () => setStep(s => Math.min(steps.length - 1, s + 1))}>
          <div className="howto-icon">{current.icon}</div>
          <h3>{current.title}</h3>
          <p>{current.text}</p>
        </div>

        <div className="howto-actions">
          <button className="btn btn-secondary btn-small" onClick={onClose}>Skip</button>
          <div className="howto-nav">
            <button className="btn btn-secondary btn-small" onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}>← Back</button>
            {isLast ? (
              <button className="btn btn-primary btn-small" onClick={onClose}>Let's Sing! 🎤</button>
            ) : (
              <button className="btn btn-primary btn-small" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
