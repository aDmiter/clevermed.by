"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useSiteBooking } from "@/components/providers/site-booking-provider";
import { formatPriceAmount, type PriceListItem } from "@/lib/prices";

type PriceCardProps = {
  item: PriceListItem;
};

export function PriceCard({ item }: PriceCardProps) {
  const { bookHref } = useSiteBooking();
  const [open, setOpen] = useState(false);
  const hasIncludes = item.includes.length > 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="price-card"
    >
      <div className="price-card__header">
        <div className="price-card__body">
          <h3 className="price-card__title">{item.name}</h3>
        </div>
        <div className="price-card__price-col">
          <p className="price-card__amount">
            {formatPriceAmount(item.price, item.currency)}
          </p>
          {hasIncludes ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="price-card__toggle"
              aria-expanded={open}
            >
              Что входит
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {open && hasIncludes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="price-card__details"
          >
            <div className="price-card__details-inner">
              <ul className="price-card__includes">
                {item.includes.map((line) => (
                  <li key={line} className="price-card__includes-item">
                    <span className="price-card__includes-dot" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <Link href={bookHref} className="price-card__book">
                Записаться на услугу
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
