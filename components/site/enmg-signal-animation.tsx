"use client";

import { motion } from "motion/react";

export function EnmgSignalAnimation() {
  return (
    <div
      className="my-6 rounded-2xl border border-white/80 bg-white/50 p-6"
      aria-label="Схема прохождения сигнала по нерву"
    >
      <svg viewBox="0 0 400 120" className="h-auto w-full" role="img">
        <defs>
          <linearGradient id="nerveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E6F4EF" />
            <stop offset="100%" stopColor="#016143" />
          </linearGradient>
        </defs>
        <path
          d="M40,60 Q120,20 200,60 T360,60"
          fill="none"
          stroke="url(#nerveGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="40" cy="60" r="10" fill="#016143" />
        <circle cx="360" cy="60" r="10" fill="#E07A5F" opacity="0.8" />
        <motion.circle
          r="8"
          cy="60"
          fill="#016143"
          initial={{ cx: 40 }}
          animate={{ cx: [40, 200, 360, 40] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <p className="mt-3 text-center text-sm text-primary-dark/60">
        Импульс проходит по нерву — так мы оцениваем проводимость
      </p>
    </div>
  );
}
