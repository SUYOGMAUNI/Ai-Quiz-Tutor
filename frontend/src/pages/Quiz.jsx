import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import QuizCard from '../components/QuizCard';
import Timer from '../components/Timer';

const QUIZ_SECONDS = 600;

export default function Quiz() {
  const { pdfId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState({});
  const [direction, setDirection] = useState('right');

  useEffect(() => {
    client.get(`/quiz/${pdfId}?limit=10`).then(({ data }) => {
      setQuestions(data);
    }).catch(() => setQuestions([])).finally(() => setLoading(false));
  }, [pdfId]);

  const submitAnswer = (questionId, selected, onResult) => {
    client.post('/quiz/submit', { question_id: questionId, selected }).then(({ data }) => {
      setAnswered(prev => ({ ...prev, [questionId]: { selected, correct: data.correct, correctAnswer: data.correct_answer } }));
      onResult(data);
    });
  };

  const goTo = (newIndex) => {
    setDirection(newIndex > index ? 'right' : 'left');
    setIndex(newIndex);
  };

  const score = Object.values(answered).filter(a => a.correct).length;
  const total = questions.length;
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  if (loading) return (
    <>
      <style>{QUIZ_STYLES}</style>
      <div className="quiz-page"><div className="q-loading"><div className="q-spinner" /><p>Loading questions…</p></div></div>
    </>
  );
  if (questions.length === 0) return (
    <>
      <style>{QUIZ_STYLES}</style>
      <div className="quiz-page"><div className="q-empty"><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div><p>No questions for this PDF yet.</p></div></div>
    </>
  );

  const current = questions[index];
  const answeredCount = Object.keys(answered).length;

  return (
    <>
      <style>{QUIZ_STYLES}</style>
      <div className="quiz-page">
        <div className="quiz-inner">
          <div className="quiz-topbar">
            <div className="quiz-meta">
              <span className="q-count">Q {index + 1}<span className="q-total">/{total}</span></span>
              {answeredCount > 0 && (
                <span className="score-badge">
                  ✓ {score}/{answeredCount}
                </span>
              )}
            </div>
            <Timer seconds={QUIZ_SECONDS} onExpire={() => {}} />
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="question-dots">
            {questions.map((q, i) => {
              const a = answered[q.id];
              return (
                <button
                  key={q.id}
                  className={`q-dot ${i === index ? 'active' : ''} ${a ? (a.correct ? 'correct' : 'wrong') : ''}`}
                  onClick={() => goTo(i)}
                  title={`Question ${i + 1}`}
                />
              );
            })}
          </div>

          <div className={`card-wrap anim-${direction}`} key={current.id}>
            <QuizCard
              question={current}
              onSubmit={submitAnswer}
              previousAnswer={answered[current.id]}
            />
          </div>

          <div className="quiz-nav">
            <button
              onClick={() => goTo(Math.max(0, index - 1))}
              disabled={index === 0}
              className="nav-btn"
            >
              ← Prev
            </button>

            <div className="nav-center">
              {answeredCount === total && total > 0 && (
                <div className="final-score">
                  🎉 {score}/{total} correct · {Math.round((score/total)*100)}%
                </div>
              )}
            </div>

            <button
              onClick={() => goTo(Math.min(total - 1, index + 1))}
              disabled={index === total - 1}
              className="nav-btn nav-btn-next"
            >
              Next →
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#374151', fontWeight: 300 }}>
            Made by <a href="https://suyogmauni.com.np/" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'none' }}
              onMouseOver={e => e.target.style.color='#f0a500'} onMouseOut={e => e.target.style.color='#4b5563'}>Suyog Mauni</a>
          </p>
        </div>
      </div>
    </>
  );
}

const QUIZ_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .quiz-page {
    min-height: 100vh;
    background: #0d0f1a;
    font-family: 'DM Sans', sans-serif;
    color: #e8eaf0;
    padding: 2.5rem 1.5rem;
  }
  .quiz-inner { max-width: 680px; margin: 0 auto; }
  .quiz-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
  .quiz-meta { display: flex; align-items: center; gap: 12px; }
  .q-count { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #fff; }
  .q-total { color: #4b5563; font-size: 1rem; }
  .score-badge {
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.2);
    color: #4ade80;
    font-size: 0.78rem;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
  }
  .progress-track {
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f0a500, #fbbf24);
    border-radius: 2px;
    transition: width 0.4s ease;
  }
  .question-dots {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 1.75rem;
  }
  .q-dot {
    width: 28px; height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }
  .q-dot:hover { background: rgba(255,255,255,0.15); }
  .q-dot.active { background: #f0a500; }
  .q-dot.correct { background: #22c55e; }
  .q-dot.wrong { background: #ef4444; }

  .card-wrap {
    animation: slideInRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  .card-wrap.anim-left { animation-name: slideInLeft; }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

  .quiz-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; }
  .nav-btn {
    padding: 0.6rem 1.4rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #161928;
    color: #e8eaf0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.87rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nav-btn:hover:not(:disabled) { background: #1e2235; border-color: rgba(240,165,0,0.3); }
  .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .nav-btn-next { background: #f0a500; color: #000; border-color: transparent; font-weight: 500; }
  .nav-btn-next:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(240,165,0,0.3); }
  .nav-center { flex: 1; text-align: center; }
  .final-score {
    display: inline-block;
    background: rgba(240,165,0,0.1);
    border: 1px solid rgba(240,165,0,0.2);
    color: #f0a500;
    padding: 0.45rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    animation: fadeUp 0.4s ease both;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .q-loading, .q-empty {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    gap: 1rem;
  }
  .q-spinner { width: 36px; height: 36px; border: 2px solid rgba(255,255,255,0.06); border-top-color: #f0a500; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* QuizCard dark overrides */
  .card-wrap > * {
    background: #161928 !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 16px !important;
    box-shadow: none !important;
  }
  .card-wrap p, .card-wrap h2, .card-wrap h3, .card-wrap div {
    color: #e8eaf0 !important;
    background: transparent !important;
    border: none !important;
  }
  .card-wrap label {
    display: flex !important;
    align-items: flex-start !important;
    gap: 10px !important;
    padding: 0.75rem 1rem !important;
    border-radius: 10px !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    background: #1e2235 !important;
    color: #d1d5db !important;
    font-size: 0.9rem !important;
    margin-bottom: 0.5rem !important;
  }
  .card-wrap label:hover {
    border-color: rgba(240,165,0,0.4) !important;
    background: #252840 !important;
    color: #fff !important;
  }
  .card-wrap input[type="radio"] { accent-color: #f0a500; }
  .card-wrap button {
    background: #f0a500 !important;
    color: #000 !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 0.6rem 1.6rem !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    font-family: "DM Sans", sans-serif !important;
    transition: all 0.2s !important;
    font-size: 0.9rem !important;
  }
  .card-wrap button:hover { transform: translateY(-2px) !important; box-shadow: 0 4px 16px rgba(240,165,0,0.3) !important; }
  .card-wrap button:disabled { opacity: 0.5 !important; cursor: not-allowed !important; transform: none !important; }
`;