"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ArrowRight, Brain, FlaskConical, HeartPulse } from "lucide-react";
import { EnmgSignalAnimation } from "@/components/site/enmg-signal-animation";
import { SERVICE_NAV_ITEMS, SERVICES_CATALOG } from "@/lib/services-catalog";
import { cn } from "@/lib/utils";

const ICONS = {
  brain: Brain,
  heart: HeartPulse,
  activity: Activity,
  lab: FlaskConical,
};

const services = SERVICE_NAV_ITEMS.map((item) => {
  const data = SERVICES_CATALOG[item.slug];
  return {
    slug: item.slug,
    href: item.href,
    icon: ICONS[data.icon],
    title: data.listTitle,
    summary: data.listSummary,
    description: data.heroDescription,
    preparation:
      item.slug === "elektronejromiografiya-enmg"
        ? "Избегайте кремов на коже в день процедуры; наденьте удобную одежду."
        : item.slug === "uzi-diagnostika"
          ? "Уточните требования к подготовке при записи — они зависят от зоны исследования."
          : item.slug === "analizy"
            ? "Для части анализов требуется голодание — мы сообщим при записи."
            : "Возьмите результаты предыдущих обследований и список принимаемых препаратов.",
    showAnimation: item.slug === "elektronejromiografiya-enmg",
  };
});

export function ServicesPage() {
  const [openSlug, setOpenSlug] = useState<string | null>(services[0]?.slug ?? null);

  return (
    <div className="bg-neutral-bg py-24">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-primary-dark md:text-5xl">
            Услуги
          </h1>
          <p className="text-lg text-primary-dark/70">
            Выберите направление или раскройте карточку для краткого описания.
          </p>
        </div>

        <div className="space-y-4">
          {services.map((service) => {
            const isOpen = openSlug === service.slug;
            const Icon = service.icon;

            return (
              <div
                key={service.slug}
                className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 shadow-sm backdrop-blur-[15px]"
              >
                <div className="flex w-full items-center justify-between gap-4 p-6">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSlug(isOpen ? null : service.slug)
                    }
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-mint text-primary-green">
                      <Icon size={28} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-primary-dark">
                        {service.title}
                      </h2>
                      <p className="text-primary-dark/70">{service.summary}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={service.href}
                      className="hidden items-center gap-1 rounded-full border border-primary-green px-4 py-2 text-sm font-semibold text-primary-green transition-colors hover:bg-secondary-mint sm:inline-flex"
                    >
                      Подробнее
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSlug(isOpen ? null : service.slug)
                      }
                      className={cn(
                        "text-2xl text-primary-green transition-transform",
                        isOpen && "rotate-45",
                      )}
                      aria-label={isOpen ? "Свернуть" : "Развернуть"}
                    >
                      +
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-neutral-border px-6 pt-2 pb-6">
                        <p className="mb-4 leading-relaxed text-primary-dark/80">
                          {service.description}
                        </p>
                        <p className="mb-4 text-sm text-primary-dark/60">
                          <span className="font-semibold text-primary-dark">
                            Подготовка:{" "}
                          </span>
                          {service.preparation}
                        </p>
                        {service.showAnimation && <EnmgSignalAnimation />}
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={service.href}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-green px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
                          >
                            Страница услуги <ArrowRight size={18} />
                          </Link>
                          <Link
                            href="/prices"
                            className="inline-flex items-center gap-2 rounded-full border border-primary-green px-6 py-3 font-medium text-primary-green transition-colors hover:bg-secondary-mint"
                          >
                            Цены
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
