"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { useSiteBooking } from "@/components/providers/site-booking-provider";
import type { DoctorCard } from "@/components/site/doctors-page";

type ServiceDoctorsCarouselProps = {
  doctors: DoctorCard[];
};

export function ServiceDoctorsCarousel({ doctors }: ServiceDoctorsCarouselProps) {
  const { doctorBookHref } = useSiteBooking();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateControls = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);

    const cards = el.querySelectorAll<HTMLElement>(".service-landing__doctor-card");
    if (cards.length === 0) return;

    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - scrollCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateControls();
    el.addEventListener("scroll", updateControls, { passive: true });
    const ro = new ResizeObserver(updateControls);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateControls);
      ro.disconnect();
    };
  }, [doctors, updateControls]);

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>(".service-landing__doctor-card")[index];
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  const scroll = (direction: -1 | 1) => {
    const next = Math.min(
      doctors.length - 1,
      Math.max(0, activeIndex + direction),
    );
    scrollToIndex(next);
  };

  if (doctors.length === 0) return null;

  return (
    <div className="service-landing__doctors-stage">
      <div className="service-landing__doctors-glow" aria-hidden />
      <div className="service-landing__doctors-glow service-landing__doctors-glow--alt" aria-hidden />

      <div className="service-landing__doctors-carousel">
        <div
          className="service-landing__doctors-fade service-landing__doctors-fade--left"
          aria-hidden
        />
        <div
          className="service-landing__doctors-fade service-landing__doctors-fade--right"
          aria-hidden
        />

        <div
          ref={trackRef}
          className="service-landing__doctors-track"
          role="list"
          aria-label="Карусель врачей"
        >
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="service-landing__doctor-card"
              role="listitem"
            >
              <div className="service-landing__doctor-photo-wrap">
                <div className="service-landing__doctor-photo">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    sizes="(max-width: 640px) 88vw, (max-width: 1024px) 280px, 320px"
                    className="service-landing__doctor-img"
                  />
                  <div className="service-landing__doctor-photo-shade" aria-hidden />
                </div>
                {doctor.experience ? (
                  <span className="service-landing__doctor-badge">
                    <Award size={13} aria-hidden />
                    {doctor.experience}
                  </span>
                ) : null}
              </div>

              <div className="service-landing__doctor-body">
                <h3 className="service-landing__doctor-name">{doctor.name}</h3>
                <p className="service-landing__doctor-title">{doctor.title}</p>
                {doctor.specialty ? (
                  <p className="service-landing__doctor-specialty">
                    <Stethoscope size={14} aria-hidden />
                    <span>{doctor.specialty}</span>
                  </p>
                ) : null}
                <Link
                  href={doctorBookHref(doctor.id)}
                  className="service-landing__doctor-cta"
                >
                  Записаться
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="service-landing__doctors-controls">
        <button
          type="button"
          className="service-landing__doctors-nav"
          onClick={() => scroll(-1)}
          disabled={!canPrev}
          aria-label="Предыдущий врач"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>

        <div
          className="service-landing__doctors-dots"
          role="tablist"
          aria-label="Выбор врача в карусели"
        >
          {doctors.map((doctor, index) => (
            <button
              key={doctor.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`${doctor.name}, слайд ${index + 1}`}
              className={
                activeIndex === index
                  ? "service-landing__doctors-dot service-landing__doctors-dot--active"
                  : "service-landing__doctors-dot"
              }
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>

        <span className="service-landing__doctors-counter" aria-live="polite">
          {activeIndex + 1}
          <span className="service-landing__doctors-counter-sep">/</span>
          {doctors.length}
        </span>

        <button
          type="button"
          className="service-landing__doctors-nav"
          onClick={() => scroll(1)}
          disabled={!canNext}
          aria-label="Следующий врач"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
