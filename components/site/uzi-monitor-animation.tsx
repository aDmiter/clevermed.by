"use client";

import { motion } from "motion/react";

const ECHO_ARCS = [
  { d: "M55 95 Q95 75 135 95 Q115 115 75 105 Z", delay: 0 },
  { d: "M70 108 Q100 88 125 102 Q108 122 82 118 Z", delay: 0.6 },
  { d: "M88 92 Q108 82 118 98", delay: 1.1, stroke: true },
];

export function UziMonitorAnimation() {
  return (
    <div className="service-landing__uzi-visual" aria-hidden>
      <motion.div
        className="service-landing__uzi-visual-glow"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.5, 0.82, 0.5],
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="service-landing__uzi-visual-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="service-landing__uzi-monitor"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="service-landing__uzi-monitor-frame">
          <div className="service-landing__uzi-monitor-bezel">
            <span className="service-landing__uzi-monitor-led" />
            <span className="service-landing__uzi-monitor-label">УЗИ</span>
          </div>

          <div className="service-landing__uzi-monitor-screen">
            <svg
              viewBox="0 0 200 140"
              className="service-landing__uzi-monitor-svg"
              role="img"
              aria-label="Схема ультразвукового сканирования"
            >
              <defs>
                <linearGradient id="uziScanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#016143" stopOpacity="0" />
                  <stop offset="50%" stopColor="#016143" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#016143" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="uziEchoGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E6F4EF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#016143" stopOpacity="0.15" />
                </radialGradient>
              </defs>

              <rect
                x="0"
                y="0"
                width="200"
                height="140"
                fill="url(#uziEchoGrad)"
                opacity="0.35"
              />

              {ECHO_ARCS.map((arc, i) =>
                arc.stroke ? (
                  <motion.path
                    key={i}
                    d={arc.d}
                    fill="none"
                    stroke="#016143"
                    strokeWidth="2"
                    strokeOpacity="0.35"
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      delay: arc.delay,
                      ease: "easeInOut",
                    }}
                  />
                ) : (
                  <motion.path
                    key={i}
                    d={arc.d}
                    fill="#016143"
                    animate={{ opacity: [0.12, 0.38, 0.12], scale: [0.98, 1.02, 0.98] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      delay: arc.delay,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "100px 100px" }}
                  />
                ),
              )}

              {[0, 1, 2].map((i) => (
                <motion.path
                  key={`wave-${i}`}
                  d={`M20 ${100 + i * 8} Q60 ${88 + i * 6} 100 ${100 + i * 8} T180 ${100 + i * 8}`}
                  fill="none"
                  stroke="#016143"
                  strokeWidth="1.5"
                  strokeOpacity="0.25"
                  animate={{
                    d: [
                      `M20 ${100 + i * 8} Q60 ${88 + i * 6} 100 ${100 + i * 8} T180 ${100 + i * 8}`,
                      `M20 ${100 + i * 8} Q60 ${112 + i * 6} 100 ${100 + i * 8} T180 ${100 + i * 8}`,
                      `M20 ${100 + i * 8} Q60 ${88 + i * 6} 100 ${100 + i * 8} T180 ${100 + i * 8}`,
                    ],
                    opacity: [0.15, 0.45, 0.15],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}

              <motion.line
                x1="0"
                x2="200"
                stroke="url(#uziScanGrad)"
                strokeWidth="3"
                animate={{ y1: [18, 122, 18], y2: [18, 122, 18] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
              />

              <motion.circle
                cx="100"
                cy="72"
                r="28"
                fill="none"
                stroke="#016143"
                strokeWidth="1"
                strokeOpacity="0.2"
                animate={{ r: [24, 32, 24], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            <motion.div
              className="service-landing__uzi-scan-sheen"
              animate={{ top: ["-20%", "120%", "-20%"] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        <div className="service-landing__uzi-monitor-stand">
          <div className="service-landing__uzi-monitor-neck" />
          <div className="service-landing__uzi-monitor-base" />
        </div>
      </motion.div>
    </div>
  );
}
