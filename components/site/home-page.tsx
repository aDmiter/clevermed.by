"use client";

import "@/styles/blocks/home-expertise.css";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Brain,
  HeartPulse,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getServiceBySlug } from "@/lib/services-catalog";
import { useSiteBooking } from "@/components/providers/site-booking-provider";
import { TrustStrip } from "@/components/site/trust-strip";

type ExpertiseCard = {
  id: string;
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  featured?: boolean;
};

const expertiseCards: ExpertiseCard[] = [
  {
    id: "nevrologiya",
    href: "/services/nevrologiya",
    icon: Brain,
    title: "Центр неврологии",
    desc:
      getServiceBySlug("nevrologiya")?.listSummary ??
      "Диагностика и лечение заболеваний нервной системы.",
    featured: true,
  },
  {
    id: "uzi-diagnostika",
    href: "/services/uzi-diagnostika",
    icon: HeartPulse,
    title: getServiceBySlug("uzi-diagnostika")?.listTitle ?? "УЗИ-диагностика",
    desc:
      getServiceBySlug("uzi-diagnostika")?.listSummary ??
      "Высокоточная визуализация для быстрых и надёжных выводов.",
  },
  {
    id: "elektronejromiografiya-enmg",
    href: "/services/elektronejromiografiya-enmg",
    icon: Activity,
    title: getServiceBySlug("elektronejromiografiya-enmg")?.listTitle ?? "ЭНМГ",
    desc:
      getServiceBySlug("elektronejromiografiya-enmg")?.listSummary ??
      "Исследование электрической активности нервов и мышц.",
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
  const { bookHref } = useSiteBooking();

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
                href={bookHref}
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

      <section className="home-expertise">
        <div className="home-expertise__inner container mx-auto px-6">
          <div className="home-expertise__head">
            <h2 className="home-expertise__title">Наша экспертиза</h2>
            <p className="home-expertise__lead">
              Комплексные неврологические и диагностические услуги для вашего
              комфорта и когнитивного спокойствия.
            </p>
          </div>

          <div className="home-expertise__grid">
            {expertiseCards.map((card) => {
              const Icon = card.icon;
              const featured = card.featured === true;

              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className={
                    featured
                      ? "home-expertise__card home-expertise__card--featured"
                      : "home-expertise__card"
                  }
                >
                  {featured ? (
                    <div className="home-expertise__card-glow" aria-hidden />
                  ) : null}
                  <div>
                    <div
                      className={
                        featured
                          ? "home-expertise__card-icon home-expertise__card-icon--lg"
                          : "home-expertise__card-icon"
                      }
                    >
                      <Icon size={featured ? 32 : 24} aria-hidden />
                    </div>
                    <h3 className="home-expertise__card-title">{card.title}</h3>
                    <p className="home-expertise__card-desc">{card.desc}</p>
                  </div>
                  {featured ? (
                    <div className="home-expertise__card-more">
                      <span>Подробнее</span>
                      <ArrowRight
                        size={20}
                        className="home-expertise__card-more-icon"
                        aria-hidden
                      />
                    </div>
                  ) : (
                    <div className="home-expertise__card-action">
                      <span className="home-expertise__card-arrow" aria-hidden>
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="container relative z-10 mx-auto flex flex-col items-center gap-12 px-6 md:flex-row">
          <div className="flex-1">
            <h2 className="mb-6 text-4xl font-bold text-primary-dark">
              Уверенность через спокойствие
            </h2>
            <p className="max-w-lg text-lg text-primary-dark/70">
              Мы снижаем тревожность пациентов и создаём атмосферу исцеления —
              с понятными объяснениями и заботой на каждом этапе визита.
            </p>
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
                  src="/images/dmitriy.png"
                  alt="Дмитрий С."
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-primary-dark">Дмитрий С.</h4>
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
