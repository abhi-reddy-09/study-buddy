import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

function normalizeHost(host: string): string {
  return host === 'localhost' ? '127.0.0.1' : host;
}

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const u = new URL(url.replace(/^mysql:\/\//i, 'https://'));
      return {
        host: normalizeHost(u.hostname),
        port: Number(u.port) || 3306,
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.slice(1).replace(/\/$/, '') || undefined,
      };
    } catch {
    }
  }
  return {
    host: normalizeHost(process.env.DB_HOST || 'localhost'),
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? undefined,
  };
}

const config = getDbConfig();
const prisma = new PrismaClient();

export function getConnectionInfo(): { host: string; port: number; database: string } {
  return { host: config.host, port: config.port, database: config.database ?? '' };
}

export async function checkDatabaseConnection(): Promise<void> {
  await prisma.$queryRawUnsafe('SELECT 1');
}

export { prisma };
