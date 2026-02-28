import { useState } from 'react';

export default function PDFUpload({ onFileSelect, uploading }) {
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer?.files?.[0];
    if (file?.type === 'application/pdf') onFileSelect(file);
  };

  const handleChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
        drag ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
        id="pdf-upload"
        disabled={uploading}
      />
      <label htmlFor="pdf-upload" className="cursor-pointer block">
        <p className="text-slate-600 mb-2">
          {uploading ? 'Processing PDF…' : 'Drop a PDF here or click to upload'}
        </p>
        <span className="text-sm text-slate-500">PDF only, max 25MB</span>
      </label>
    </div>
  );
}
