"use client";

import { motion } from "motion/react";

export function NeuronAnimation() {
  return (
    <div className="service-landing__neuron" aria-hidden>
      <svg viewBox="0 0 320 320" className="service-landing__neuron-svg">
        <defs>
          <radialGradient id="neuronGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E6F4EF" />
            <stop offset="100%" stopColor="#016143" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" r="140" fill="url(#neuronGlow)" />
        {[
          [80, 120],
          [160, 80],
          [240, 120],
          [200, 200],
          [120, 200],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <motion.circle
              cx={cx}
              cy={cy}
              r="14"
              fill="#016143"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.35,
                ease: "easeInOut",
              }}
            />
            <line
              x1="160"
              y1="160"
              x2={cx}
              y2={cy}
              stroke="#016143"
              strokeOpacity="0.25"
              strokeWidth="2"
            />
          </g>
        ))}
        <circle cx="160" cy="160" r="22" fill="#016143" />
        <motion.circle
          r="6"
          fill="#E07A5F"
          animate={{
            cx: [160, 240, 200, 120, 80, 160],
            cy: [160, 120, 200, 200, 120, 160],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
