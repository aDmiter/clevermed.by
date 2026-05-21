import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Отзывы",
};

export default function ReviewsPage() {
  return (
    <div className="bg-white py-24">
      <div className="container mx-auto max-w-3xl px-6 text-center">
        <h1 className="mb-6 text-4xl font-bold text-primary-dark">Отзывы</h1>
        <p className="mb-8 text-lg text-primary-dark/70">
          Видео-отзыв, Masonry-сетка карточек и модерация через админ-панель
          будут добавлены после подключения базы данных.
        </p>
        <Link href="/" className="font-semibold text-primary-green hover:text-primary-dark">
          На главную
        </Link>
      </div>
    </div>
  );
}
