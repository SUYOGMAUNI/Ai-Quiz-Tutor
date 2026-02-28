import { useState, useEffect } from 'react';

export default function Timer({ seconds, onExpire, running = true }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!running || left <= 0) {
      if (left <= 0) onExpire?.();
      return;
    }
    const t = setInterval(() => setLeft((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => clearInterval(t);
  }, [running, left, onExpire]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <div className="text-2xl font-mono text-slate-700">
      {m}:{s.toString().padStart(2, '0')}
    </div>
  );
}
