import { z } from "zod";

const phoneRegex = /^[\d\s+()-]{7,20}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const timeWindowSchema = z.object({
  startTime: z.string().regex(timeRegex, "Формат ЧЧ:ММ"),
  endTime: z.string().regex(timeRegex, "Формат ЧЧ:ММ"),
});

export const createAvailabilitySchema = z.object({
  dateKeys: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  windows: z.array(timeWindowSchema).min(1),
  durationMinutes: z.number().int().min(5).max(240),
});

export const durationBodySchema = z.object({
  label: z.string().min(1),
  minutes: z.number().int().min(5).max(240),
  published: z.boolean().optional(),
});

export const procedureBodySchema = z.object({
  title: z.string().min(1),
  durationId: z.string().min(1),
  published: z.boolean().optional(),
  doctorIds: z.array(z.string()).optional(),
});

export const appointmentBodySchema = z.object({
  doctorId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  procedureId: z.string().optional().nullable(),
  slotId: z.string().optional().nullable(),
  startsAt: z.string().datetime({ message: "Некорректное время" }),
  durationMinutes: z.number().int().min(5).max(240).optional(),
  patientName: z.string().min(2, "Укажите ФИО пациента"),
  patientPhone: z
    .string()
    .min(7, "Укажите телефон")
    .regex(phoneRegex, "Некорректный номер телефона"),
  patientEmail: z.string().email("Некорректный email").optional().nullable(),
  patientComment: z.string().max(2000).optional().nullable(),
  adminNotes: z.string().max(2000).optional().nullable(),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  source: z.enum(["ONLINE", "PHONE"]).optional(),
});

export const appointmentUpdateSchema = appointmentBodySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Нет данных для обновления",
  });

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, " ").trim();
}
