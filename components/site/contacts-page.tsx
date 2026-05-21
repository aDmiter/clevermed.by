"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export type ContactData = {
  address: string;
  phone: string;
  email: string;
  hours: { label: string; value: string; highlight?: boolean }[];
};

const defaultContact: ContactData = {
  address: "г. Минск, ул. Примерная, 1",
  phone: "+375 (29) 123-45-67",
  email: "info@clevermed.by",
  hours: [
    { label: "Пн – Пт:", value: "8:00 – 20:00" },
    { label: "Суббота:", value: "9:00 – 17:00" },
    { label: "Воскресенье:", value: "только экстренные случаи", highlight: true },
  ],
};

type ContactsPageProps = {
  contact?: ContactData;
};

export function ContactsPage({ contact = defaultContact }: ContactsPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contact.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phoneHref = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col md:flex-row">
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#e9ecef]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#016143 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full text-primary-green/10"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,100 C150,200 300,0 500,100 C700,200 850,0 1000,100 L1000,1000 L0,1000 Z"
            fill="currentColor"
          />
          <path
            d="M200,0 L200,1000 M500,0 L500,1000 M800,0 L800,1000"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M0,300 L1000,300 M0,600 L1000,600 M0,900 L1000,900"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="absolute top-1/2 left-2/3 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
          <div className="relative z-10 mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-green text-white shadow-lg">
            <MapPin size={24} />
          </div>
          <div className="h-2 w-4 rounded-[100%] bg-primary-dark/20 blur-[2px]" />
        </motion.div>
      </div>

      <div className="container relative z-10 mx-auto flex items-center justify-start px-6 py-20 md:py-0">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-[2rem] border border-white bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-[25px]"
        >
          <h1 className="mb-2 text-4xl font-bold text-primary-dark">
            Связаться с нами
          </h1>
          <p className="mb-8 text-primary-dark/60">
            Мы поможем вам обрести когнитивное спокойствие. Запишитесь на визит
            удобным способом.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-mint text-primary-green">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-sm font-bold text-primary-dark">
                  Адрес клиники
                </p>
                <p className="mb-3 text-sm text-primary-dark/80">
                  {contact.address}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-green transition-colors hover:text-primary-dark"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={14} /> Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Скопировать адрес
                    </>
                  )}
                </button>
              </div>
            </div>

            <a
              href={phoneHref}
              className="group flex items-center gap-4 rounded-2xl border border-white/60 bg-white/50 p-4 transition-colors hover:bg-white/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-mint text-primary-green transition-colors group-hover:bg-primary-green group-hover:text-white">
                <Phone size={20} />
              </div>
              <div>
                <p className="mb-0.5 text-sm font-bold text-primary-dark">
                  Телефон (звонок в один клик)
                </p>
                <p className="text-sm text-primary-dark/80">{contact.phone}</p>
              </div>
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="group flex items-center gap-4 rounded-2xl border border-white/60 bg-white/50 p-4 transition-colors hover:bg-white/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-mint text-primary-green transition-colors group-hover:bg-primary-green group-hover:text-white">
                <Mail size={20} />
              </div>
              <div>
                <p className="mb-0.5 text-sm font-bold text-primary-dark">
                  Email
                </p>
                <p className="text-sm text-primary-dark/80">{contact.email}</p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-mint text-primary-green">
                <Clock size={20} />
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-primary-dark">
                  Часы работы
                </p>
                <ul className="space-y-1 text-sm text-primary-dark/80">
                  {contact.hours.map((row) => (
                    <li key={row.label} className="flex justify-between gap-4">
                      <span>{row.label}</span>
                      <span
                        className={
                          row.highlight
                            ? "font-medium text-accent-warmth"
                            : "font-medium"
                        }
                      >
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
