import crypto from 'crypto';
import { prisma } from '../db';

const REFRESH_TOKEN_BYTES = 32;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

export async function createRefreshToken(
  userId: string,
  expiresAt: Date
): Promise<{ token: string; tokenHash: string }> {
  const token = generateRefreshToken();
  const tokenHash = hashToken(token);
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
  return { token, tokenHash };
}

export async function findValidRefreshToken(
  token: string
): Promise<{ id: string; userId: string } | null> {
  const tokenHash = hashToken(token);
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
    select: { id: true, userId: true },
  });
  return record;
}

export async function revokeRefreshTokenById(id: string): Promise<void> {
  await prisma.refreshToken.delete({ where: { id } }).catch(() => {});
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function deleteExpiredRefreshTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
