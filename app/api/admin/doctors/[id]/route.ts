import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  formatDoctorName,
  slugifyDoctorName,
} from "@/lib/doctors";
import { serializeDoctor } from "@/lib/doctor-serializer";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";

const doctorUpdateSchema = z.object({
  lastName: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  middleName: z.string().optional().nullable(),
  medicalCategory: z.string().min(1).optional(),
  specialty: z.string().optional(),
  education: z.string().optional().nullable(),
  bio: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  achievements: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  slug: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId: string) {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.doctor.findFirst({
      where: { slug, NOT: { id: excludeId } },
    });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;
  const json = await request.json();
  const parsed = doctorUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
  }

  const data = parsed.data;
  const lastName = data.lastName?.trim() ?? existing.lastName;
  const firstName = data.firstName?.trim() ?? existing.firstName;
  const middleName =
    data.middleName !== undefined
      ? data.middleName?.trim() || null
      : existing.middleName;
  const name = formatDoctorName({ lastName, firstName, middleName });

  let slug = existing.slug;
  if (data.slug?.trim()) {
    slug = await uniqueSlug(data.slug.trim(), id);
  } else if (
    data.lastName !== undefined ||
    data.firstName !== undefined ||
    data.middleName !== undefined
  ) {
    const baseSlug = slugifyDoctorName(name);
    if (baseSlug && baseSlug !== existing.slug) {
      slug = await uniqueSlug(baseSlug, id);
    }
  }

  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      ...(data.lastName !== undefined && { lastName }),
      ...(data.firstName !== undefined && { firstName }),
      ...(data.middleName !== undefined && { middleName }),
      name,
      slug,
      ...(data.medicalCategory !== undefined && {
        medicalCategory: data.medicalCategory.trim(),
      }),
      ...(data.specialty !== undefined && { specialty: data.specialty.trim() }),
      ...(data.education !== undefined && {
        education: data.education?.trim() || null,
      }),
      ...(data.bio !== undefined && { bio: data.bio.trim() }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      ...(data.experience !== undefined && {
        experience: data.experience?.trim() || null,
      }),
      ...(data.achievements !== undefined && {
        achievements: data.achievements,
      }),
      ...(data.published !== undefined && { published: data.published }),
    },
  });

  return NextResponse.json({ doctor: serializeDoctor(doctor) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const { id } = await context.params;

  try {
    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
  }
}
