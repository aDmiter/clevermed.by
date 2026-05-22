"use client";

import { motion } from "motion/react";
import { TestTube } from "lucide-react";

const BUBBLES = [
  { left: "38%", delay: 0, size: 6 },
  { left: "52%", delay: 0.8, size: 5 },
  { left: "46%", delay: 1.6, size: 7 },
  { left: "56%", delay: 2.2, size: 4 },
  { left: "42%", delay: 2.9, size: 5 },
];

export function LabFlaskAnimation() {
  return (
    <div className="service-landing__lab-visual" aria-hidden>
      <motion.div
        className="service-landing__lab-visual-glow"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.55, 0.85, 0.55],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="service-landing__lab-visual-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {BUBBLES.map((bubble, i) => (
        <motion.span
          key={i}
          className="service-landing__lab-bubble"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
          }}
          initial={{ bottom: "32%", opacity: 0 }}
          animate={{
            bottom: ["32%", "58%", "72%"],
            opacity: [0, 0.85, 0],
            scale: [0.6, 1, 0.4],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        className="service-landing__lab-icon-wrap"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="service-landing__lab-liquid"
          animate={{ height: ["38%", "52%", "42%", "38%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <TestTube
          className="service-landing__lab-icon"
          strokeWidth={1.35}
          aria-hidden
        />
      </motion.div>
    </div>
  );
}
