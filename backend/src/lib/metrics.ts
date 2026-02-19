import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

const register = new Registry();

collectDefaultMetrics({ register, prefix: 'studybuddy_' });

export const httpRequestsTotal = new Counter({
  name: 'studybuddy_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDurationMs = new Histogram({
  name: 'studybuddy_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

export async function getMetrics(): Promise<string> {
  return register.metrics();
}

export function getContentType(): string {
  return register.contentType;
}
