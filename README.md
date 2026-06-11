# Idea Stash

A simple "second brain" web application to save and enrich links (YouTube videos, tweets, GitHub repos, articles and websites). This repository contains two main projects:

- `idea-stash-client` — a React + Vite front-end (TypeScript + Tailwind)
- `idea-stash-server` — an Express + TypeScript backend with MongoDB and optional OpenAI integration

---

## Highlights

- Minimal, content-first dashboard (search, categories/sidebar, content grid)
- Fast local search with case-insensitive substring matching across title, summary/metadata, url and tags
- Optional semantic search powered by server-side AI routes
- Rich content extraction and metadata support
- Simple API design with `content`, `collections`, `tags`, `search`, and `share` endpoints

---

## Table of Contents

- Quick start
- Requirements
- Environment variables
- Local development (server and client)
- Build & production
- Project structure
- Key implementation notes
- Tests & checks
- Contributing
- License

---

## Quick start

Clone the repo and start both services (two terminals):

```bash
git clone <repo-url>
cd "Idea Stash"
```

Open two terminals. In one, start the server (see environment setup below):

```bash
cd idea-stash-server
npm install
npm run dev
```

In the other terminal start the client:

```bash
cd idea-stash-client
npm install
npm run dev
```

The client will typically run on `http://localhost:5173` and the server on `http://localhost:3000` (configurable via env).

---

## Requirements

- Node.js 18+ (tested with Node 18/20)
- npm (or yarn/pnpm)
- MongoDB (local, Docker, or cloud like Atlas)
- Optional: OpenAI API key for semantic search features

---

## Environment variables

Create a `.env` file in `idea-stash-server` with at least the following values:

```env
# MongoDB connection string (either MONGO_URL or MONGODB_URI)
MONGO_URL=mongodb://localhost:27017/idea-stash

# JWT secret for signing tokens (required; min 8 chars)
JWT_SECRET=supersecretjwtkey

# Optional: port the server listens on (default 3000)
PORT=3000

# Optional: OpenAI API key for semantic/AI features
OPENAI_API_KEY=sk-xxxx

# Optional: frontend origin used for CORS and share links
FRONTEND_URL=http://localhost:5173
```

Notes:
- The server uses a Zod schema to validate environment variables and will throw on missing/invalid values.

---

## Local development

### Server (idea-stash-server)

Install and run in dev mode (rebuilds & restarts on changes):

```bash
cd idea-stash-server
npm install
npm run dev
```

Useful scripts:
- `npm run dev` — development mode (nodemon + build)
- `npm run build` — compile TypeScript to `dist`
- `npm start` — run the compiled server from `dist`
- `npm run verify:e2e` — a helper script used in CI or local verification

### Client (idea-stash-client)

Install and run the Vite dev server:

```bash
cd idea-stash-client
npm install
npm run dev
```

Useful scripts:
- `npm run dev` — start Vite dev server
- `npm run build` — run TypeScript build and Vite production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint across the project

---

## Build & production

1. Build and start the server

```bash
cd idea-stash-server
npm install --production
npm run build
NODE_ENV=production npm start
```

2. Build the client and serve the `dist` folder using your preferred static host (Netlify, Vercel, Nginx, S3+CloudFront, etc.)

```bash
cd idea-stash-client
npm install --production
npm run build
# upload idea-stash-client/dist to your static host
```

If you want to serve both from one place, you can host the static files and set the server's `FRONTEND_URL` accordingly and/or configure a reverse proxy.

---

## Project structure (high-level)

idea-stash-client/
- `src/` — all front-end code (React + Vite + Tailwind)
  - `components/` — UI building blocks and cards (YouTube, GitHub, Article, Twitter, etc.)
  - `pages/` — main pages such as `Dashboard`, `Signin`, `Signup`
  - `hooks/` — reusable hooks like `useContent`, `useToast`
  - `api/` — small wrapper around backend REST API

idea-stash-server/
- `src/` — backend code (Express + TypeScript)
  - `controllers/` — request handlers
  - `services/` — link metadata, YouTube helpers, AI integrations
  - `models/` — Mongoose models
  - `routes/` — express routes
  - `validators/` — request validators

---

## Key implementation notes

- Search
  - Client search uses case-insensitive substring matching across `title`, `summary` / `metadata.description`, `url`/`link`, and `tags`. It updates results while typing (debounced).
  - When the AI semantic search toggle is enabled, the client calls the server `search` endpoint with `mode=semantic`.

- Content enrichment
  - The server extracts metadata (via `cheerio` and site-specific detectors) and stores rich metadata in `metadata` and `summary` fields.

- Authentication
  - JWT-based authentication is used for API routes that modify user data. See `JWT_SECRET` env var.

---

## Tests & checks

- ESLint and TypeScript are configured for both client and server. Run:

```bash
# client lint
cd idea-stash-client
npm run lint

# server - use your preferred local eslint command or typecheck
cd idea-stash-server
npm run build
```

---

## Contributing

Thanks for considering contributing! A few guidelines:

1. Open an issue describing the feature or bug.
2. Create a feature branch named like `feature/awesome-thing`.
3. Keep PRs small and focused.
4. Run linters and TypeScript build locally before creating a PR.

If you want to add features like multi-user support, bookmarking, or better AI note generation, open an issue first so we can align on goals.

---

## Troubleshooting

- "Cannot connect to MongoDB": ensure `MONGO_URL`/`MONGODB_URI` is set and Mongo is running.
- "Invalid environment variables": check the server `env` schema and ensure `JWT_SECRET` is present.
- CORS or share link issues: confirm `FRONTEND_URL` matches your dev server origin.

---
