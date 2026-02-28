export default function ScoreBoard({ attempts = [], title = 'Score History' }) {
  if (!attempts?.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-500 text-sm">No attempts yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="pb-2">Date</th>
            <th className="pb-2">Correct</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">%</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((row, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2">{row.date ?? '-'}</td>
              <td className="py-2">{row.correct}</td>
              <td className="py-2">{row.total}</td>
              <td className="py-2">{row.percent ?? 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
