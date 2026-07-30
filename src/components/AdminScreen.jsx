import { useState, useRef, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/plugins/regions';
import { saveSongs, exportSongs, importSongs } from '../utils/adminStorage';
import { cropAudio } from '../utils/wavEncoder';

export default function AdminScreen({ songs, onSave, onBack }) {
  const [editingId, setEditingId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState('');

  const editing = songs.find(s => s.id === editingId) || null;
  const sorted = [...songs].sort((a, b) => a.id - b.id);
  const filtered = search ? sorted.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.toLowerCase().includes(search.toLowerCase()) ||
    s.hint?.toLowerCase().includes(search.toLowerCase())
  ) : sorted;

  const handleSelect = (id) => { setEditingId(id); setDirty(false); };

  const handleFieldChange = (field, value) => {
    setDirty(true);
    onSave(songs.map(s => s.id === editingId ? { ...s, [field]: value } : s));
  };

  const handleAdd = () => {
    const maxId = songs.reduce((m, s) => Math.max(m, s.id), 0);
    const newSong = { id: maxId + 1, title: 'New Song', artist: '', file: '', lyrics: '____', answer: '', hint: '' };
    onSave([...songs, newSong]);
    setEditingId(newSong.id);
    setDirty(true);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this song?')) return;
    onSave(songs.filter(s => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="screen active admin-screen">
      <div className="admin-header">
        <h2>🎤 Admin Panel</h2>
        <div className="admin-header-actions">
          <button className="btn btn-secondary btn-small" onClick={() => exportSongs(songs)}>📥 Export JSON</button>
          <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer' }}>
            📤 Import JSON
            <input type="file" accept=".json" style={{ display: 'none' }}
              onChange={async (e) => {
                try {
                  const data = await importSongs(e.target.files[0]);
                  onSave(data);
                  setEditingId(null);
                } catch (_) { alert('Invalid JSON file'); }
                e.target.value = '';
              }} />
          </label>
          <button className="btn btn-secondary btn-small" onClick={onBack}>✕ Close</button>
        </div>
      </div>

      <div className="admin-body">
        <div className="admin-sidebar">
          <input className="admin-search" placeholder="🔍 Search songs..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary btn-small add-song-btn" onClick={handleAdd}>+ Add Song</button>
          {filtered.map(s => (
            <div key={s.id}
              className={`admin-song-item${s.id === editingId ? ' active' : ''}`}
              onClick={() => handleSelect(s.id)}>
              <span className="admin-song-num">#{s.id}</span>
              <span className="admin-song-title">{s.title || 'Untitled'}</span>
              <button className="admin-del-btn" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>✕</button>
            </div>
          ))}
        </div>

        <div className="admin-content">
          {editing ? (
            <SongEditor key={editing.id} song={editing} onChange={handleFieldChange} songs={songs} onSave={onSave} />
          ) : (
            <div className="admin-empty">Select a song to edit</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SongEditor({ song, onChange, songs, onSave }) {
  const [audioFile, setAudioFile] = useState(null);
  const [cropStart, setCropStart] = useState(0);
  const [cropEnd, setCropEnd] = useState(0);
  const [cropBlob, setCropBlob] = useState(null);
  const [waveformLoaded, setWaveformLoaded] = useState(false);
const [playing, setPlaying] = useState(false);
  const [prevPlaying, setPrevPlaying] = useState(false);
  const previewRef = useRef(null);
  const waveRef = useRef(null);
  const waveSurferRef = useRef(null);
  const regionRef = useRef(null);
  const regionsRef = useRef(null);
  const cropEndRef = useRef(0);

  useEffect(() => {
    return () => {
      if (previewRef.current) { previewRef.current.pause(); previewRef.current = null; }
      if (waveSurferRef.current) { waveSurferRef.current.destroy(); waveSurferRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!cropBlob) return;
    const fileName = `Clips/song-${String(song.id).padStart(2, '0')}.wav`;
    const url = URL.createObjectURL(cropBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `song-${String(song.id).padStart(2, '0')}.wav`;
    a.click();
    const reader = new FileReader();
    reader.onload = () => {
      onChange('file', fileName);
      onChange('inlineAudio', reader.result);
      URL.revokeObjectURL(url);
    };
    reader.readAsDataURL(cropBlob);
  }, [cropBlob]);

  useEffect(() => {
    cropEndRef.current = cropEnd;
    const region = regionRef.current;
    if (region) {
      region.setOptions({ start: cropStart, end: cropEnd });
    }
  }, [cropStart, cropEnd]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        const ws = waveSurferRef.current;
        if (!ws) return;
        if (ws.isPlaying()) { ws.pause(); setPlaying(false); }
        else { ws.setTime(cropStart); ws.play(); setPlaying(true); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cropStart]);

  const initWaveSurfer = useCallback((url) => {
    if (waveSurferRef.current) { waveSurferRef.current.destroy(); }
    if (!waveRef.current) return;
    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: '#ffd700',
      progressColor: '#ff6b6b',
      cursorColor: '#fff',
      height: 120,
      barWidth: 2,
      barRadius: 2,
    });
    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;
    setWaveformLoaded(true);
    ws.load(url);
    ws.on('ready', () => {
      const duration = ws.getDuration();
      setCropStart(0);
      setCropEnd(duration);
      const region = regions.addRegion({
        start: 0,
        end: duration,
        color: 'rgba(255, 215, 0, 0.12)',
        drag: true,
        resize: true,
        minLength: 0.5,
      });
      regionRef.current = region;
      region.on('update', (side) => {
        setCropStart(region.start);
        setCropEnd(region.end);
      });
    });
    ws.on('timeupdate', (currentTime) => {
      if (currentTime >= cropEndRef.current) { ws.pause(); setPlaying(false); }
    });
    ws.on('finish', () => setPlaying(false));
    waveSurferRef.current = ws;
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    setCropBlob(null);
    setCropStart(0);
    setCropEnd(0);
    const url = URL.createObjectURL(file);
    initWaveSurfer(url);
  };

  const doCrop = async () => {
    if (!audioFile || cropStart >= cropEnd) return;
    const blob = await cropAudio(audioFile, cropStart, cropEnd);
    setCropBlob(blob);
    return blob;
  };

  const handleApplyCrop = async () => {
    if (!audioFile || cropStart >= cropEnd) return;
    try {
      await doCrop();
    } catch (err) {
      alert('Crop failed: ' + err.message);
    }
  };

  const handleLoadWaveform = async () => {
    if (!song.file) return;
    initWaveSurfer(song.file);
    setCropBlob(null);
    try {
      const resp = await fetch(song.file);
      if (resp.ok) {
        const blob = await resp.blob();
        setAudioFile(blob);
      }
    } catch (_) {
      // fetch not supported for this URL type (e.g. blob:), waveform still works
    }
  };

  const existingAudio = song.file ? song.file : null;

  return (
    <div className="song-editor">
      <div className="editor-form">
        <label>Title</label>
        <input value={song.title} onChange={e => onChange('title', e.target.value)} />

        <label>Artist</label>
        <input value={song.artist} onChange={e => onChange('artist', e.target.value)} />

        <label>Hint</label>
        <input value={song.hint} onChange={e => onChange('hint', e.target.value)} />

        <label>File Path</label>
        <input value={song.file} onChange={e => onChange('file', e.target.value)} placeholder="e.g. Songs/song-01.mp3" />

        <label>Lyrics <span className="editor-note">(use ____ for blank)</span></label>
        <textarea rows={5} value={song.lyrics} onChange={e => onChange('lyrics', e.target.value)} />

        <label>Answer</label>
        <textarea rows={3} value={song.answer} onChange={e => onChange('answer', e.target.value)} />
      </div>

      <div className="audio-cropper">
        <h3>Audio Cropper</h3>

        <div className="cropper-upload">
          <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer' }}>
            📂 Upload MP3 / WAV
            <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleUpload} />
          </label>
        </div>

        <div ref={waveRef} className="waveform-container"></div>

        {waveformLoaded && (
          <div className="cropper-controls">
            <div className="crop-sliders">
              <label>Start: {cropStart.toFixed(1)}s
                <input type="range" min={0} max={waveSurferRef.current?.getDuration() || 30} step={0.1}
                  value={cropStart} onChange={e => setCropStart(parseFloat(e.target.value))} />
              </label>
              <label>End: {cropEnd.toFixed(1)}s
                <input type="range" min={0} max={waveSurferRef.current?.getDuration() || 30} step={0.1}
                  value={cropEnd} onChange={e => setCropEnd(parseFloat(e.target.value))} />
              </label>
            </div>
            <div className="crop-buttons">
              <button className="btn btn-secondary btn-small"
                onClick={() => { const ws = waveSurferRef.current; if (!ws) return; if (ws.isPlaying()) { ws.pause(); setPlaying(false); } else { ws.setTime(cropStart); ws.play(); setPlaying(true); } }}>
                {playing ? '⏹ Stop' : '▶ Play'}
              </button>
              {audioFile && (
                <button className="btn btn-primary btn-small" onClick={handleApplyCrop}
                  disabled={cropStart >= cropEnd}>
                  ✂ Apply
                </button>
              )}
            </div>
            {cropBlob && <p className="crop-success">✓ Cropped and saved to song</p>}
          </div>
        )}

        {!audioFile && existingAudio && !waveformLoaded && (
          <div className="cropper-existing">
            <p>Existing audio: <strong>{song.file}</strong></p>
            <div className="crop-buttons">
              <button className="btn btn-secondary btn-small"
                onClick={() => { if (previewRef.current) { previewRef.current.pause(); previewRef.current = null; setPrevPlaying(false); } else { const a = new Audio(song.inlineAudio || song.file); a.onended = () => setPrevPlaying(false); a.play(); previewRef.current = a; setPrevPlaying(true); } }}>{prevPlaying ? '⏹ Stop' : '▶ Play'}</button>
              <button className="btn btn-secondary btn-small"
                onClick={handleLoadWaveform}>Load Waveform</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
