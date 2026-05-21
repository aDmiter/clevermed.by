import type { Doctor } from "@/app/generated/prisma/client";
import type { DoctorCard } from "@/components/site/doctors-page";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1758691463582-11aea602cd4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

export function doctorToCard(doctor: Doctor): DoctorCard {
  const achievements = Array.isArray(doctor.achievements)
    ? (doctor.achievements as string[])
    : [];

  return {
    id: doctor.id,
    name: doctor.name,
    title: doctor.medicalCategory,
    image: doctor.imageUrl ?? PLACEHOLDER_IMAGE,
    experience: doctor.experience ?? "",
    education: doctor.education ?? undefined,
    achievements,
    specialty: doctor.specialty,
  };
}
