import { useState } from 'react';

export default function JoinScreen({ mode, onCreate, onJoin, onBack }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreate(name.trim());
    } catch (e) {
      setError('Failed to create game. Check Firebase connection.');
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim() || code.length !== 6) { setError('Enter a valid 6-digit code'); return; }
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await onJoin(code.trim(), name.trim());
      if (result?.error) { setError(result.error); setLoading(false); }
    } catch (e) {
      setError('Failed to join game.');
      setLoading(false);
    }
  };

  if (mode === 'create') {
    return (
      <div className="screen active fade-in">
        <div className="join-box">
          <button className="back-btn" onClick={onBack} title="Back">←</button>
          <div className="emoji-header">🎤</div>
          <h1>Create Game</h1>
          <p className="join-label">Enter your name (host)</p>
          <input className="join-input" placeholder="Your name..." value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }} autoFocus />
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? '⏳ Creating...' : '🎮 Create Game'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active fade-in">
      <div className="join-box">
          <button className="back-btn" onClick={onBack} title="Back">←</button>
          <div className="emoji-header">🎤</div>
          <h1>Join Game</h1>
          <p className="join-label">Enter game code</p>
          <input className="join-input code-input" placeholder="000000" maxLength={6}
            value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }} autoFocus />
          <p className="join-label">Your name</p>
          <input className="join-input" placeholder="Your name..." value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }} />
        {error && <p className="login-error">{error}</p>}
        <button className="btn btn-primary" onClick={handleJoin} disabled={loading}>
          {loading ? '⏳ Joining...' : '🎮 Join Game'}
        </button>
      </div>
    </div>
  );
}
