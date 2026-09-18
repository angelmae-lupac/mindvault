export async function generateAnswer(question: string, context: string): Promise<string> {
  const prompt = `Answer the question using ONLY the numbered context excerpts below. The excerpts may be out of order or only partially relevant — use whichever ones actually help. If none of them answer the question, say "I don't have that information."

Context:
${context}

Question: ${question}

Answer:`;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}