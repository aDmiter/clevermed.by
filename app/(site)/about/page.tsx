import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас",
};

export default function AboutPage() {
  return (
    <div className="bg-secondary-mint py-24">
      <div className="container mx-auto max-w-3xl px-6 text-center">
        <h1 className="mb-6 text-4xl font-bold text-primary-dark">О нас</h1>
        <blockquote className="mb-8 rounded-3xl border border-white/80 bg-white/60 p-10 text-xl leading-relaxed text-primary-dark/90 backdrop-blur-[15px] italic">
          «Мы создаём пространство, где сложная неврология становится понятной,
          а пациент чувствует заботу с первой минуты визита.»
        </blockquote>
        <p className="text-primary-dark/70">
          Интерактивная временная шкала с параллаксом и контент из админ-панели
          появятся на следующем этапе разработки.
        </p>
      </div>
    </div>
  );
}
