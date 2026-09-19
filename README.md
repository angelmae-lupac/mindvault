# MindVault
### A local, AI-powered knowledge base — built to understand RAG from the inside out, not call it through an API

![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-local_LLM-000000)
![Zero API Cost](https://img.shields.io/badge/API_cost-%240-brightgreen)

MindVault answers questions using only the documents you give it. No external AI APIs, no cloud costs, no vendor lock-in — the full Retrieval-Augmented Generation pipeline runs on your own machine via Docker and Ollama.

**[Watch the demo →](https://drive.google.com/file/d/1B3ZMSDJaITLTPIrrfNDYqywvQPHoSW-B/view?usp=drive_link)**

---

## Why this exists

Most AI "knowledge base" tools — ChatGPT file upload, Notion AI, dozens of RAG-as-a-service startups — are API wrappers. They hide how retrieval actually works, and they depend on external services and per-query costs to answer questions about *your own documents*.

| | Typical wrapper tool | MindVault |
|---|---|---|
| Where your data goes | Uploaded to a third-party API | Never leaves your machine |
| Cost per query | Per-token API pricing | $0 |
| Retrieval logic | Opaque | Chunking, embedding, and similarity search fully visible and tunable |
| Answer transparency | "Trust the black box" | Every answer shows its exact source chunks + similarity scores |

I built this to understand — and control — every layer of that pipeline myself: chunking strategy, vector embeddings, semantic search, and grounded generation, from scratch.

## How it's built

**Design** — Mapped the full pipeline as a system before writing code: document → chunk → embedding → vector store → retrieval → grounded generation. Made an architectural bet upfront to run it 100% locally (Postgres + pgvector, Ollama), which meant every decision downstream had to be justified on its own merits — nothing could be outsourced to a managed service's defaults.

**Build** — Used AI to help scaffold the ingestion layer (mammoth/pdf-parse extraction, embedding calls, cosine similarity queries) quickly, while owning the retrieval-quality decisions myself:
- Chose **multi-chunk retrieval** (top 3, not top 1) after testing showed a single chunk often couldn't answer a question on its own
- Tuned **chunk size and overlap** (~800 characters, 150-character overlap) directly against retrieval quality rather than accepting framework defaults

**Improve** — Retrieval alone wasn't enough — the model would still guess when context didn't cover a question. Constrained the prompt to explicitly say "I don't have that information" instead of hallucinating, and added **source transparency**: every answer displays the exact chunks and similarity scores it came from, so outputs are verifiable, not a black box. Also solved the "works on my machine" problem myself — setting up the full local AI dev environment (Docker, WSL2, Ollama) from scratch on Windows.

## Architecture

```mermaid
flowchart TD
    subgraph Ingestion["📄 Adding a Document"]
        A[".docx / .pdf / .txt"] --> B["Extract text<br/>(mammoth / pdf-parse)"]
        B --> C["Chunk text<br/>~800 chars, 150 overlap"]
        C --> D["Embed each chunk<br/>(Ollama: nomic-embed-text)"]
        D --> E[("PostgreSQL<br/>+ pgvector")]
    end

    subgraph Query["❓ Asking a Question"]
        F["User question"] --> G["Embed question<br/>(same model)"]
        G --> H["Cosine similarity search<br/>top 3 chunks"]
        E -.retrieves from.-> H
        H --> I["LLM generation<br/>(Ollama: llama3.2)"]
        I --> J["Grounded answer<br/>+ source chunks + scores"]
    end
```

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database:** PostgreSQL + pgvector (via Docker)
- **AI models:** Ollama, running locally — `nomic-embed-text` (embeddings), `llama3.2` (generation)
- **File parsing:** `mammoth` (.docx), `pdf-parse` (.pdf)
- **Backend:** Next.js Server Actions — no separate API layer

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
# .env:
# DATABASE_URL=postgresql://mindvault:mindvault_dev@localhost:5432/mindvault

# 5. Run the dev server
npm run dev
```

Open `http://localhost:3000/upload` to add documents, then `http://localhost:3000` to ask questions.

## What I learned

- How vector embeddings represent meaning as numbers, and how cosine similarity search works in practice
- Why chunking strategy (size, overlap) directly affects retrieval quality
- How to design prompts that keep an LLM grounded in provided context instead of hallucinating
- Building with Next.js Server Actions instead of a separate backend API
- Setting up a full local AI development environment (Docker, WSL2, Ollama) from scratch on Windows

## Possible next steps

- Support multiple documents with source filtering
- Add streaming responses instead of waiting for the full answer
- Deploy with a hosted vector DB (e.g. Supabase), since Ollama requires local compute
