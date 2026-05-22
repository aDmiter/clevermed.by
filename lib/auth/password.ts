import bcrypt from "bcryptjs";
import { z } from "zod";

export const BCRYPT_ROUNDS = 12;

/** Precomputed hash for timing-safe failed login */
export const DUMMY_PASSWORD_HASH =
  "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G2oEBW5vykt8.G";

export const passwordSchema = z
  .string()
  .min(12, "Минимум 12 символов")
  .max(128, "Слишком длинный пароль")
  .regex(/[a-z]/, "Нужна строчная буква")
  .regex(/[A-Z]/, "Нужна заглавная буква")
  .regex(/[0-9]/, "Нужна цифра")
  .regex(/[^A-Za-z0-9]/, "Нужен спецсимвол");

export const loginSchema = z
  .string()
  .min(3, "Минимум 3 символа")
  .max(64)
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Логин: только латиница, цифры, точка, дефис, подчёркивание",
  );

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function verifyPasswordSafe(
  plain: string,
  hash: string | null | undefined,
): Promise<boolean> {
  return bcrypt.compare(plain, hash ?? DUMMY_PASSWORD_HASH);
}
