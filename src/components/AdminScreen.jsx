import { useState, useRef, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { saveSongs, exportSongs, importSongs } from '../utils/adminStorage';
import { cropAudio } from '../utils/wavEncoder';

export default function AdminScreen({ songs, onSave, onBack }) {
  const [editingId, setEditingId] = useState(null);
  const [dirty, setDirty] = useState(false);

  const editing = songs.find(s => s.id === editingId) || null;
  const sorted = [...songs].sort((a, b) => a.id - b.id);

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
          <button className="btn btn-primary btn-small add-song-btn" onClick={handleAdd}>+ Add Song</button>
          {sorted.map(s => (
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
  const waveRef = useRef(null);
  const waveSurferRef = useRef(null);

  useEffect(() => {
    return () => { if (waveSurferRef.current) { waveSurferRef.current.destroy(); waveSurferRef.current = null; } };
  }, []);

  useEffect(() => {
    if (cropBlob) {
      const url = URL.createObjectURL(cropBlob);
      onChange('file', url);
    }
  }, [cropBlob]);

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
    setWaveformLoaded(true);
    ws.load(url);
    ws.on('ready', () => {
      setCropStart(0);
      setCropEnd(ws.getDuration());
    });
    ws.on('timeupdate', () => {});
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

  const handleCrop = async () => {
    if (!audioFile || cropStart >= cropEnd) return;
    try {
      const blob = await cropAudio(audioFile, cropStart, cropEnd);
      setCropBlob(blob);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `song-${String(song.id).padStart(2, '0')}-cropped.wav`;
      a.click();
    } catch (err) {
      alert('Crop failed: ' + err.message);
    }
  };

  const existingAudio = song.file && !song.file.startsWith('blob:') ? song.file : null;

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
              <button className="btn btn-secondary btn-small" onClick={() => waveSurferRef.current?.play()}>
                ▶ Preview Waveform
              </button>
              {audioFile && (
                <button className="btn btn-primary btn-small" onClick={handleCrop}
                  disabled={cropStart >= cropEnd}>
                  ✂ Crop & Download
                </button>
              )}
            </div>
            {cropBlob && <p className="crop-success">✓ Cropped! Downloaded as <strong>song-{String(song.id).padStart(2, '0')}-cropped.wav</strong></p>}
          </div>
        )}

        {!audioFile && existingAudio && !waveformLoaded && (
          <div className="cropper-existing">
            <p>Existing audio: <strong>{song.file}</strong></p>
            <div className="crop-buttons">
              <button className="btn btn-secondary btn-small"
                onClick={() => { const a = new Audio(song.file); a.play(); }}>▶ Preview</button>
              <button className="btn btn-secondary btn-small"
                onClick={() => initWaveSurfer(song.file)}>Load Waveform</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
