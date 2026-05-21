"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1758691463582-11aea602cd4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

export type DoctorPickerOption = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type AdminDoctorPickerProps = {
  doctors: DoctorPickerOption[];
  value: string;
  onChange: (doctorId: string) => void;
};

export function AdminDoctorPicker({
  doctors,
  value,
  onChange,
}: AdminDoctorPickerProps) {
  if (doctors.length === 0) {
    return (
      <p className="text-sm text-primary-dark/50">Нет врачей в системе</p>
    );
  }

  return (
    <div className="admin-doctor-picker">
      <p className="admin-doctor-picker__label" id="admin-doctor-picker-label">
        Врач
      </p>
      <div
        className="admin-doctor-picker__list"
        role="tablist"
        aria-labelledby="admin-doctor-picker-label"
      >
        {doctors.map((doctor) => {
          const active = value === doctor.id;
          return (
            <button
              key={doctor.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "admin-doctor-picker__item",
                active && "admin-doctor-picker__item--active",
              )}
              onClick={() => onChange(doctor.id)}
            >
              <span className="admin-doctor-picker__photo">
                <Image
                  src={doctor.imageUrl ?? PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="56px"
                />
              </span>
              <span className="admin-doctor-picker__name">{doctor.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
