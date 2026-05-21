import { Award } from "lucide-react";

const defaultPartners = [
  "Ассоциация неврологов",
  "Сертификат качества 2025",
  "Стандарты MedTech",
  "Партнёр Global Health",
  "Премия «Забота о пациенте»",
];

type TrustStripProps = {
  partners?: string[];
};

export function TrustStrip({ partners = defaultPartners }: TrustStripProps) {
  const items = [...partners, ...partners, ...partners];

  return (
    <section className="trust-strip">
      <div className="container mx-auto overflow-hidden px-6">
        <div className="trust-strip__track">
          {items.map((partner, i) => (
            <div key={`${partner}-${i}`} className="trust-strip__item">
              <Award className="text-primary-green" size={24} />
              <span className="text-lg font-medium text-primary-dark">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
