import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password });
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-page {
          min-height: 100vh;
          background: #0d0f1a;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf0;
        }
        .auth-left {
          flex: 1;
          display: none;
          background: linear-gradient(145deg, #111428 0%, #0d0f1a 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 3rem;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media(min-width: 768px) { .auth-left { display: flex; } }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
        }
        .orb1 { width: 400px; height: 400px; background: #f0a500; top: -100px; left: -100px; }
        .orb2 { width: 300px; height: 300px; background: #3b5bdb; bottom: -80px; right: -60px; }
        .brand {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 30%, #f0a500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .auth-tagline {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          line-height: 1.25;
          color: #fff;
          position: relative;
        }
        .auth-tagline span { color: #f0a500; }
        .auth-desc { color: #6b7280; font-size: 0.9rem; margin-top: 0.75rem; font-weight: 300; line-height: 1.6; }

        .auth-right {
          flex: 0 0 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }
        @media(min-width: 768px) { .auth-right { flex: 0 0 420px; } }
        .auth-card {
          width: 100%;
          max-width: 380px;
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.4rem;
        }
        .auth-sub { color: #6b7280; font-size: 0.85rem; font-weight: 300; margin-bottom: 2rem; }

        .field { margin-bottom: 1.1rem; }
        .field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .input-wrap { position: relative; }
        .field input {
          width: 100%;
          background: #161928;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field input:focus {
          border-color: #f0a500;
          box-shadow: 0 0 0 3px rgba(240,165,0,0.1);
        }
        .field input.has-toggle { padding-right: 2.8rem; }
        .toggle-pw {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .toggle-pw:hover { color: #f0a500; }

        .error-msg {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          font-size: 0.82rem;
          padding: 0.6rem 0.9rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .submit-btn {
          width: 100%;
          padding: 0.8rem;
          background: #f0a500;
          color: #000;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(240,165,0,0.2);
          margin-top: 0.5rem;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(240,165,0,0.35); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.85rem; color: #6b7280; }
        .auth-footer a { color: #f0a500; text-decoration: none; font-weight: 500; }
        .auth-footer a:hover { text-decoration: underline; }
        .divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.5rem 0; }
        .divider hr { flex: 1; border: none; border-top: 1px solid rgba(255,255,255,0.07); }
        .divider span { color: #4b5563; font-size: 0.75rem; }
      `}</style>

      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-orb orb1" />
          <div className="auth-orb orb2" />
          <div className="brand">QuizMind</div>
          <div>
            <h2 className="auth-tagline">
              Turn any PDF into<br /><span>instant knowledge.</span>
            </h2>
            <p className="auth-desc">Upload lecture notes, textbooks, or any document and get AI-generated quizzes tailored to your content.</p>
          </div>
          <p style={{ color: '#374151', fontSize: '0.75rem' }}>© 2025 QuizMind</p>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-sub">Sign in to your account</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="has-toggle"
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(p => !p)}>
                    {showPw ? 'hide' : 'show'}
                  </button>
                </div>
              </div>
              {error && <div className="error-msg">⚠ {error}</div>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><div className="btn-spinner" /> Signing in…</> : 'Sign in'}
              </button>
            </form>

            <div className="auth-footer">
              No account? <Link to="/register">Create one</Link>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: '#374151', fontWeight: 300 }}>
              Made by <a href="https://suyogmauni.com.np/" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color='#f0a500'} onMouseOut={e => e.target.style.color='#4b5563'}>Suyog Mauni</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}