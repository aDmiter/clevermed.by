"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ArrowRight, Brain, HeartPulse, TestTube } from "lucide-react";
import { EnmgSignalAnimation } from "@/components/site/enmg-signal-animation";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "neurology",
    icon: Brain,
    title: "Неврология",
    summary: "Диагностика и лечение заболеваний нервной системы.",
    description:
      "Комплексный подход к головным болям, головокружению, нарушениям памяти и другим неврологическим симптомам.",
    preparation: "Возьмите результаты предыдущих обследований и список принимаемых препаратов.",
  },
  {
    id: "ultrasound",
    icon: HeartPulse,
    title: "УЗИ-диагностика",
    summary: "Высокоточная визуализация сосудов и мягких тканей.",
    description:
      "Современное оборудование для быстрой и безопасной диагностики без лучевой нагрузки.",
    preparation: "Уточните требования к подготовке при записи — они зависят от зоны исследования.",
  },
  {
    id: "enmg",
    icon: Activity,
    title: "ЭНМГ",
    summary: "Исследование проводимости нервов и мышечной активности.",
    description:
      "Помогает выявить компрессии, полинейропатии и другие нарушения периферической нервной системы.",
    preparation: "Избегайте кремов на коже в день процедуры; наденьте удобную одежду.",
    showAnimation: true,
  },
  {
    id: "lab",
    icon: TestTube,
    title: "Лабораторные анализы",
    summary: "Широкий спектр исследований с быстрой выдачей результатов.",
    description:
      "Анализы подбираются врачом индивидуально для уточнения диагноза и контроля терапии.",
    preparation: "Для части анализов требуется голодание — мы сообщим при записи.",
  },
];

export function ServicesPage() {
  const [openId, setOpenId] = useState<string | null>("neurology");

  return (
    <div className="bg-neutral-bg py-24">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-primary-dark md:text-5xl">
            Услуги
          </h1>
          <p className="text-lg text-primary-dark/70">
            Раскройте панель, чтобы узнать подробности, подготовку и записаться.
          </p>
        </div>

        <div className="space-y-4">
          {services.map((service) => {
            const isOpen = openId === service.id;
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 shadow-sm backdrop-blur-[15px]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenId(isOpen ? null : service.id)
                  }
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-mint text-primary-green">
                      <Icon size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary-dark">
                        {service.title}
                      </h2>
                      <p className="text-primary-dark/70">{service.summary}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-2xl text-primary-green transition-transform",
                      isOpen && "rotate-45",
                    )}
                  >
                    +
                  </span>
                </button>

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
                        {"showAnimation" in service && service.showAnimation && (
                          <EnmgSignalAnimation />
                        )}
                        <Link
                          href="/prices"
                          className="inline-flex items-center gap-2 rounded-full bg-primary-green px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
                        >
                          Цены и запись <ArrowRight size={18} />
                        </Link>
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
