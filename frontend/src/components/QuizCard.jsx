import { useState } from 'react';

const OPTIONS = ['A', 'B', 'C', 'D'];

export default function QuizCard({ question, onSubmit, disabled }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = () => {
    if (selected == null) return;
    onSubmit(question.id, selected, (res) => setResult(res));
  };

  if (result) {
    return (
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-slate-200">
        <p className="font-medium text-slate-800 mb-4">{question.question}</p>
        <p className="text-sm text-slate-600 mb-2">
          Your answer: <strong>{selected}</strong>
          {result.is_correct ? ' ✓ Correct' : ` ✗ Correct: ${result.correct_answer}`}
        </p>
        <p className="text-slate-700 text-sm">{result.explanation}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="font-medium text-slate-800 mb-4">{question.question}</p>
      <div className="space-y-2">
        {OPTIONS.map((key) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={selected === key}
              onChange={() => setSelected(key)}
              disabled={disabled}
              className="w-4 h-4"
            />
            <span>{key}. {question.options?.[key] ?? ''}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={selected == null || disabled}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}
