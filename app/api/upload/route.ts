import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { chunkText } from '@/lib/chunk';
import { generateEmbedding } from '@/lib/embeddings';
import pool from '@/lib/db';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Please upload files under 50MB.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text = '';

  if (file.name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (file.name.endsWith('.pdf')) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = result.text;
  } else if (file.name.endsWith('.txt')) {
    text = buffer.toString('utf-8');
  } else {
    return NextResponse.json({ error: 'Unsupported file type. Please upload .docx, .pdf, or .txt.' }, { status: 400 });
  }

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'No readable text found in this file (it may be a scanned image).' }, { status: 400 });
  }

  const chunks = chunkText(text);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    await pool.query(
      'INSERT INTO documents (content, embedding) VALUES ($1, $2)',
      [chunk, JSON.stringify(embedding)]
    );
  }

  return NextResponse.json({ chunks: chunks.length, filename: file.name });
}