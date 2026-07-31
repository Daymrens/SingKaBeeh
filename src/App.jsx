import { useState, useEffect, useRef, useCallback } from 'react';
import DEFAULT_SONGS, { shuffleArray } from './data/songs';
import { loadSongs, saveSongs } from './utils/adminStorage';
import TitleScreen from './components/TitleScreen';
import JoinScreen from './components/JoinScreen';
import WaitingRoom from './components/WaitingRoom';
import GameHost from './components/GameHost';
import GamePlayer from './components/GamePlayer';
import AdminScreen from './components/AdminScreen';
import HowToPlayModal from './components/HowToPlayModal';
import ResultsScreen from './components/ResultsScreen';
import { generateCode, gameExists, createGame, joinGame, leaveGame, listenGame, updateGameConfig, saveSongsToFirebase, setShuffledSongIds, addHost } from './firebase';
import './App.css';

function generatePlayerId() {
  const existing = localStorage.getItem('sb-player-id');
  if (existing) return existing;
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem('sb-player-id', id);
  return id;
}

function saveSession(gameCode, role) {
  localStorage.setItem('sb-game-code', gameCode);
  localStorage.setItem('sb-role', role);
}

function clearSession() {
  localStorage.removeItem('sb-game-code');
  localStorage.removeItem('sb-role');
}

function getSavedSession() {
  const code = localStorage.getItem('sb-game-code');
  const role = localStorage.getItem('sb-role');
  if (code && role) return { code, role };
  return null;
}

export default function App() {
  const [screen, setScreen] = useState('title');
  const [gameCode, setGameCode] = useState(null);
  const [playerId] = useState(generatePlayerId);
  const [role, setRole] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [songs, setSongs] = useState(() => loadSongs(DEFAULT_SONGS));
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const saved = getSavedSession();
    if (!saved) return;
    gameExists(saved.code).then(exists => {
      if (!exists) { clearSession(); return; }
      setGameCode(saved.code);
      setRole(saved.role);
      setScreen('waiting');
    });
  }, []);

  useEffect(() => {
    if (!gameCode) return;
    const unsub = listenGame(gameCode, (data) => setGameData(data));
    return () => unsub();
  }, [gameCode]);

  const handleCreateGame = async (name) => {
    let code;
    do { code = generateCode(); } while (await gameExists(code));
    setGameCode(code);
    setRole('host');
    saveSession(code, 'host');
    const currentSongs = loadSongs(DEFAULT_SONGS);
    await createGame(code, playerId, name, currentSongs);
    setScreen('waiting');
  };

  const handleJoinGame = async (code, name) => {
    const exists = await gameExists(code);
    if (!exists) return { error: 'Game not found' };
    setGameCode(code);
    setRole('player');
    saveSession(code, 'player');
    await joinGame(code, playerId, name);
    setScreen('waiting');
  };

  const handleStartGame = async () => {
    const songList = gameData?.songs ? Object.values(gameData.songs) : [];
    const shuffled = [...songList];
    shuffleArray(shuffled);
    await setShuffledSongIds(gameCode, shuffled.map(s => s.id));
    await updateGameConfig(gameCode, { status: 'playing' });
    setScreen('game-host');
  };

  const handleLeaveGame = async () => {
    if (gameCode && playerId) await leaveGame(gameCode, playerId);
    clearSession();
    setGameCode(null);
    setRole(null);
    setGameData(null);
    setScreen('title');
  };

  const handleBackToTitle = () => {
    clearSession();
    setGameCode(null);
    setRole(null);
    setGameData(null);
    setScreen('title');
  };

  const handlePromoteHost = async (pid, name) => {
    if (!gameCode) return;
    const hostCount = gameData?.hosts ? Object.keys(gameData.hosts).length : 0;
    if (hostCount >= 3) return;
    await addHost(gameCode, pid, name);
  };

  const isHost = !!(gameData?.hosts && gameData.hosts[playerId]);

  const handleSaveSongs = useCallback((updated) => {
    setSongs(updated);
    saveSongs(updated);
    if (gameCode) saveSongsToFirebase(gameCode, updated);
  }, [gameCode]);

  useEffect(() => {
    if (!gameData || screen !== 'waiting') return;
    if (gameData.config?.status === 'playing') {
      const iAmHost = gameData.hosts && gameData.hosts[playerId];
      setScreen(iAmHost ? 'game-host' : 'game-player');
      setShowIntro(true);
    }
    if (gameData.config?.status === 'cancelled') {
      clearSession();
      setGameCode(null);
      setRole(null);
      setGameData(null);
      setScreen('title');
    }
  }, [gameData, role, playerId, screen]);

  useEffect(() => {
    if (!gameData || screen !== 'game-host' && screen !== 'game-player' && screen !== 'results') return;
    if (gameData.config?.status === 'cancelled') {
      clearSession();
      setGameCode(null);
      setRole(null);
      setGameData(null);
      setScreen('title');
    }
    if (gameData.config?.status === 'finished') {
      setShowIntro(false);
      setScreen('results');
    }
  }, [gameData, screen]);

  return (
    <div id="app">
      {screen === 'title' && (
        <TitleScreen
          onCreate={() => setScreen('join-host')}
          onJoin={() => setScreen('join-player')}
          onAdmin={() => setShowAdminLogin(true)}
        />
      )}

      {screen === 'join-host' && (
        <JoinScreen mode="create" onCreate={handleCreateGame} onBack={() => setScreen('title')} />
      )}

      {screen === 'join-player' && (
        <JoinScreen mode="join" onJoin={handleJoinGame} onBack={() => setScreen('title')} />
      )}

      {screen === 'waiting' && gameCode && (
        <WaitingRoom
          gameCode={gameCode}
          role={role}
          playerId={playerId}
          gameData={gameData}
          onStart={handleStartGame}
          onBack={handleLeaveGame}
          onPromoteHost={handlePromoteHost}
        />
      )}

      {screen === 'game-host' && gameCode && (
        <GameHost
          gameCode={gameCode}
          gameData={gameData}
          onBack={handleBackToTitle}
        />
      )}

      {screen === 'game-player' && gameCode && (
        <GamePlayer
          gameCode={gameCode}
          playerId={playerId}
          gameData={gameData}
        />
      )}

      {screen === 'results' && gameCode && gameData && (
        <ResultsScreen
          gameData={gameData}
          onHome={handleBackToTitle}
        />
      )}

      {showIntro && (screen === 'game-host' || screen === 'game-player') && (
        <HowToPlayModal
          role={gameData?.hosts && gameData.hosts[playerId] ? 'host' : 'player'}
          onClose={() => setShowIntro(false)}
        />
      )}

      {screen === 'admin' && (
        <AdminScreen songs={songs} onSave={handleSaveSongs} onBack={() => setScreen('title')} />
      )}

      {showAdminLogin && (
        <div className="admin-login-overlay" onClick={() => { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); }}>
          <div className="admin-login-box" onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); const ok = adminPass === '@dmin' || adminPass === '@dm1n'; if (ok) { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); setScreen('admin'); } else { setAdminError(true); } } }}>
            <h2>🔐 Admin Access</h2>
            <input type="password" value={adminPass} autoFocus
              onChange={e => { setAdminPass(e.target.value); setAdminError(false); }}
              placeholder="Enter password" className={adminError ? 'shake' : ''} />
            {adminError && <p className="login-error">Incorrect password</p>}
            <div className="login-btns">
              <button className="btn btn-primary btn-small"
                onClick={() => { const ok = adminPass === '@dmin' || adminPass === '@dm1n'; if (ok) { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); setScreen('admin'); } else { setAdminError(true); } }}>Login</button>
              <button className="btn btn-secondary btn-small"
                onClick={() => { setShowAdminLogin(false); setAdminPass(''); setAdminError(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
