"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriceCategoryFilter, PriceListItem } from "@/lib/prices";
import { PriceCard } from "@/components/site/price-card";
import { formatPriceAmount } from "@/lib/prices";
import { ChevronDown } from "lucide-react";

type PricesPageProps = {
  items: PriceListItem[];
  categories: PriceCategoryFilter[];
};

export function PricesPage({ items, categories }: PricesPageProps) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const groupedCategories = useMemo(() => {
    const byCategoryId = new Map<
      string,
      { label: string; items: PriceListItem[]; minItem?: PriceListItem }
    >();

    for (const item of items) {
      const key = item.categoryId;
      const entry =
        byCategoryId.get(key) ??
        (() => {
          const created = {
            label: item.categoryName,
            items: [] as PriceListItem[],
            minItem: undefined as PriceListItem | undefined,
          };
          byCategoryId.set(key, created);
          return created;
        })();

      entry.items.push(item);
      if (!entry.minItem || item.price < entry.minItem.price) {
        entry.minItem = item;
      }
    }

    // Сохраняем порядок категорий, как пришёл с сервера (sortOrder из БД)
    const ordered = categories
      .filter((c) => c.id !== "all")
      .map((c) => ({
        id: c.id,
        label: c.label,
        ...byCategoryId.get(c.id),
      }))
      .filter(
        (c): c is {
          id: string;
          label: string;
          items: PriceListItem[];
          minItem?: PriceListItem;
        } => Boolean(c?.items && c.items.length > 0),
      );

    // Поиск применяется уже к отображению внутри категории.
    return ordered.map((cat) => {
      const visibleItems = query
        ? cat.items.filter((item) => {
            return (
              item.name.toLowerCase().includes(query) ||
              item.categoryName.toLowerCase().includes(query)
            );
          })
        : cat.items;
      return { ...cat, visibleItems };
    }).filter((cat) => cat.visibleItems.length > 0);
  }, [items, categories, query]);

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

        <div className="prices-page__accordion" role="list">
          {groupedCategories.map((cat, index) => {
            const min = cat.minItem;
            const minLabel =
              min != null ? `от ${formatPriceAmount(min.price, min.currency)}` : "";

            return (
              <details
                key={cat.id}
                className="prices-page__category"
                open={index === 0}
              >
                <summary className="prices-page__category-summary">
                  <span className="prices-page__category-chevron" aria-hidden>
                    <ChevronDown size={18} />
                  </span>
                  <span className="prices-page__category-title">{cat.label}</span>
                  <span className="prices-page__category-min">{minLabel}</span>
                </summary>
                <div className="prices-page__category-body">
                  <div className="prices-page__list">
                    {cat.visibleItems.map((item) => (
                      <PriceCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        {groupedCategories.length === 0 && (
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
