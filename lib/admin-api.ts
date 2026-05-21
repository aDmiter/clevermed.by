import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
}
