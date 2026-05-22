import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Brain,
  FlaskConical,
  LayoutGrid,
  Stethoscope,
  Waves,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "priem-konsultaciya": Brain,
  manipulyacii: Stethoscope,
  "funkcionalnaya-diagnostika": Activity,
  "ultrazvukovaya-diagnostika": Waves,
  analizy: FlaskConical,
};

export function getCategoryIcon(slug?: string): LucideIcon | undefined {
  if (!slug) return undefined;
  return CATEGORY_ICONS[slug];
}

export const allCategoriesIcon = LayoutGrid;
