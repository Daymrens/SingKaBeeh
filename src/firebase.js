import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update, onValue, off, get, child } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB42adc5s070ZEBXbckX44lRnJzuuxO3jk",
  authDomain: "singkabeeh.firebaseapp.com",
  databaseURL: "https://singkabeeh-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "singkabeeh",
  storageBucket: "singkabeeh.firebasestorage.app",
  messagingSenderId: "949360159011",
  appId: "1:949360159011:web:5d2d23d3065b9a163a4496",
  measurementId: "G-4K1YZZWZ1C"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function gameExists(code) {
  const snap = await get(child(ref(db), `games/${code}`));
  return snap.exists();
}

export function createGame(code, hostId, hostName, songs) {
  const songsObj = {};
  songs.forEach(s => { songsObj[s.id] = s; });
  return set(ref(db, `games/${code}`), {
    config: { hostId, status: 'waiting' },
    hosts: {
      [hostId]: { name: hostName, joinedAt: Date.now() }
    },
    players: {
      [hostId]: { name: hostName, score: 0, handRaisedAt: null, joinedAt: Date.now() }
    },
    gameState: { round: 0, phase: 'idle', answeredPlayerId: null },
    songs: songsObj,
    shuffledSongIds: null
  });
}

export function joinGame(code, playerId, playerName) {
  return set(ref(db, `games/${code}/players/${playerId}`), {
    name: playerName,
    score: 0,
    handRaisedAt: null,
    joinedAt: Date.now()
  });
}

export function addHost(code, playerId, playerName) {
  return set(ref(db, `games/${code}/hosts/${playerId}`), {
    name: playerName,
    joinedAt: Date.now()
  });
}

export function removeHost(code, playerId) {
  return set(ref(db, `games/${code}/hosts/${playerId}`), null);
}

export function leaveGame(code, playerId) {
  return set(ref(db, `games/${code}/players/${playerId}`), null);
}

export function listenGame(code, callback) {
  const gameRef = ref(db, `games/${code}`);
  const listener = onValue(gameRef, (snap) => callback(snap.val()));
  return () => off(gameRef, 'value', listener);
}

export function updateGameConfig(code, updates) {
  return update(ref(db, `games/${code}/config`), updates);
}

export function updateGameState(code, state) {
  return update(ref(db, `games/${code}/gameState`), state);
}

export function raiseHand(code, playerId) {
  return set(ref(db, `games/${code}/players/${playerId}/handRaisedAt`), Date.now());
}

export function clearHands(code, players) {
  const updates = {};
  Object.keys(players).forEach(pid => {
    updates[`games/${code}/players/${pid}/handRaisedAt`] = null;
  });
  return update(ref(db), updates);
}

export function setPlayerScore(code, playerId, score) {
  return set(ref(db, `games/${code}/players/${playerId}/score`), score);
}

export function clearPlayerHand(code, playerId) {
  return set(ref(db, `games/${code}/players/${playerId}/handRaisedAt`), null);
}

export function saveSongsToFirebase(code, songs) {
  const songsObj = {};
  songs.forEach(s => { songsObj[s.id] = s; });
  return set(ref(db, `games/${code}/songs`), songsObj);
}

export function setShuffledSongIds(code, ids) {
  return set(ref(db, `games/${code}/shuffledSongIds`), ids);
}
