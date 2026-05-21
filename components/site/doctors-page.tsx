"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, ArrowRight, BookOpen, Stethoscope } from "lucide-react";

export type DoctorCard = {
  id: string;
  name: string;
  title: string;
  image: string;
  experience: string;
  education?: string;
  achievements: string[];
  specialty: string;
};

const fallbackDoctors: DoctorCard[] = [
  {
    id: "dr-smith",
    name: "д-р Артур Смит",
    title: "Главный невролог, к.м.н.",
    image:
      "https://images.unsplash.com/photo-1758691463582-11aea602cd4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGZyaWVuZGx5fGVufDF8fHx8MTc3OTM1MDI2NHww&ixlib=rb-4.1.0&q=80&w=600",
    experience: "15+ лет практики",
    achievements: [
      "50+ научных публикаций",
      "Сертификат совета неврологов",
      "Премия Neurology Excellence 2024",
    ],
    specialty: "Когнитивные расстройства и мигрень",
  },
  {
    id: "dr-chen",
    name: "д-р Елена Чен",
    title: "Ведущий нейросонолог",
    image:
      "https://images.unsplash.com/photo-1673865641073-4479f93a7776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB3b21hbiUyMHBvcnRyYWl0JTIwZnJpZW5kbHl8ZW58MXx8fHwxNzc5MzUwMjYzfDA&ixlib=rb-4.1.0&q=80&w=600",
    experience: "12+ лет практики",
    achievements: ["Сертификат допплер-диагностики", "Эксперт сосудистой патологии"],
    specialty: "Сосудистая нейровизуализация",
  },
];

type DoctorsPageProps = {
  doctors?: DoctorCard[];
};

export function DoctorsPage({ doctors = fallbackDoctors }: DoctorsPageProps) {
  return (
    <div className="min-h-screen bg-neutral-bg py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-primary-dark md:text-5xl">
            Наши специалисты
          </h1>
          <p className="text-lg text-primary-dark/70">
            Эксперты, сочетающие точную медицину с эмпатичной заботой. Каждый
            врач Clevermed нацелен на ваше когнитивное спокойствие.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group relative flex h-[480px] flex-col overflow-hidden rounded-[2rem] bg-secondary-mint p-4 shadow-[8px_8px_16px_#c8d5cf,-8px_-8px_16px_#ffffff] transition-all duration-500 hover:-translate-y-2 hover:shadow-[12px_12px_20px_#b5c2bc,-12px_-12px_20px_#ffffff]"
            >
              <div className="relative mb-6 h-64 overflow-hidden rounded-2xl transition-all duration-500 group-hover:h-32">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              <div className="px-2 transition-all duration-500 group-hover:-translate-y-2">
                <h3 className="mb-1 text-2xl font-bold text-primary-dark">
                  {doctor.name}
                </h3>
                <p className="mb-2 font-medium text-primary-green">
                  {doctor.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-primary-dark/60">
                  <Stethoscope size={16} />
                  <span>{doctor.specialty}</span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 left-0 translate-y-8 bg-secondary-mint p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="mb-6 space-y-2">
                  {doctor.experience ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                      <Award size={16} className="text-accent-warmth" />
                      {doctor.experience}
                    </div>
                  ) : null}
                  {doctor.education ? (
                    <div className="flex items-center gap-2 text-sm text-primary-dark/70">
                      <BookOpen size={16} className="text-primary-green" />
                      {doctor.education}
                    </div>
                  ) : null}
                  {doctor.achievements.map((ach) => (
                    <div
                      key={ach}
                      className="flex items-center gap-2 text-sm text-primary-dark/70"
                    >
                      <BookOpen size={16} className="text-primary-green" />
                      {ach}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/booking?doctor=${doctor.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-green py-3 text-center font-medium text-white shadow-sm transition-colors hover:bg-primary-dark"
                >
                  Записаться к врачу
                </Link>
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white bg-white/60 p-8 text-center shadow-sm backdrop-blur-md">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-mint text-primary-green">
              <Award size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-primary-dark">
              Лист ожидания
            </h3>
            <p className="mb-8 text-primary-dark/70">
              Нет свободного окна у выбранного специалиста? Оставьте заявку в
              листе ожидания.
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 font-semibold text-primary-green transition-colors hover:text-primary-dark"
            >
              Связаться с регистратурой <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
