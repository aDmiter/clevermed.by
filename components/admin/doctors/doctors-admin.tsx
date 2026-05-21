"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarDays, ClipboardList, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { DoctorAvailabilityModal } from "./doctor-availability-modal";
import { DoctorCategoriesModal } from "./doctor-categories-modal";
import { Button } from "@/components/ui/button";
import type { DoctorDto } from "@/lib/doctor-serializer";
import {
  DoctorAvailabilityDays,
  type DoctorAvailabilityDaySummary,
} from "./doctor-availability-days";
import { DoctorForm, type DoctorFormValues } from "./doctor-form";

type DoctorWithAvailability = DoctorDto & {
  availabilityDays?: DoctorAvailabilityDaySummary[];
  categoryIds?: string[];
  categoriesCount?: number;
};

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

export function DoctorsAdmin() {
  const [doctors, setDoctors] = useState<DoctorWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DoctorDto | null | "new">(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [availabilityDoctor, setAvailabilityDoctor] =
    useState<DoctorWithAvailability | null>(null);
  const [categoriesDoctor, setCategoriesDoctor] =
    useState<DoctorWithAvailability | null>(null);
  const doctorsRef = useRef(doctors);

  useEffect(() => {
    doctorsRef.current = doctors;
  }, [doctors]);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/doctors");
      if (!res.ok) await parseError(res);
      const data = await res.json();
      setDoctors(data.doctors);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  async function saveDoctor(values: DoctorFormValues, id?: string) {
    const body = {
      lastName: values.lastName,
      firstName: values.firstName,
      middleName: values.middleName || null,
      medicalCategory: values.medicalCategory,
      specialty: values.specialty,
      education: values.education || null,
      experience: values.experience || null,
      bio: values.bio,
      imageUrl: values.imageUrl || null,
      published: values.published,
    };

    const res = await fetch(
      id ? `/api/admin/doctors/${id}` : "/api/admin/doctors",
      {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) await parseError(res);

    setEditing(null);
    setMessage(id ? "Врач обновлён" : "Врач добавлен");
    await loadDoctors();
  }

  async function deleteDoctor(id: string) {
    if (!confirm("Удалить врача?")) return;
    const res = await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
    if (!res.ok) await parseError(res);
    setMessage("Врач удалён");
    await loadDoctors();
  }

  async function persistOrder(next: DoctorDto[]) {
    setDoctors(next);
    const res = await fetch("/api/admin/doctors/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((d) => d.id) }),
    });
    if (!res.ok) await parseError(res);
    setMessage("Порядок сохранён");
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;

    setDoctors((items) => {
      const from = items.findIndex((d) => d.id === dragId);
      const to = items.findIndex((d) => d.id === overId);
      if (from < 0 || to < 0) return items;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      doctorsRef.current = next;
      return next;
    });
  }

  async function handleDragEnd() {
    if (!dragId) return;
    const current = doctorsRef.current;
    setDragId(null);
    await persistOrder(current);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Управление врачами</h1>
          <p className="mt-1 text-sm text-primary-dark/60">
            Перетащите карточки, чтобы изменить порядок на сайте
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing("new")}>
            <Plus size={16} data-icon="inline-start" />
            Добавить врача
          </Button>
        )}
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      {editing && (
        <div className="mb-8">
          <DoctorForm
            doctor={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await saveDoctor(
                values,
                editing === "new" ? undefined : editing.id,
              );
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-primary-dark/60">Загрузка…</p>
      ) : doctors.length === 0 ? (
        <p className="text-primary-dark/60">Врачи пока не добавлены.</p>
      ) : (
        <ul className="space-y-3">
          {doctors.map((doctor, index) => (
            <li
              key={doctor.id}
              draggable
              onDragStart={() => handleDragStart(doctor.id)}
              onDragOver={(e) => handleDragOver(e, doctor.id)}
              onDragEnd={() => void handleDragEnd()}
              className={`flex flex-wrap items-start gap-4 rounded-xl border bg-white/70 p-4 transition-shadow sm:flex-nowrap sm:items-center ${
                dragId === doctor.id
                  ? "border-primary-green shadow-md"
                  : "border-neutral-border"
              }`}
            >
              <button
                type="button"
                className="cursor-grab text-primary-dark/40 hover:text-primary-green active:cursor-grabbing"
                aria-label="Перетащить"
              >
                <GripVertical size={20} />
              </button>

              <span className="w-6 text-center text-sm font-medium text-primary-dark/40">
                {index + 1}
              </span>

              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary-mint">
                {doctor.imageUrl ? (
                  <Image
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    fill
                    className="object-cover object-top"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-primary-dark/30">
                    Нет фото
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-primary-dark">{doctor.name}</p>
                <p className="truncate text-sm text-primary-green">
                  {doctor.medicalCategory}
                </p>
                {doctor.specialty && (
                  <p className="truncate text-sm text-primary-dark/60">
                    {doctor.specialty}
                  </p>
                )}
                {!doctor.published && (
                  <span className="mt-1 inline-block rounded bg-accent-warmth/15 px-2 py-0.5 text-xs text-accent-warmth">
                    Скрыт
                  </span>
                )}
                <DoctorAvailabilityDays
                  days={doctor.availabilityDays ?? []}
                />
                {(doctor.categoriesCount ?? 0) > 0 && (
                  <p className="mt-2 text-xs text-primary-dark/45">
                    Категорий для записи:{" "}
                    <strong className="text-primary-green">
                      {doctor.categoriesCount}
                    </strong>
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCategoriesDoctor(doctor)}
                >
                  <ClipboardList size={16} data-icon="inline-start" />
                  Категории
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailabilityDoctor(doctor)}
                >
                  <CalendarDays size={16} data-icon="inline-start" />
                  Дни приёма
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setEditing(doctor)}
                  aria-label="Редактировать"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => void deleteDoctor(doctor.id)}
                  aria-label="Удалить"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {categoriesDoctor && (
        <DoctorCategoriesModal
          doctorId={categoriesDoctor.id}
          doctorName={categoriesDoctor.name}
          initialCategoryIds={categoriesDoctor.categoryIds ?? []}
          onClose={() => setCategoriesDoctor(null)}
          onSaved={async (categoryIds) => {
            setMessage(`Категории для ${categoriesDoctor.name} сохранены`);
            setDoctors((list) =>
              list.map((d) =>
                d.id === categoriesDoctor.id
                  ? {
                      ...d,
                      categoryIds,
                      categoriesCount: categoryIds.length,
                    }
                  : d,
              ),
            );
          }}
        />
      )}

      {availabilityDoctor && (
        <DoctorAvailabilityModal
          key={availabilityDoctor.id}
          doctorId={availabilityDoctor.id}
          doctorName={availabilityDoctor.name}
          onClose={() => setAvailabilityDoctor(null)}
          existingDays={availabilityDoctor.availabilityDays ?? []}
          onSaved={async (savedDoctorId, availabilityDays) => {
            const name =
              doctorsRef.current.find((d) => d.id === savedDoctorId)?.name ??
              availabilityDoctor.name;
            setMessage(`Дни приёма для ${name} сохранены`);
            setDoctors((list) => {
              const next = list.map((d) =>
                d.id === savedDoctorId ? { ...d, availabilityDays } : d,
              );
              doctorsRef.current = next;
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
