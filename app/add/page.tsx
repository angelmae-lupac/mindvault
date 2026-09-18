'use client';

import { useState } from 'react';
import { addDocument } from '@/lib/actions';

export default function AddDocument() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    await addDocument(content);
    setStatus('Document added!');
    setContent('');
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Add a Document</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your text here..."
          rows={6}
          className="border rounded p-2"
        />
        <button
          type="submit"
          disabled={loading || !content}
          className="bg-green-600 text-white rounded p-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Document'}
        </button>
      </form>
      {status && <p className="mt-4 text-green-700">{status}</p>}
    </main>
  );
}