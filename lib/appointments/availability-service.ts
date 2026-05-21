import { prisma } from "@/lib/prisma";
import { formatTimeInClinic, toDateKey } from "./clinic-time";
import { generateSlotsFromWindows, type TimeWindow } from "./windows";

export type CreateAvailabilityInput = {
  doctorId: string;
  dateKeys: string[];
  windows: TimeWindow[];
  durationMinutes: number;
};

export async function createDoctorAvailability(input: CreateAvailabilityInput) {
  const { doctorId, dateKeys, windows, durationMinutes } = input;
  const created: { dateKey: string; slotsCount: number }[] = [];

  for (const dateKey of dateKeys) {
    const generated = generateSlotsFromWindows(dateKey, windows, durationMinutes);

    const day = await prisma.doctorAvailabilityDay.upsert({
      where: {
        doctorId_dateKey: { doctorId, dateKey },
      },
      create: {
        doctorId,
        dateKey,
        durationMinutes,
        windows,
      },
      update: {
        durationMinutes,
        windows,
      },
    });

    const bookedSlotIds = await prisma.availabilitySlot.findMany({
      where: {
        dayId: day.id,
        appointment: { isNot: null },
      },
      select: { id: true, startsAt: true },
    });
    const bookedStarts = new Set(
      bookedSlotIds.map((s) => s.startsAt.getTime()),
    );

    await prisma.availabilitySlot.deleteMany({
      where: {
        dayId: day.id,
        appointment: null,
      },
    });

    const toCreate = generated.filter(
      (g) => !bookedStarts.has(g.startsAt.getTime()),
    );

    if (toCreate.length > 0) {
      await prisma.availabilitySlot.createMany({
        data: toCreate.map((slot) => ({
          dayId: day.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
        })),
      });
    }

    created.push({ dateKey, slotsCount: toCreate.length });
  }

  return created;
}

export async function getAvailableSlotsForBooking(params: {
  doctorId: string;
  dateKey: string;
  procedureMinutes: number;
}) {
  const { doctorId, dateKey, procedureMinutes } = params;
  const now = new Date();

  const day = await prisma.doctorAvailabilityDay.findUnique({
    where: { doctorId_dateKey: { doctorId, dateKey } },
    include: {
      slots: {
        include: { appointment: true },
        orderBy: { startsAt: "asc" },
      },
    },
  });

  if (!day || day.durationMinutes !== procedureMinutes) {
    return [];
  }

  return day.slots
    .filter(
      (slot) =>
        !slot.appointment &&
        slot.startsAt > now &&
        slot.endsAt.getTime() - slot.startsAt.getTime() ===
          procedureMinutes * 60 * 1000,
    )
    .map((slot) => ({
      id: slot.id,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
      label: formatTimeInClinic(slot.startsAt),
      durationMinutes: procedureMinutes,
    }));
}

export async function getDoctorAvailabilityDates(
  doctorId: string,
  procedureMinutes: number,
) {
  const days = await prisma.doctorAvailabilityDay.findMany({
    where: {
      doctorId,
      durationMinutes: procedureMinutes,
      dateKey: { gte: toDateKey(new Date()) },
    },
    orderBy: { dateKey: "asc" },
    include: {
      slots: {
        include: { appointment: true },
      },
    },
  });

  return days
    .filter((day) =>
      day.slots.some((s) => !s.appointment && s.startsAt > new Date()),
    )
    .map((d) => d.dateKey);
}
