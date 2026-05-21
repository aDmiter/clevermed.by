import type { Doctor } from "@/app/generated/prisma/client";

export type DoctorDto = {
  id: string;
  slug: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  name: string;
  medicalCategory: string;
  specialty: string;
  education: string | null;
  bio: string;
  imageUrl: string | null;
  experience: string | null;
  achievements: string[];
  sortOrder: number;
  published: boolean;
};

export function serializeDoctor(doctor: Doctor): DoctorDto {
  const achievements = Array.isArray(doctor.achievements)
    ? (doctor.achievements as string[])
    : [];

  return {
    id: doctor.id,
    slug: doctor.slug,
    lastName: doctor.lastName,
    firstName: doctor.firstName,
    middleName: doctor.middleName,
    name: doctor.name,
    medicalCategory: doctor.medicalCategory,
    specialty: doctor.specialty,
    education: doctor.education,
    bio: doctor.bio,
    imageUrl: doctor.imageUrl,
    experience: doctor.experience,
    achievements,
    sortOrder: doctor.sortOrder,
    published: doctor.published,
  };
}
