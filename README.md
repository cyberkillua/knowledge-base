# Knowledge Base API

Semantic search API for documents. Index URLs, PDFs, and markdown files, then search them using natural language.

**Live:** https://knowledge-base-e3mt.onrender.com

## Endpoints

### Health Check

```
GET /health
```

Returns `{"status": "ok"}`

### Search

```
GET /search?q=<query>&source=<type>&tags=<tags>
```

| Param  | Required | Description                              |
| ------ | -------- | ---------------------------------------- |
| q      | Yes      | Search query                             |
| source | No       | Filter by type: `markdown`, `pdf`, `url` |
| tags   | No       | Filter by tags (comma-separated)         |

**Example:**

```bash
curl "https://knowledge-base-e3mt.onrender.com/search?q=embeddings"
```

### Index URL

```
POST /index/url
Content-Type: application/json

{"url": "https://example.com"}
```

**Example:**

```bash
curl -X POST https://knowledge-base-e3mt.onrender.com/index/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Index File

```
POST /index/file
Content-Type: multipart/form-data

file: <markdown or pdf file>
```

**Example:**

```bash
curl -X POST https://knowledge-base-e3mt.onrender.com/index/file \
  -F "file=@./notes.md"
```

## Tech Stack

- **Runtime:** Bun
- **Framework:** Hono
- **Vector DB:** Qdrant Cloud
- **Embeddings:** Cohere (embed-english-v3.0)
- **Hosting:** Render

## Run Locally

```bash
# Install dependencies
bun install

# Set environment variables
export QDRANT_URL="your-qdrant-cloud-url"
export QDRANT_API_KEY="your-qdrant-api-key"
export COHERE_API_KEY="your-cohere-api-key"

# Start server
bun server.ts
```

Or with Docker:

```bash
docker-compose up --build
```

## Architecture

```
Request → Hono API → Cohere (embeddings) → Qdrant (vector search) → Response
```

1. Text gets converted to embeddings via Cohere
2. Embeddings stored in Qdrant with metadata
3. Search queries get embedded and matched against stored vectors
4. Results ranked by cosine similarity

## Project Structure

```
├── server.ts           # Entry point
├── api.ts              # Hono routes
├── src/
│   ├── qdrant.ts       # Qdrant client
│   ├── embeddings.ts   # Cohere embeddings
│   ├── commands/
│   │   ├── index.ts    # Indexing logic
│   │   └── search.ts   # Search logic
│   └── extractors/
│       ├── markdown.ts # Markdown parser
│       ├── pdf.ts      # PDF extractor
│       └── url.ts      # URL scraper
├── Dockerfile
└── docker-compose.yml
```

## License

MIT
