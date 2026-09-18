'use client';

import { useState } from 'react';

export default function UploadDocument() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('');
    setError(false);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(true);
      setStatus(data.error);
    } else {
      setStatus(`Added ${data.chunks} chunk${data.chunks === 1 ? '' : 's'}.`);
    }

    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-2">
          Feed the vault.
        </h1>
        <p className="text-[#8B96A8] mb-8 text-sm">
          Add a document — it gets split into chunks and embedded for search.
        </p>

        <label className="block cursor-pointer rounded-lg border border-dashed border-[#2A3547] bg-[#10151F] p-10 text-center hover:border-[#4FD1FF]/60 transition-colors">
          <input
            type="file"
            accept=".docx,.pdf,.txt"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
          <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-[#4FD1FF] to-[#8B5CF6] mb-3" />
          <p className="text-sm">
            {loading ? `Processing ${fileName}...` : 'Click to choose a file'}
          </p>
          <p className="text-xs text-[#5A6579] mt-1">Accepts .docx, .pdf, and .txt files up to 10MB.</p>
        </label>

        {status && (
          <p className={`mt-4 text-sm ${error ? 'text-[#FF6B6B]' : 'text-[#4FD1FF]'}`}>
            {status}
          </p>
        )}
      </div>
    </main>
  );
}