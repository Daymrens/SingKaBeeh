export function playTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 1200;
    g.gain.value = 0.15;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.05);
  } catch (_) {}
}

export function playRing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [800, 1000, 1200].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.08);
      o.stop(ctx.currentTime + i * 0.08 + 0.4);
    });
  } catch (_) {}
}

export function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    g.gain.value = 0.3;
    if (type === 'correct') {
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } else {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 200;
      o.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      o.connect(g);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    }
  } catch (_) {}
}
