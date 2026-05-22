"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

type ServiceFaqItemProps = {
  q: string;
  a: string;
};

export function ServiceFaqItem({ q, a }: ServiceFaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`service-landing__faq-item${open ? " service-landing__faq-item--open" : ""}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="service-landing__faq-trigger"
        aria-expanded={open}
      >
        <span>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-primary-green" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="service-landing__faq-body-wrap"
          >
            <p className="service-landing__faq-answer">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
