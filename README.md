# Clarify

A React + Express educational doubt rewriting app with profile, auth, and production-ready deployment support.

## Features

- Full authentication flow with hashed passwords and bearer token sessions
- Profile management with user settings, theme toggles, and notifications
- Rewrite doubt endpoint with mock fallback for local development
- Rate limiting and secure headers via Express middleware
- Docker-ready production build
- Persistent user/session storage in `data/` for local/demo use

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Run development server:

```bash
npm run dev
```

4. Open browser at `http://localhost:3000`

## Production build

```bash
npm run build
npm start
```

The app bundles the frontend with Vite and the server with esbuild.

## Docker

Build and run with Docker:

```bash
docker build -t clarify-app .
docker run -p 3000:3000 --env-file .env clarify-app
```

Or with Docker Compose:

```bash
docker compose up --build
```

## Environment variables

- `PORT` - port where the Express app listens
- `CORS_ORIGIN` - allowed origin for browser requests
- `GROQ_API_KEY` - optional external API key for production AI rewriting

## Notes

- The server creates `data/users.json` and `data/sessions.json` automatically at startup if they don't exist.
- For a production deployment, set `CORS_ORIGIN` to your app domain and provide a valid `GROQ_API_KEY`.
