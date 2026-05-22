import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { ALLOWED_PAGE_SEO_PATHS } from "@/lib/page-seo-config";
import {
  listPageSeoForAdmin,
  savePageSeoBatch,
} from "@/lib/page-seo-server";

const itemSchema = z.object({
  path: z.string().refine((p) => ALLOWED_PAGE_SEO_PATHS.has(p), {
    message: "Неизвестная страница",
  }),
  title: z.string().max(120),
  description: z.string().max(320),
});

const putSchema = z.object({
  pages: z.array(itemSchema).min(1),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const pages = await listPageSeoForAdmin();
  return NextResponse.json({ pages });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const pages = await savePageSeoBatch(parsed.data.pages);
  return NextResponse.json({ pages });
}
