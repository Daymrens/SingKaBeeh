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

export function playRollSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const dur = 2;
  const sr = ctx.sampleRate;
  const len = sr * dur;
  const noise = ctx.createBuffer(1, len, sr);
  const data = noise.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = 1 - t / dur;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = noise;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3000;
  bp.frequency.linearRampToValueAtTime(400, ctx.currentTime + dur);
  bp.Q.value = 0.5;

  const g = ctx.createGain();
  g.gain.value = 0.3;
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);

  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start();

  let landed = false;
  return () => {
    if (landed) return;
    landed = true;
    try {
      src.stop();
      const osc = ctx.createOscillator();
      const gg = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gg.gain.setValueAtTime(0.2, ctx.currentTime);
      gg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gg);
      gg.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => ctx.close(), 600);
    } catch {}
  };
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
