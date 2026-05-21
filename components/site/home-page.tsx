"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Brain,
  HeartPulse,
  ShieldCheck,
  TestTube,
} from "lucide-react";
import { TrustStrip } from "@/components/site/trust-strip";

const services = [
  {
    id: "neurology",
    icon: Brain,
    title: "Неврология",
    desc: "Экспертная диагностика и лечение заболеваний нервной системы.",
  },
  {
    id: "ultrasound",
    icon: HeartPulse,
    title: "УЗИ-диагностика",
    desc: "Высокоточная визуализация для быстрых и надёжных выводов.",
  },
  {
    id: "enmg",
    icon: Activity,
    title: "ЭНМГ",
    desc: "Исследование электрической активности нервов и мышц.",
  },
  {
    id: "lab",
    icon: TestTube,
    title: "Анализы",
    desc: "Полный спектр лабораторных исследований с быстрыми результатами.",
  },
];

function CircleRating() {
  return (
    <div className="mb-4 flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-4 w-4 rounded-full bg-primary-green ring-2 ring-primary-green/20"
        />
      ))}
    </div>
  );
}

export function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <section className="hero">
        <div className="hero__bg" aria-hidden />

        <div className="container relative z-10 mx-auto grid items-center gap-12 px-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="mb-6 text-5xl leading-[1.1] font-bold tracking-tight text-primary-dark md:text-7xl">
              Неврология.
              <br />
              Ясность.
              <br />
              <span className="text-primary-green">Забота.</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-primary-dark/80 md:text-xl">
              Сочетание высокотехнологичной диагностики и органического
              спокойствия. Ваше когнитивное здоровье — понятно и под надёжной
              поддержкой.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/booking"
                className="group flex items-center justify-center gap-2 rounded-full bg-primary-green px-8 py-4 text-center text-lg font-medium text-white transition-all hover:bg-primary-dark hover:shadow-[0_8px_25px_rgba(1,97,67,0.25)] active:scale-95"
              >
                Записаться на приём
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/services"
                className="flex items-center justify-center rounded-full border border-white/80 bg-white/60 px-8 py-4 text-center text-lg font-medium text-primary-dark backdrop-blur-md transition-all hover:bg-white"
              >
                Наши услуги
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero__visual"
          >
            <motion.div
              animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="hero__orb"
              aria-hidden
            />
            <div className="hero__frame">
              <Image
                src="/images/office.jpg"
                alt="Кабинет Clevermed"
                width={1080}
                height={1080}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="hero__badge"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-mint text-primary-green">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-primary-dark">
                  Точная диагностика
                </p>
                <p className="text-xs text-primary-dark/60">
                  Передовые технологии
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <TrustStrip />

      <section className="relative bg-neutral-bg py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-primary-dark">
              Наша экспертиза
            </h2>
            <p className="text-lg text-primary-dark/70">
              Комплексные неврологические и диагностические услуги для вашего
              комфорта и когнитивного спокойствия.
            </p>
          </div>

          <div className="grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-3">
            <Link
              href="/services"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 p-8 shadow-sm backdrop-blur-[15px] transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:col-span-2 md:row-span-2"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary-green/5 blur-3xl transition-colors group-hover:bg-primary-green/10" />
              <div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-mint text-primary-green transition-transform group-hover:scale-110">
                  <Brain size={32} />
                </div>
                <h3 className="mb-4 text-3xl font-bold text-primary-dark">
                  Центр неврологии
                </h3>
                <p className="max-w-md text-lg text-primary-dark/70 transition-colors group-hover:text-primary-dark">
                  Диагностика и лечение заболеваний нервной системы в
                  спокойной, безтревожной среде.
                </p>
              </div>
              <div className="mt-8 flex items-center font-medium text-primary-green">
                <span>Подробнее</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </div>
            </Link>

            {services.slice(1).map((srv) => (
              <Link
                key={srv.id}
                href="/services"
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 p-6 shadow-sm backdrop-blur-[15px] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-mint text-primary-green transition-transform group-hover:scale-110">
                    <srv.icon size={24} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-primary-dark">
                    {srv.title}
                  </h3>
                  <p className="text-sm text-primary-dark/70">{srv.desc}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green/10 text-primary-green transition-colors group-hover:bg-primary-green group-hover:text-white">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="container relative z-10 mx-auto flex flex-col items-center gap-12 px-6 md:flex-row">
          <div className="flex-1">
            <h2 className="mb-6 text-4xl font-bold text-primary-dark">
              Уверенность через спокойствие
            </h2>
            <p className="mb-8 max-w-lg text-lg text-primary-dark/70">
              Мы снижаем тревожность пациентов и создаём атмосферу исцеления.
              Узнайте, что говорят о нас те, кто уже прошёл обследование.
            </p>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 font-semibold text-primary-green transition-colors hover:text-primary-dark"
            >
              Все отзывы <ArrowRight size={20} />
            </Link>
          </div>

          <div className="w-full max-w-md flex-1">
            <div className="relative rounded-3xl border border-white/80 bg-secondary-mint/30 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
              <CircleRating />
              <p className="mb-6 leading-relaxed text-primary-dark/80 italic">
                «Самый спокойный медицинский опыт в моей жизни. Сложные
                неврологические исследования прошли ясно, безопасно и без
                стресса.»
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1684607632599-748b1792a116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBhdGllbnQlMjBzbWlsaW5nJTIwY2xpbmljfGVufDF8fHx8MTc3OTM1MDI2M3ww&ixlib=rb-4.1.0&q=80&w=100"
                  alt="Пациент"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-primary-dark">Мария С.</h4>
                  <p className="text-sm text-primary-dark/60">
                    Проверенный пациент
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
