"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DoctorDto } from "@/lib/doctor-serializer";

export type DoctorFormValues = {
  lastName: string;
  firstName: string;
  middleName: string;
  medicalCategory: string;
  specialty: string;
  education: string;
  experience: string;
  bio: string;
  imageUrl: string;
  published: boolean;
};

const emptyValues: DoctorFormValues = {
  lastName: "",
  firstName: "",
  middleName: "",
  medicalCategory: "",
  specialty: "",
  education: "",
  experience: "",
  bio: "",
  imageUrl: "",
  published: true,
};

function doctorToValues(doctor: DoctorDto): DoctorFormValues {
  return {
    lastName: doctor.lastName,
    firstName: doctor.firstName,
    middleName: doctor.middleName ?? "",
    medicalCategory: doctor.medicalCategory,
    specialty: doctor.specialty,
    education: doctor.education ?? "",
    experience: doctor.experience ?? "",
    bio: doctor.bio,
    imageUrl: doctor.imageUrl ?? "",
    published: doctor.published,
  };
}

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

type DoctorFormProps = {
  doctor?: DoctorDto | null;
  onSubmit: (values: DoctorFormValues) => Promise<void>;
  onCancel: () => void;
};

export function DoctorForm({ doctor, onSubmit, onCancel }: DoctorFormProps) {
  const [values, setValues] = useState<DoctorFormValues>(
    doctor ? doctorToValues(doctor) : emptyValues,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof DoctorFormValues>(
    key: K,
    value: DoctorFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/doctors/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки");
      update("imageUrl", data.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-border bg-white/80 p-6 backdrop-blur-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-primary-dark">
        {doctor ? "Редактирование врача" : "Новый врач"}
      </h2>

      {error && (
        <p className="mb-4 rounded-lg bg-accent-warmth/10 px-3 py-2 text-sm text-accent-warmth">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Фамилия *</span>
          <input
            required
            className={fieldClass}
            value={values.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Имя *</span>
          <input
            required
            className={fieldClass}
            value={values.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Отчество</span>
          <input
            className={fieldClass}
            value={values.middleName}
            onChange={(e) => update("middleName", e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">
            Медицинская категория *
          </span>
          <input
            required
            className={fieldClass}
            placeholder="Врач высшей квалификационной категории"
            value={values.medicalCategory}
            onChange={(e) => update("medicalCategory", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Направление</span>
          <input
            className={fieldClass}
            placeholder="Неврология, УЗИ диагностика…"
            value={values.specialty}
            onChange={(e) => update("specialty", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Опыт</span>
          <input
            className={fieldClass}
            placeholder="15+ лет практики"
            value={values.experience}
            onChange={(e) => update("experience", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Образование</span>
          <input
            className={fieldClass}
            placeholder="БГМУ, ординатура…"
            value={values.education}
            onChange={(e) => update("education", e.target.value)}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-primary-dark">Биография</span>
        <textarea
          rows={3}
          className={fieldClass}
          value={values.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </label>

      <div className="mt-4">
        <span className="mb-2 block text-sm font-medium text-primary-dark">Фото</span>
        <div className="flex flex-wrap items-start gap-4">
          {values.imageUrl ? (
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-neutral-border">
              <Image
                src={values.imageUrl}
                alt="Фото врача"
                fill
                className="object-cover object-top"
                sizes="112px"
              />
              <button
                type="button"
                onClick={() => update("imageUrl", "")}
                className="absolute top-1 right-1 rounded-full bg-primary-dark/70 p-1 text-white hover:bg-primary-dark"
                aria-label="Удалить фото"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-border px-4 py-3 text-sm text-primary-dark/70 hover:border-primary-green hover:text-primary-green">
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? "Загрузка…" : "Загрузить фото"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => update("published", e.target.checked)}
          className="size-4 rounded border-neutral-border text-primary-green focus:ring-primary-green/30"
        />
        <span className="text-primary-dark">Показывать на сайте</span>
      </label>

      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Сохранение…" : doctor ? "Сохранить" : "Добавить"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
