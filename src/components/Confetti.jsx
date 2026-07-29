const COLORS = ['#ffd700','#ff6b6b','#00d4ff','#00b894','#a29bfe','#fd79a8','#fdcb6e'];

export default function Confetti() {
  return (
    <div className="confetti-wrap">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: Math.random() * 100 + '%',
            background: COLORS[Math.floor(Math.random() * COLORS.length)],
            width: (6 + Math.random() * 8) + 'px',
            height: (6 + Math.random() * 8) + 'px',
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDuration: (1 + Math.random() * 1.2) + 's',
            animationDelay: Math.random() * 0.4 + 's',
          }}
        />
      ))}
    </div>
  );
}
