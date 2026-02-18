/**
 * Structured JSON logger for production-friendly log aggregation.
 * All output is one JSON object per line (no pretty-print in production).
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  traceId?: string | undefined;
  message?: string | undefined;
  method?: string | undefined;
  url?: string | undefined;
  statusCode?: number | undefined;
  durationMs?: number | undefined;
  userId?: string | undefined;
  error?: string | undefined;
  stack?: string | undefined;
  [key: string]: unknown;
}

/** Fields callers provide; timestamp and level are added by the log methods. */
type LogFields = Omit<LogEntry, 'timestamp' | 'level'>;

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const log = {
  info(fields: LogFields): void {
    const out = { ...fields, level: 'info' as LogLevel, timestamp: new Date().toISOString() };
    console.log(formatEntry(out));
  },

  warn(fields: LogFields): void {
    const out = { ...fields, level: 'warn' as LogLevel, timestamp: new Date().toISOString() };
    console.warn(formatEntry(out));
  },

  error(fields: LogFields): void {
    const out = { ...fields, level: 'error' as LogLevel, timestamp: new Date().toISOString() };
    console.error(formatEntry(out));
  },
};
