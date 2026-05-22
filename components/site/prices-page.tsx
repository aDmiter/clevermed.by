"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriceCategoryFilter, PriceListItem } from "@/lib/prices";
import {
  allCategoriesIcon,
  getCategoryIcon,
} from "@/lib/prices-category-icons";
import { PriceCard } from "@/components/site/price-card";

type PricesPageProps = {
  items: PriceListItem[];
  categories: PriceCategoryFilter[];
};

export function PricesPage({ items, categories }: PricesPageProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        categoryId === "all" || item.categoryId === categoryId;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, categoryId]);

  return (
    <div className="prices-page">
      <section className="prices-page__hero">
        <div className="prices-page__hero-inner">
          <p className="prices-page__eyebrow">Прозрачные цены</p>
          <h1 className="prices-page__title">Понятный прайс без сюрпризов</h1>
          <p className="prices-page__lead">
            В стоимость входит всё, что указано в карточке. Без скрытых доплат и
            неожиданных дополнений на приёме.
          </p>
        </div>
      </section>

      <section className="prices-page__content">
        <label className="prices-page__search">
          <Search size={18} className="prices-page__search-icon" aria-hidden />
          <input
            type="search"
            className="prices-page__search-input"
            placeholder="Поиск по названию услуги или категории…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="prices-page__filters" role="group" aria-label="Категории">
          {categories.map((category) => {
            const Icon =
              category.id === "all"
                ? allCategoriesIcon
                : getCategoryIcon(category.slug);
            const active = categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  "prices-page__filter",
                  active && "prices-page__filter--active",
                )}
              >
                {Icon ? <Icon size={14} aria-hidden /> : null}
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        <motion.div className="prices-page__list" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <PriceCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="prices-page__empty">
            <Search size={36} className="prices-page__empty-icon" aria-hidden />
            <p>Ничего не найдено. Попробуйте другой запрос или категорию.</p>
          </div>
        )}

        <aside className="prices-page__banner">
          <div className="flex-1">
            <p className="prices-page__banner-title">
              Нужен индивидуальный план обследования?
            </p>
            <p className="prices-page__banner-text">
              Специалисты Clevermed подберут диагностику под вашу ситуацию.
            </p>
          </div>
          <Link href="/contacts" className="prices-page__banner-link">
            Связаться с нами
          </Link>
        </aside>
      </section>
    </div>
  );
}
