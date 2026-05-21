import type {
  AppointmentDuration,
  Service,
  ServiceCategory,
} from "@/app/generated/prisma/client";

export type ServiceDto = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  amount: number;
  currency: string;
  sortOrder: number;
  published: boolean;
};

export type ServiceCategoryDto = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  durationId: string | null;
  durationLabel: string | null;
  durationMinutes: number | null;
  services: ServiceDto[];
};

/** Категория для записи на приём (без списка услуг) */
export type BookingCategoryDto = {
  id: string;
  name: string;
  durationId: string | null;
  durationLabel: string | null;
  durationMinutes: number | null;
};

function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export function serializeService(service: Service): ServiceDto {
  return {
    id: service.id,
    categoryId: service.categoryId,
    slug: service.slug,
    title: service.title,
    amount: decimalToNumber(service.amount),
    currency: service.currency,
    sortOrder: service.sortOrder,
    published: service.published,
  };
}

export function serializeCategoryWithServices(
  category: ServiceCategory & {
    duration?: AppointmentDuration | null;
    services: Service[];
  },
): ServiceCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    durationId: category.durationId,
    durationLabel: category.duration?.label ?? null,
    durationMinutes: category.duration?.minutes ?? null,
    services: category.services
      .map(serializeService)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function serializeBookingCategory(
  category: ServiceCategory & { duration?: AppointmentDuration | null },
): BookingCategoryDto {
  return {
    id: category.id,
    name: category.name,
    durationId: category.durationId,
    durationLabel: category.duration?.label ?? null,
    durationMinutes: category.duration?.minutes ?? null,
  };
}
