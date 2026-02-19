# Configuration and Environment Variables

## Environment Variables

### API alignment (frontend + backend)

For the app to work out-of-the-box, frontend and backend must agree on the API URL:

| Variable        | Location     | Default            | Purpose                                      |
| --------------- | ------------ | ------------------ | -------------------------------------------- |
| `PORT`          | `backend/.env` | `5000`             | Port the backend listens on                  |
| `VITE_API_URL`  | `frontend/.env` | `http://localhost:5000` | API base URL the frontend calls (set at build time) |

**Local development:** Backend runs on port 5000 by default. Frontend fallback is `http://localhost:5000`. No extra config needed.

**Production:** Set `PORT` on the backend. Set `VITE_API_URL` before running `npm run build` in the frontend (e.g. `https://api.yourdomain.com`). The built frontend will call that URL.

**Optional backend vars:** `ALLOWED_ORIGIN` (comma-separated origins for CORS), `DATABASE_URL` / `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for database connection.

## Monitoring and alerting

The backend exposes operational endpoints for production visibility:

- **GET /health** — Returns 200 when the process is running. Use for liveness probes.
- **GET /ready** — Returns 200 when the app can serve traffic (DB reachable); 503 with `{ status: 'unready', reason: 'database' }` when the DB check fails. Use for readiness probes (e.g. Kubernetes).
- **GET /metrics** — Prometheus-format metrics (request count by method/route/status, request duration histogram, default Node.js metrics). Scrape this endpoint in Prometheus or your APM.

**Suggested alerts** (configure in Prometheus/Grafana, Datadog, or your host’s alerting):

1. **Readiness failing** — 503 on `/ready` for 1–2 minutes.
2. **Error rate** — 5xx rate above a threshold, or 4xx on `/auth` (e.g. brute-force).
3. **High latency** — e.g. p95 of `studybuddy_http_request_duration_ms` above a threshold.

Structured JSON logs (timestamp, level, traceId, method, url, statusCode, durationMs) can be ingested by your log pipeline and used for alerting on `level: error` or `statusCode: 500`.
