'use client';

import { useState } from 'react';
import { askQuestion } from '@/lib/actions';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<{ content: string; distance: number }[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer('');
    setSources([]);
    const result = await askQuestion(question);
    setAnswer(result.answer);
    setSources(result.sources);
    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-2">
          Ask your knowledge base.
        </h1>
        <p className="text-[#8B96A8] mb-8 text-sm">
          Every answer is retrieved from documents you've added — nothing else.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2 rounded-lg border border-[#1B2433] bg-[#10151F] p-1.5 focus-within:border-[#4FD1FF]/60 transition-colors">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you want to know?"
              className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-[#5A6579]"
            />
            <button
              type="submit"
              disabled={loading || !question}
              className="rounded-md px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#4FD1FF] to-[#8B5CF6] text-[#0A0E14] disabled:opacity-40 transition-opacity"
            >
              {loading ? 'Searching' : 'Ask'}
            </button>
          </div>
        </form>

        {answer && (
          <div className="mt-8 rounded-lg border-l-2 border-[#4FD1FF] bg-[#10151F] p-5">
            <p className="text-[#8B96A8] text-xs mb-2">Answer</p>
            <p className="leading-relaxed">{answer}</p>
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[#8B96A8] text-xs">Retrieved from {sources.length} chunks</p>
            {sources.map((s, i) => (
              <div key={i} className="rounded-lg border border-[#1B2433] bg-[#0D1219] p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-[family-name:var(--font-mono)] text-xs text-[#5A6579]">[{i + 1}]</p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-[#5A6579]">
                    distance {s.distance.toFixed(4)}
                  </p>
                </div>
                <p className="font-[family-name:var(--font-mono)] text-sm text-[#8B96A8] leading-relaxed">
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}