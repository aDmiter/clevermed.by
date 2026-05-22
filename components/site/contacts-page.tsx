"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  defaultContactData,
  type ContactData,
} from "@/lib/site-contact";

type ContactsPageProps = {
  contact?: ContactData;
};

export function ContactsPage({ contact = defaultContactData }: ContactsPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contact.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="contacts-page">
      <div className="contacts-page__panel-wrap">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="contacts-page__panel"
        >
          <h1 className="contacts-page__title">Связаться с нами</h1>
          <p className="contacts-page__lead">
            Мы поможем вам обрести когнитивное спокойствие. Запишитесь на визит
            удобным способом.
          </p>

          <div className="contacts-page__list">
            <div className="contacts-page__card">
              <div className="contacts-page__icon">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="contacts-page__card-title">Адрес клиники</p>
                <p className="contacts-page__card-text">{contact.address}</p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="contacts-page__copy"
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
              href={`tel:${contact.phoneTel}`}
              className="contacts-page__card contacts-page__card--link"
            >
              <div className="contacts-page__icon">
                <Phone size={20} />
              </div>
              <div>
                <p className="contacts-page__card-title">Телефон</p>
                <p className="contacts-page__card-text">{contact.phone}</p>
              </div>
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="contacts-page__card contacts-page__card--link"
            >
              <div className="contacts-page__icon">
                <Mail size={20} />
              </div>
              <div>
                <p className="contacts-page__card-title">Email</p>
                <p className="contacts-page__card-text">{contact.email}</p>
              </div>
            </a>

            <div className="contacts-page__card">
              <div className="contacts-page__icon">
                <Clock size={20} />
              </div>
              <div>
                <p className="contacts-page__card-title">Часы работы</p>
                <ul className="contacts-page__hours">
                  {contact.hours.map((row) => (
                    <li key={row.label} className="contacts-page__hours-row">
                      <span>{row.label}</span>
                      <span className="contacts-page__hours-value">
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="contacts-page__card">
              <div className="contacts-page__icon">
                <FileText size={20} />
              </div>
              <div>
                <p className="contacts-page__card-title">Лицензия</p>
                <p className="contacts-page__license">{contact.licenseTitle}</p>
                <p className="contacts-page__license">{contact.licenseErl}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="contacts-page__map">
        <iframe
          src={contact.mapEmbedUrl}
          title="Карта — Clevermed, Брест"
          className="contacts-page__map-frame"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
