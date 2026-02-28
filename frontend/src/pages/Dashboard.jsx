import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    client.get('/pdfs/').then(({ data }) => {
      setPdfs(data);
    }).catch(() => setPdfs([])).finally(() => {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const handleDelete = async (pdfId, filename) => {
    if (!window.confirm(`Delete "${filename}"? This will remove all its questions and stats.`)) return;
    setDeleting(pdfId);
    try {
      await client.delete(`/pdfs/${pdfId}`);
      setPdfs((prev) => prev.filter((p) => p.id !== pdfId));
    } catch {
      alert('Failed to delete PDF. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --bg: #0d0f1a;
          --surface: #161928;
          --surface2: #1e2235;
          --border: rgba(255,255,255,0.07);
          --amber: #f0a500;
          --amber-dim: rgba(240,165,0,0.12);
          --text: #e8eaf0;
          --muted: #6b7280;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }

        .dash-wrap {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          padding: 3rem 1.5rem;
        }
        .dash-inner {
          max-width: 860px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .dash-inner.in { opacity: 1; transform: translateY(0); }

        .dash-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
        }
        .dash-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 30%, var(--amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dash-subtitle { color: var(--muted); font-size: 0.85rem; margin-top: 4px; font-weight: 300; }
        .upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--amber);
          color: #000;
          padding: 0.55rem 1.2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.88rem;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(240,165,0,0.25);
        }
        .upload-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 28px rgba(240,165,0,0.4); }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          border: 1px dashed var(--border);
          border-radius: 20px;
          background: var(--surface);
        }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .empty-state p { color: var(--muted); margin-bottom: 1.5rem; }
        .empty-link {
          display: inline-block;
          background: var(--amber);
          color: #000;
          padding: 0.6rem 1.4rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .empty-link:hover { transform: translateY(-2px); }

        .pdf-list { display: flex; flex-direction: column; gap: 1rem; }
        .pdf-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          transition: all 0.25s ease;
          animation: slideIn 0.4s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .pdf-card:hover { background: var(--surface2); border-color: rgba(240,165,0,0.2); transform: translateX(4px); }

        .pdf-icon {
          width: 42px; height: 42px;
          background: var(--amber-dim);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .pdf-info { flex: 1; min-width: 0; }
        .pdf-name {
          font-weight: 500;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text);
        }
        .pdf-meta { color: var(--muted); font-size: 0.78rem; margin-top: 3px; font-weight: 300; }
        .chunk-badge {
          display: inline-block;
          background: var(--amber-dim);
          color: var(--amber);
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 20px;
          margin-right: 6px;
          font-weight: 500;
        }

        .pdf-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .btn {
          padding: 0.45rem 1rem;
          border-radius: 9px;
          font-size: 0.82rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary { background: var(--amber); color: #000; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(240,165,0,0.35); }
        .btn-ghost { background: transparent; color: #6b7280; border: 1px solid rgba(255,255,255,0.1); }
        .btn-ghost:hover { background: var(--surface2); color: #9ca3af; border-color: rgba(255,255,255,0.18); }
        .btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.15); }
        .btn-danger:hover { background: rgba(239,68,68,0.2); }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

        .made-by {
          text-align: center;
          margin-top: 3rem;
          font-size: 0.75rem;
          color: #374151;
          font-weight: 300;
        }
        .made-by a {
          color: #4b5563;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 400;
        }
        .made-by a:hover { color: var(--amber); }
        .loading-wrap {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 32px; height: 32px;
          border: 2px solid var(--border);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="dash-wrap">
          <div className={`dash-inner ${visible ? 'in' : ''}`}>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Your Library</h1>
                <p className="dash-subtitle">{pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''} · ready to study</p>
              </div>
              <Link to="/upload" className="upload-btn">
                <span>＋</span> Upload PDF
              </Link>
            </div>

            {pdfs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <p>No PDFs yet. Upload one to generate quiz questions.</p>
                <Link to="/upload" className="empty-link">Upload your first PDF</Link>
              </div>
            ) : (
              <ul className="pdf-list" style={{ listStyle: 'none' }}>
                {pdfs.map((pdf, i) => (
                  <li key={pdf.id} className="pdf-card" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-info">
                      <p className="pdf-name">{pdf.filename}</p>
                      <p className="pdf-meta">
                        <span className="chunk-badge">{pdf.chunk_count} chunks</span>
                        {new Date(pdf.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="pdf-actions">
                      <Link to={`/quiz/${pdf.id}`} className="btn btn-primary">▶ Quiz</Link>
                      <Link to={`/stats/${pdf.id}`} className="btn btn-ghost">Stats</Link>
                      <button
                        onClick={() => handleDelete(pdf.id, pdf.filename)}
                        disabled={deleting === pdf.id}
                        className="btn btn-danger"
                      >
                        {deleting === pdf.id ? '…' : '✕'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="made-by">Made by <a href="https://suyogmauni.com.np/" target="_blank" rel="noopener noreferrer">Suyog Mauni</a></p>
        </div>
      )}
    </>
  );
}