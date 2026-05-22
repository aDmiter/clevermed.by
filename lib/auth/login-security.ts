import { prisma } from "@/lib/prisma";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_IP = 20;

export function isAccountLocked(lockedUntil: Date | null | undefined): boolean {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > Date.now();
}

export async function recordLoginAttempt(params: {
  login: string;
  success: boolean;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        login: params.login.slice(0, 64),
        success: params.success,
        ip: params.ip?.slice(0, 45) ?? null,
        userAgent: params.userAgent?.slice(0, 512) ?? null,
      },
    });
  } catch (error) {
    console.error("[auth] Failed to record login attempt:", error);
  }
}

export async function isIpRateLimited(ip: string | null | undefined): Promise<boolean> {
  if (!ip) return false;

  try {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const count = await prisma.loginAttempt.count({
      where: {
        ip: ip.slice(0, 45),
        createdAt: { gte: since },
      },
    });
    return count >= RATE_LIMIT_MAX_PER_IP;
  } catch {
    return false;
  }
}

export async function registerFailedLogin(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const attempts = user.failedLoginAttempts + 1;
  const lockedUntil =
    attempts >= MAX_FAILED_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
      : user.lockedUntil;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: attempts,
      lockedUntil,
    },
  });
}

export async function resetFailedLogins(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}
