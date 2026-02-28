import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import ScoreBoard from '../components/ScoreBoard';

export default function Stats() {
  const { pdfId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    client.get(`/stats/${pdfId}`).then(({ data }) => {
      setStats(data);
    }).catch(() => setStats(null)).finally(() => {
      setLoading(false);
      setTimeout(() => setVisible(true), 80);
    });
  }, [pdfId]);

  const attempts = stats?.by_difficulty
    ? [{ date: 'All', correct: stats.correct_count, total: stats.total_attempts, percent: stats.accuracy_percent }]
    : [];

  const difficultyConfig = {
    easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Easy' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium' },
    hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Hard' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .stats-page {
          min-height: 100vh;
          background: #0d0f1a;
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf0;
          padding: 3rem 1.5rem;
        }
        .stats-inner {
          max-width: 700px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s, transform 0.5s;
        }
        .stats-inner.in { opacity: 1; transform: translateY(0); }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          text-decoration: none;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: #f0a500; }
        .stats-heading {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 30%, #f0a500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
        }

        .stat-overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #161928;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        .stat-card:hover { border-color: rgba(240,165,0,0.2); transform: translateY(-3px); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: #f0a500;
        }
        .stat-label { font-size: 0.78rem; color: #6b7280; margin-top: 4px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.05em; }

        .accuracy-ring-wrap {
          background: #161928;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          animation: fadeUp 0.45s 0.1s ease both;
        }
        .ring-svg { flex-shrink: 0; }
        .ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
        .ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center; transform: rotate(-90deg); }
        .ring-label { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; fill: #f0a500; text-anchor: middle; dominant-baseline: middle; }
        .ring-sub { font-size: 0.65rem; fill: #6b7280; text-anchor: middle; }
        .ring-info h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem; }
        .ring-info p { color: #6b7280; font-size: 0.85rem; font-weight: 300; line-height: 1.6; }

        .diff-section { margin-bottom: 2rem; animation: fadeUp 0.45s 0.2s ease both; }
        .section-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 1rem; font-weight: 500; }
        .diff-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #161928;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          margin-bottom: 0.75rem;
          transition: all 0.2s;
        }
        .diff-row:hover { background: #1e2235; }
        .diff-tag {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 20px;
          min-width: 64px;
          text-align: center;
        }
        .diff-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .diff-bar { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .diff-nums { font-size: 0.82rem; color: #9ca3af; min-width: 80px; text-align: right; }
        .diff-pct { font-weight: 500; font-size: 0.88rem; }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          border: 1px dashed rgba(255,255,255,0.07);
          border-radius: 20px;
          background: #161928;
        }
        .empty-state p { color: #6b7280; margin-bottom: 1.5rem; }
        .quiz-link {
          display: inline-block;
          background: #f0a500;
          color: #000;
          padding: 0.6rem 1.4rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .quiz-link:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(240,165,0,0.3); }
        .loading-page { min-height: 100vh; background: #0d0f1a; display: flex; align-items: center; justify-content: center; }
        .spinner { width: 32px; height: 32px; border: 2px solid rgba(255,255,255,0.06); border-top-color: #f0a500; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ScoreBoard dark overrides */
        .stats-inner * {
          background-color: transparent !important;
          color: #d1d5db !important;
          border-color: rgba(255,255,255,0.08) !important;
          box-shadow: none !important;
        }
        .stats-inner > div:last-of-type,
        .stats-inner [class] {
          background-color: #161928 !important;
          border-radius: 14px !important;
        }
        .stats-inner table { width: 100%; border-collapse: collapse; }
        .stats-inner th {
          background-color: #1e2235 !important;
          color: #9ca3af !important;
          font-size: 0.75rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          padding: 0.65rem 1rem !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }
        .stats-inner td {
          padding: 0.65rem 1rem !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          font-size: 0.88rem !important;
        }
        .stats-inner tr:last-child td { border-bottom: none !important; }
        .stats-inner h2, .stats-inner h3 { color: #e8eaf0 !important; font-size: 0.95rem !important; margin-bottom: 0.75rem !important; }
        .stats-inner [class*="score"],
        .stats-inner [class*="Score"],
        .stats-inner > div:last-of-type > div {
          background: #161928 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 14px !important;
          color: #e8eaf0 !important;
          box-shadow: none !important;
        }
        .stats-inner table {
          width: 100%;
          border-collapse: collapse;
          color: #d1d5db !important;
        }
        .stats-inner th {
          background: #1e2235 !important;
          color: #9ca3af !important;
          font-size: 0.75rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          padding: 0.6rem 1rem !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          font-weight: 500 !important;
        }
        .stats-inner td {
          padding: 0.65rem 1rem !important;
          color: #d1d5db !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          background: transparent !important;
          font-size: 0.88rem !important;
        }
        .stats-inner tr:last-child td { border-bottom: none !important; }
        .stats-inner tr:hover td { background: rgba(255,255,255,0.03) !important; }
        .stats-inner h2, .stats-inner h3 { color: #e8eaf0 !important; }
      `}</style>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="stats-page">
          <div className={`stats-inner ${visible ? 'in' : ''}`}>
            <Link to="/dashboard" className="back-link">← Back to Library</Link>
            <h1 className="stats-heading">Performance Stats</h1>

            {!stats ? (
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p>No quiz attempts yet for this PDF.</p>
                <Link to={`/quiz/${pdfId}`} className="quiz-link">Take a Quiz</Link>
              </div>
            ) : (
              <>
                <div className="stat-overview">
                  {[
                    { value: stats.total_attempts, label: 'Attempts' },
                    { value: stats.correct_count, label: 'Correct' },
                    { value: `${stats.accuracy_percent}%`, label: 'Accuracy' },
                  ].map((s, i) => (
                    <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="accuracy-ring-wrap">
                  <AccuracyRing percent={stats.accuracy_percent} />
                  <div className="ring-info">
                    <h3>Overall Accuracy</h3>
                    <p>You've answered {stats.correct_count} out of {stats.total_attempts} questions correctly across all difficulty levels.</p>
                  </div>
                </div>

                {stats.by_difficulty && Object.keys(stats.by_difficulty).length > 0 && (
                  <div className="diff-section">
                    <p className="section-title">By Difficulty</p>
                    {Object.entries(stats.by_difficulty).map(([diff, d]) => {
                      const cfg = difficultyConfig[diff] || { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: diff };
                      const pct = typeof d.accuracy === 'number' ? d.accuracy : 0;
                      return (
                        <div key={diff} className="diff-row">
                          <span className="diff-tag" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                          <div className="diff-bar-wrap">
                            <div className="diff-bar" style={{ width: `${pct}%`, background: cfg.color }} />
                          </div>
                          <span className="diff-nums">
                            {d.correct}/{d.total} · <span className="diff-pct" style={{ color: cfg.color }}>{pct}%</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <ScoreBoard attempts={attempts} title="Summary" />
              </>
            )}
            <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: '#374151', fontWeight: 300 }}>
              Made by <a href="https://suyogmauni.com.np/" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color='#f0a500'} onMouseOut={e => e.target.style.color='#4b5563'}>Suyog Mauni</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function AccuracyRing({ percent = 0 }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = percent >= 70 ? '#22c55e' : percent >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="110" height="110" className="ring-svg" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} className="ring-bg" />
      <circle
        cx="55" cy="55" r={r}
        className="ring-fill"
        stroke={color}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
      <text x="55" y="52" className="ring-label">{percent}%</text>
      <text x="55" y="66" className="ring-sub">accuracy</text>
    </svg>
  );
}