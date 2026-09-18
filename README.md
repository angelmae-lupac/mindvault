# MindVault

A local, AI-powered knowledge base that answers questions using only the documents you give it — built to understand how Retrieval-Augmented Generation (RAG) systems work end-to-end, from vector storage to semantic search to grounded generation.

Ask a question, and MindVault:
1. Converts your question into a vector embedding
2. Searches a Postgres database for the most semantically similar chunks of your documents
3. Feeds those chunks to a local LLM to generate an answer grounded in your actual content — not the model's general training data

## Why I built this

I wanted to genuinely understand how modern AI knowledge-base tools (like ChatGPT's file upload or Notion AI) work under the hood, rather than just using an API wrapper. This project forced me to work through vector databases, embeddings, chunking strategy, and prompt design from scratch, entirely running on local infrastructure — no external AI APIs, no cloud costs.

## How it works
Document (.docx / .pdf / .txt)
│
▼
Text extraction (mammoth / pdf-parse)
│
▼
Chunking (splits into ~800-character pieces with overlap)
│
▼
Embedding (Ollama + nomic-embed-text → 768-dim vector)
│
▼
Stored in PostgreSQL with pgvector
│
▼
──────────────────────────────
│
User asks a question
│
▼
Question embedded the same way
│
▼
pgvector similarity search (cosine distance) → top 3 chunks
│
▼
Chunks + question sent to Llama 3.2 (via Ollama)
│
▼
Answer displayed, with sources and similarity scores shown


## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database:** PostgreSQL + pgvector (via Docker)
- **AI models:** Ollama running locally — `nomic-embed-text` for embeddings, `llama3.2` for generation
- **File parsing:** `mammoth` (.docx), `pdf-parse` (.pdf)

## Key design decisions

- **Chunking with overlap:** Documents are split into ~800-character chunks with 150-character overlap, so facts near chunk boundaries aren't lost.
- **Multi-chunk retrieval:** The system retrieves the top 3 most relevant chunks (not just 1) and lets the LLM synthesize across them, since a single chunk often doesn't contain the full answer.
- **Grounded generation:** The LLM is explicitly instructed to say "I don't have that information" rather than guess, when the retrieved context doesn't answer the question — reducing hallucination.
- **Source transparency:** Every answer displays the exact retrieved chunks and their similarity distance scores, so the answer's origin is verifiable rather than a black box.
- **Fully local:** No external API keys or cloud costs — Postgres, the embedding model, and the LLM all run on your own machine via Docker and Ollama.

## Running it locally

**Prerequisites:** Docker Desktop, Node.js, Ollama

```bash
# 1. Start the database
docker compose up -d

# 2. Pull the required models
ollama pull nomic-embed-text
ollama pull llama3.2

# 3. Install dependencies
npm install

# 4. Set up your environment file
# Create a .env file with:
# DATABASE_URL=postgresql://mindvault:mindvault_dev@localhost:5432/mindvault

# 5. Run the dev server
npm run dev
```

Open `http://localhost:3000/upload` to add documents, then `http://localhost:3000` to ask questions.

## What I learned

- How vector embeddings represent meaning as numbers, and how cosine similarity search works in practice
- Why chunking strategy (size, overlap) directly affects retrieval quality
- How to design prompts that keep an LLM grounded in provided context instead of hallucinating
- Setting up a full local AI development environment (Docker, WSL2, Ollama) from scratch on Windows
- Building with Next.js Server Actions instead of a separate backend API

## Possible next steps

- Support multiple documents with source filtering
- Add streaming responses instead of waiting for the full answer
- Deploy with a hosted vector DB (e.g. Supabase) since Ollama requires local compute