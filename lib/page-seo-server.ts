import type { Metadata } from "next";
import {
  ALLOWED_PAGE_SEO_PATHS,
  PAGE_SEO_BY_PATH,
  PAGE_SEO_ENTRIES,
} from "@/lib/page-seo-config";
import type { PageSeoAdminItem, PageSeoResolved } from "@/lib/page-seo";
import { prisma } from "@/lib/prisma";

function resolveEntry(
  path: string,
  row?: { title: string; description: string } | null,
): PageSeoResolved | null {
  const config = PAGE_SEO_BY_PATH.get(path);
  if (!config) return null;

  const hasCustomTitle = Boolean(row?.title?.trim());
  const hasCustomDescription = Boolean(row?.description?.trim());

  return {
    path,
    label: config.label,
    title: hasCustomTitle ? row!.title.trim() : config.defaultTitle,
    description: hasCustomDescription
      ? row!.description.trim()
      : config.defaultDescription,
  };
}

export async function getPageSeo(path: string): Promise<PageSeoResolved | null> {
  if (!ALLOWED_PAGE_SEO_PATHS.has(path)) return null;

  try {
    const row = await prisma.pageSeo.findUnique({
      where: { path },
      select: { title: true, description: true },
    });
    return resolveEntry(path, row);
  } catch {
    return resolveEntry(path, null);
  }
}

export async function listPageSeoForAdmin(): Promise<PageSeoAdminItem[]> {
  let rows: { path: string; title: string; description: string }[] = [];
  try {
    rows = await prisma.pageSeo.findMany({
      select: { path: true, title: true, description: true },
    });
  } catch {
    rows = [];
  }

  const byPath = new Map(rows.map((row) => [row.path, row]));

  return PAGE_SEO_ENTRIES.map((entry) => {
    const resolved = resolveEntry(entry.path, byPath.get(entry.path) ?? null);
    return resolved!;
  });
}

export async function savePageSeoBatch(
  items: { path: string; title: string; description: string }[],
): Promise<PageSeoAdminItem[]> {
  const valid = items.filter((item) => ALLOWED_PAGE_SEO_PATHS.has(item.path));

  await prisma.$transaction(
    valid.map((item) =>
      prisma.pageSeo.upsert({
        where: { path: item.path },
        create: {
          path: item.path,
          title: item.title.trim(),
          description: item.description.trim(),
        },
        update: {
          title: item.title.trim(),
          description: item.description.trim(),
        },
      }),
    ),
  );

  return listPageSeoForAdmin();
}

export async function metadataForPath(path: string): Promise<Metadata> {
  const seo = await getPageSeo(path);
  if (!seo) return {};

  const meta: Metadata = {};
  if (seo.title) {
    meta.title = path === "/" ? { absolute: seo.title } : seo.title;
  }
  if (seo.description) {
    meta.description = seo.description;
  }
  return meta;
}
