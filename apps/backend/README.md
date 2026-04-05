# Backend (Node.js)

This workspace is a minimal production-safe HTTP service that currently
exposes health readiness and serves as the backend foundation for future APIs.

## Scripts

From this directory (`apps/backend`):

```bash
npm run dev    # node --watch server.js
npm run start  # node server.js
npm run test   # node --test
```

From repository root:

```bash
npm --workspace=apps/backend run dev
npm --workspace=apps/backend run start
npm --workspace=apps/backend run test
```

## Endpoint Contract

### `GET /health`

Returns HTTP 200 JSON:

```json
{
  "status": "ok",
  "service": "backend",
  "timestamp": "2026-04-05T12:34:56.000Z"
}
```

All other routes currently return HTTP 404 with:

```json
{
  "error": "Not Found"
}
```

## Configuration

Server port resolution order:

1. `BACKEND_PORT`
2. `PORT`
3. default `8080`

Host is `0.0.0.0`.

## Notes for Extending APIs

- `index.js` contains `createRequestListener` and `createServer` helpers.
- Prefer adding route behavior in `createRequestListener` and covering it
  with `node:test` cases in `index.test.js`.
