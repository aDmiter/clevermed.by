import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  formatDoctorName,
  slugifyDoctorName,
} from "@/lib/doctors";
import { serializeDoctor } from "@/lib/doctor-serializer";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import { toDateKey } from "@/lib/appointments/clinic-time";

const doctorBodySchema = z.object({
  lastName: z.string().min(1, "Укажите фамилию"),
  firstName: z.string().min(1, "Укажите имя"),
  middleName: z.string().optional().nullable(),
  medicalCategory: z.string().min(1, "Укажите медицинскую категорию"),
  specialty: z.string().optional().default(""),
  education: z.string().optional().nullable(),
  bio: z.string().optional().default(""),
  imageUrl: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  achievements: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(true),
  slug: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.doctor.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const todayKey = toDateKey(new Date());

  const doctors = await prisma.doctor.findMany({
    orderBy: [{ sortOrder: "asc" }, { lastName: "asc" }],
    include: {
      availabilityDays: {
        where: { dateKey: { gte: todayKey } },
        orderBy: { dateKey: "asc" },
        include: {
          _count: { select: { slots: true } },
        },
      },
      categories: { select: { categoryId: true } },
    },
  });

  return NextResponse.json({
    doctors: doctors.map((doctor) => ({
      ...serializeDoctor(doctor),
      availabilityDays: doctor.availabilityDays.map((day) => ({
        dateKey: day.dateKey,
        durationMinutes: day.durationMinutes,
        slotsCount: day._count.slots,
      })),
      categoryIds: doctor.categories.map((c) => c.categoryId),
      categoriesCount: doctor.categories.length,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const json = await request.json();
  const parsed = doctorBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const name = formatDoctorName(data);
  const baseSlug = data.slug?.trim() || slugifyDoctorName(name);
  const slug = await uniqueSlug(baseSlug || `doctor-${Date.now()}`);

  const maxOrder = await prisma.doctor.aggregate({
    _max: { sortOrder: true },
  });

  const doctor = await prisma.doctor.create({
    data: {
      slug,
      lastName: data.lastName.trim(),
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      name,
      medicalCategory: data.medicalCategory.trim(),
      specialty: data.specialty?.trim() ?? "",
      education: data.education?.trim() || null,
      bio: data.bio?.trim() ?? "",
      imageUrl: data.imageUrl || null,
      experience: data.experience?.trim() || null,
      achievements: data.achievements ?? [],
      published: data.published ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ doctor: serializeDoctor(doctor) }, { status: 201 });
}
