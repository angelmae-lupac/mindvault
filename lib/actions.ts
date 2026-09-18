'use server';

import { generateEmbedding } from './embeddings';
import { generateAnswer } from './generate';
import pool from './db';

export async function askQuestion(question: string): Promise<{ answer: string; sources: { content: string; distance: number }[] }> {
  const questionEmbedding = await generateEmbedding(question);

  const result = await pool.query(
    `SELECT content, embedding <=> $1 AS distance
     FROM documents
     ORDER BY distance ASC
     LIMIT 3`,
    [JSON.stringify(questionEmbedding)]
  );

  if (result.rows.length === 0) {
    return { answer: "I don't have any documents to search yet. Please upload something first.", sources: [] };
  }

  const context = result.rows.map((row, i) => `[${i + 1}] ${row.content}`).join('\n\n');
  const answer = await generateAnswer(question, context);

  const sources = result.rows.map((row) => ({ content: row.content, distance: row.distance }));

  return { answer, sources };
}

export async function addDocument(content: string): Promise<void> {
  const embedding = await generateEmbedding(content);

  await pool.query(
    'INSERT INTO documents (content, embedding) VALUES ($1, $2)',
    [content, JSON.stringify(embedding)]
  );
}