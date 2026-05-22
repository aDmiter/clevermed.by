"use client";

import "@/styles/blocks/service-landing.css";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Phone,
  Shield,
} from "lucide-react";
import { useSiteBooking } from "@/components/providers/site-booking-provider";
import type { ServiceLandingContent } from "@/lib/services-catalog";
import { SERVICE_ICONS } from "@/lib/service-icons";
import { SITE_CONTACT } from "@/lib/site-contact";
import { NeuronAnimation } from "@/components/site/neuron-animation";
import { EnmgSignalAnimation } from "@/components/site/enmg-signal-animation";
import { LabFlaskAnimation } from "@/components/site/lab-flask-animation";
import { UziMonitorAnimation } from "@/components/site/uzi-monitor-animation";
import { ServiceFaqItem } from "@/components/site/service-faq-item";
import { ServiceDoctorsCarousel } from "@/components/site/service-doctors-carousel";
import type { DoctorCard } from "@/components/site/doctors-page";

type ServiceLandingPageProps = {
  content: ServiceLandingContent;
  doctors: DoctorCard[];
};

function HeroVisual({ visual }: { visual: ServiceLandingContent["heroVisual"] }) {
  if (visual === "neuron") return <NeuronAnimation />;
  if (visual === "enmg") return <EnmgSignalAnimation />;
  if (visual === "lab") return <LabFlaskAnimation />;
  if (visual === "waves") return <UziMonitorAnimation />;
  return (
    <div className="service-landing__hero-placeholder">
      <div className="service-landing__hero-placeholder-ring" />
    </div>
  );
}

export function ServiceLandingPage({ content, doctors }: ServiceLandingPageProps) {
  const { bookHref } = useSiteBooking();
  const Icon = SERVICE_ICONS[content.icon];

  return (
    <div className="service-landing">
      <div className="service-landing__breadcrumb container mx-auto px-6 pt-8">
        <Link href="/">Главная</Link>
        <ChevronRight size={13} aria-hidden />
        <Link href="/services">Услуги</Link>
        <ChevronRight size={13} aria-hidden />
        <span>{content.navLabel}</span>
      </div>

      <section className="service-landing__hero">
        <div className="service-landing__hero-glow" aria-hidden />
        <div className="service-landing__hero-grid container mx-auto px-6 py-16">
          <div>
            <div className="service-landing__dept-badge">
              <span className="service-landing__dept-icon">
                <Icon size={18} />
              </span>
              <span>{content.departmentLabel}</span>
            </div>

            <h1 className="service-landing__hero-title">
              {content.heroTitle}
              <br />
              <span>{content.heroTitleAccent}</span>
            </h1>

            <p className="service-landing__hero-lead">{content.heroDescription}</p>

            <div className="service-landing__hero-badges">
              {content.heroBadges.map((text) => (
                <span key={text} className="service-landing__hero-badge">
                  <CheckCircle2 size={15} />
                  {text}
                </span>
              ))}
            </div>

            <div className="service-landing__hero-actions">
              <Link href={bookHref} className="service-landing__btn service-landing__btn--primary">
                Записаться <ArrowRight size={15} />
              </Link>
              <a
                href={`tel:${SITE_CONTACT.phoneTel}`}
                className="service-landing__btn service-landing__btn--outline"
              >
                <Phone size={15} /> Позвонить
              </a>
            </div>

            <div className="service-landing__price-badge">
              <span>Стоимость</span>
              <strong>{content.priceFrom}</strong>
            </div>
          </div>

          <div className="service-landing__hero-visual">
            <HeroVisual visual={content.heroVisual} />
            <motion.div
              className="service-landing__float-card service-landing__float-card--bl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p>Направлений лечения</p>
              <strong>50+ диагнозов</strong>
            </motion.div>
            <motion.div
              className="service-landing__float-card service-landing__float-card--tr"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <p>Опыт команды</p>
              <strong>15+ лет</strong>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="service-landing__banner-media">
          <Image
            src="/images/services-bg.jpg"
            alt=""
            width={1200}
            height={400}
            className="service-landing__banner-img"
          />
          <div className="service-landing__banner-caption">
            <p>{content.bannerTitle}</p>
            <span>{content.bannerSubtitle}</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="service-landing__section-head">
          <p className="service-landing__eyebrow">ЧТО ЛЕЧИМ</p>
          <h2>{content.conditionsTitle}</h2>
        </div>
        <div className="service-landing__conditions-grid">
          {content.conditions.map((c) => (
            <div key={c.title} className="service-landing__condition-card">
              <div className="service-landing__condition-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="service-landing__steps-section">
        <div className="service-landing__steps-inner container mx-auto px-6 py-16">
          <div className="service-landing__section-head service-landing__section-head--center">
            <p className="service-landing__eyebrow">ПУТЬ ПАЦИЕНТА</p>
            <h2>Как проходит визит</h2>
          </div>
          <div className="service-landing__steps-list">
            {content.steps.map((s) => (
              <div key={s.num} className="service-landing__step">
                <div className="service-landing__step-num">{s.num}</div>
                <div className="service-landing__step-card">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="service-landing__eyebrow">ДИАГНОСТИКА В ЦЕНТРЕ</p>
          <h2 className="service-landing__block-title">Исследования и цены</h2>
          <p className="service-landing__block-lead">
            Основные процедуры выполняются в Clevermed — без лишних направлений
            в другие клиники.
          </p>
          <div className="service-landing__diag-list">
            {content.diagnostics.map((d, i) => (
              <div
                key={d.label}
                className={`service-landing__diag-row${i % 2 === 0 ? " service-landing__diag-row--alt" : ""}`}
              >
                <div className="service-landing__diag-label">
                  <CheckCircle2 size={15} />
                  <span>{d.label}</span>
                </div>
                <div className="service-landing__diag-meta">
                  <strong>{d.price}</strong>
                </div>
              </div>
            ))}
          </div>
          <Link href="/prices" className="service-landing__link-btn">
            Полный прайс <ArrowRight size={14} />
          </Link>
        </div>

        <div className="service-landing__why-card">
          <h3>Почему выбирают Clevermed</h3>
          <p>Ясность диагноза и забота с первой минуты визита.</p>
          <div className="service-landing__why-list">
            {content.whyChoose.map((w) => (
              <div key={w.title} className="service-landing__why-item">
                <Shield size={16} />
                <div>
                  <p>{w.title}</p>
                  <span>{w.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="service-landing__doctors-cta">
        <div className="container mx-auto px-6 py-14">
          <div className="service-landing__doctors-head">
            <div>
              <p className="service-landing__eyebrow">ВРАЧИ</p>
              <h2 className="service-landing__block-title">Наши специалисты</h2>
            </div>
            <Link href="/doctors" className="service-landing__link-btn">
              Вся команда <ArrowRight size={14} />
            </Link>
          </div>
          <ServiceDoctorsCarousel doctors={doctors} />
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-6 py-16">
        <div className="service-landing__section-head service-landing__section-head--center">
          <p className="service-landing__eyebrow">FAQ</p>
          <h2>Частые вопросы</h2>
        </div>
        <div className="service-landing__faq-list">
          {content.faqs.map((f) => (
            <ServiceFaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      <section className="service-landing__cta">
        <div className="container mx-auto max-w-2xl px-6 py-20 text-center">
          <h2>Готовы записаться на {content.navLabel.toLowerCase()}?</h2>
          <p>Запишитесь онлайн или позвоните — подберём удобное время.</p>
          <div className="service-landing__hero-actions service-landing__hero-actions--center">
            <Link href={bookHref} className="service-landing__btn service-landing__btn--glass">
              Записаться онлайн <ArrowRight size={15} />
            </Link>
            <a
              href={`tel:${SITE_CONTACT.phoneTel}`}
              className="service-landing__btn service-landing__btn--glass-outline"
            >
              <Phone size={15} /> {SITE_CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
