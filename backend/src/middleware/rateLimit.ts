import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

/** General API: per-IP request cap. Test = high; prod = 100; dev = 200. */
const generalMax =
  process.env.RATE_LIMIT_MAX != null
    ? Number(process.env.RATE_LIMIT_MAX)
    : isTest
      ? 10000
      : isProduction
        ? 100
        : 200;

/** All /auth routes (login, register, refresh, me, logout). Permissive so refresh doesn't trigger "too many logins". */
const authMax =
  process.env.RATE_LIMIT_AUTH_MAX != null
    ? Number(process.env.RATE_LIMIT_AUTH_MAX)
    : isTest
      ? 10000
      : isProduction
        ? 100
        : 200;

/** Login and register only: strict brute-force protection. */
const loginMax =
  process.env.RATE_LIMIT_LOGIN_MAX != null
    ? Number(process.env.RATE_LIMIT_LOGIN_MAX)
    : isTest
      ? 10000
      : isProduction
        ? 10
        : 50;

export const generalLimiter = rateLimit({
  windowMs,
  max: generalMax,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs,
  max: authMax,
  message: { error: 'Too many requests to auth, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Apply only to POST /auth/login and POST /auth/register. */
export const loginLimiter = rateLimit({
  windowMs,
  max: loginMax,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
