import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Укажите название категории"),
});

export const categoryBodySchema = z.object({
  name: z.string().min(1, "Укажите название категории").optional(),
  durationId: z.string().nullable().optional(),
});

export const serviceBodySchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1, "Укажите наименование"),
  amount: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  published: z.boolean().optional(),
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
