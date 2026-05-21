import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Цены",
};

export default function PricesPage() {
  return (
    <div className="bg-neutral-bg py-24">
      <div className="container mx-auto max-w-3xl px-6 text-center">
        <h1 className="mb-6 text-4xl font-bold text-primary-dark">Цены</h1>
        <p className="mb-8 text-lg text-primary-dark/70">
          Прозрачный прайс с карточками услуг, поиском и блоком «Что входит?»
          будет подключён к базе данных после настройки MySQL и наполнения через
          админ-панель.
        </p>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 rounded-full bg-primary-green px-6 py-3 font-medium text-white hover:bg-primary-dark"
        >
          Записаться <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
