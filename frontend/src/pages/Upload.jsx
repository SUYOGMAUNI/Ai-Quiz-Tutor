import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setSelectedFile(file);
    setError('');
    setUploading(true);
    setProgress(0);
    const form = new FormData();
    form.append('file', file);
    try {
      await client.post('/pdfs/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setProgress(100);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Upload failed. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const fmtSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .upload-page {
          min-height: 100vh;
          background: #0d0f1a;
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf0;
          padding: 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .upload-inner {
          width: 100%;
          max-width: 580px;
          animation: fadeUp 0.45s ease both;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; text-decoration: none; font-size: 0.85rem; margin-bottom: 2rem; transition: color 0.2s; }
        .back-link:hover { color: #f0a500; }
        .upload-heading { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #fff 30%, #f0a500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.4rem; }
        .upload-sub { color: #6b7280; font-size: 0.87rem; font-weight: 300; margin-bottom: 2rem; }

        .drop-zone {
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 20px;
          background: #161928;
          padding: 4rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .drop-zone:hover { border-color: rgba(240,165,0,0.4); background: #1a1e30; }
        .drop-zone.drag-over { border-color: #f0a500; background: rgba(240,165,0,0.05); transform: scale(1.01); }
        .drop-zone.has-file { border-color: rgba(34,197,94,0.4); }
        .drop-zone.uploading-state { cursor: default; border-color: rgba(240,165,0,0.3); }
        .drop-icon {
          font-size: 3.5rem;
          margin-bottom: 1.2rem;
          display: block;
          transition: transform 0.3s;
        }
        .drop-zone:hover .drop-icon { transform: translateY(-4px); }
        .drop-title { font-size: 1rem; font-weight: 500; color: #e8eaf0; margin-bottom: 0.4rem; }
        .drop-hint { font-size: 0.82rem; color: #6b7280; font-weight: 300; }
        .drop-hint span { color: #f0a500; font-weight: 500; cursor: pointer; }
        .drop-hint span:hover { text-decoration: underline; }
        .file-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-top: 1.5rem;
          text-align: left;
          animation: fadeUp 0.3s ease;
        }
        .file-badge-icon { font-size: 1.5rem; }
        .file-badge-name { font-size: 0.88rem; font-weight: 500; color: #e8eaf0; }
        .file-badge-size { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }

        .progress-wrap { margin-top: 1.5rem; }
        .progress-label { display: flex; justify-content: space-between; font-size: 0.78rem; color: #6b7280; margin-bottom: 6px; }
        .progress-track { height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #f0a500, #fbbf24); border-radius: 3px; transition: width 0.3s ease; }
        .progress-fill.done { background: #22c55e; }

        .error-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          font-size: 0.83rem;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          margin-top: 1rem;
        }

        .hints { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
        .hint-item {
          flex: 1;
          min-width: 140px;
          background: #161928;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1rem;
          font-size: 0.8rem;
        }
        .hint-icon { font-size: 1.2rem; margin-bottom: 0.4rem; }
        .hint-title { font-weight: 500; color: #e8eaf0; margin-bottom: 3px; }
        .hint-desc { color: #6b7280; font-weight: 300; line-height: 1.5; }
      `}</style>

      <div className="upload-page">
        <div className="upload-inner">
          <Link to="/dashboard" className="back-link">← Library</Link>
          <h1 className="upload-heading">Upload PDF</h1>
          <p className="upload-sub">We'll extract the content and generate quiz questions automatically.</p>

          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile && !uploading ? 'has-file' : ''} ${uploading ? 'uploading-state' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={onInputChange}
            />
            <span className="drop-icon">
              {uploading ? '⏳' : selectedFile ? '✅' : '📄'}
            </span>
            {uploading ? (
              <>
                <p className="drop-title">Uploading & processing…</p>
                <p className="drop-hint">AI is reading your PDF and generating questions</p>
              </>
            ) : selectedFile ? (
              <p className="drop-title">File ready — click to change</p>
            ) : (
              <>
                <p className="drop-title">Drop your PDF here</p>
                <p className="drop-hint">or <span onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>browse files</span> · PDF only</p>
              </>
            )}
          </div>

          {selectedFile && !uploading && (
            <div className="file-badge">
              <span className="file-badge-icon">📄</span>
              <div>
                <p className="file-badge-name">{selectedFile.name}</p>
                <p className="file-badge-size">{fmtSize(selectedFile.size)}</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>{progress === 100 ? 'Processing…' : 'Uploading…'}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${progress === 100 ? 'done' : ''}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <div className="error-box">⚠ {error}</div>}

          <div className="hints">
            {[
              { icon: '🤖', title: 'AI-Powered', desc: 'Questions generated from your content only' },
              { icon: '⚡', title: 'Fast', desc: 'Ready in under 60 seconds' },
              { icon: '📊', title: 'Tracked', desc: 'Your scores are saved automatically' },
            ].map(h => (
              <div key={h.title} className="hint-item">
                <div className="hint-icon">{h.icon}</div>
                <div className="hint-title">{h.title}</div>
                <div className="hint-desc">{h.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: '#374151', fontWeight: 300 }}>
            Made by <a href="https://suyogmauni.com.np/" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'none' }}
              onMouseOver={e => e.target.style.color='#f0a500'} onMouseOut={e => e.target.style.color='#4b5563'}>Suyog Mauni</a>
          </p>
        </div>
      </div>
    </>
  );
}