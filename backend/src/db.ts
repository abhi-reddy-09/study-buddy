import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const u = new URL(url.replace(/^mysql:\/\//i, 'https://'));
      return {
        host: u.hostname,
        port: Number(u.port) || 3306,
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.slice(1).replace(/\/$/, '') || undefined,
      };
    } catch {
      // Fall through to DB_* if DATABASE_URL is malformed
    }
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? undefined,
  };
}

const config = getDbConfig();
const adapter = new PrismaMariaDb({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database ?? '',
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
