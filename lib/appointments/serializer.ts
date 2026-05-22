import type {
  Appointment,
  AppointmentDuration,
  Doctor,
  ServiceCategory,
} from "@/app/generated/prisma/client";
import { formatDateTimeInClinic } from "./clinic-time";

export type AppointmentDto = {
  id: string;
  doctorId: string;
  doctorName: string;
  categoryId: string | null;
  categoryTitle: string | null;
  slotId: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  patientComment: string | null;
  adminNotes: string | null;
  status: Appointment["status"];
  source: Appointment["source"];
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  displayTime: string;
};

export function serializeAppointment(
  appointment: Appointment & {
    doctor?: Pick<Doctor, "name">;
    category?: Pick<ServiceCategory, "name"> | null;
  },
): AppointmentDto {
  return {
    id: appointment.id,
    doctorId: appointment.doctorId,
    doctorName: appointment.doctor?.name ?? "",
    categoryId: appointment.categoryId,
    categoryTitle: appointment.category?.name ?? null,
    slotId: appointment.slotId,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    durationMinutes: appointment.durationMinutes,
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    patientEmail: appointment.patientEmail,
    patientComment: appointment.patientComment,
    adminNotes: appointment.adminNotes,
    status: appointment.status,
    source: appointment.source,
    createdById: appointment.createdById,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    displayTime: formatDateTimeInClinic(appointment.startsAt),
  };
}

export type DurationDto = {
  id: string;
  label: string;
  minutes: number;
  published: boolean;
  sortOrder: number;
};

export function serializeDuration(d: AppointmentDuration): DurationDto {
  return {
    id: d.id,
    label: d.label,
    minutes: d.minutes,
    published: d.published,
    sortOrder: d.sortOrder,
  };
}
