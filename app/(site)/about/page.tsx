import { metadataForPath } from "@/lib/page-seo-server";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Microscope,
  Syringe,
} from "lucide-react";

export async function generateMetadata() {
  return metadataForPath("/about");
}

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page__container">
        <header className="about-page__hero">
          <span className="about-page__eyebrow">
            <Brain size={16} aria-hidden />
            Неврология в Бресте
          </span>
          <h1 className="about-page__title">
            Неврология в Бресте: точная диагностика, эффективное лечение боли и
            ЭНМГ
          </h1>
          <p className="about-page__lead">
            Статья для пациентов: когда нужна консультация, как проходит ЭНМГ и
            чем помогают лечебные блокады — без лишней «воды», с акцентом на
            понятные решения.
          </p>
        </header>

        <div className="about-page__grid">
          <div className="about-page__card">
            <div className="about-page__card-inner">
              <p className="about-page__text">
                По статистике, более 70% взрослого населения хотя бы раз
                испытывали боли в спине, онемение конечностей или
                головокружение. Часто мы списываем это на усталость, но именно
                эти сигналы — повод записаться к{" "}
                <strong>неврологу в Бресте</strong>. Современная неврология давно
                ушла от простого осмотра молоточком: сегодня это высокоточная
                диагностика и малоинвазивные методы, позволяющие поставить
                пациента на ноги без операции.
              </p>

              <div className="about-page__kpi" aria-label="Коротко о главном">
                <div className="about-page__kpi-item">
                  <span className="about-page__kpi-value">70%+</span>
                  <span className="about-page__kpi-label">
                    сталкиваются с болью / онемением хотя бы раз
                  </span>
                </div>
                <div className="about-page__kpi-item">
                  <span className="about-page__kpi-value">5–15 мин</span>
                  <span className="about-page__kpi-label">
                    типичное облегчение после блокады (по показаниям)
                  </span>
                </div>
              </div>

              <p className="about-page__text">
                Ниже — когда нужна консультация, как проходит{" "}
                <strong>ЭНМГ в Бресте</strong>, что такое{" "}
                <strong>лечебная блокада</strong> и почему выбор клиники имеет
                решающее значение.
              </p>
            </div>
          </div>

          <aside className="about-page__mini" aria-label="Быстрая навигация">
            <div className="about-page__mini-item">
              <span className="about-page__mini-icon" aria-hidden>
                <AlertTriangle size={16} />
              </span>
              <div>
                <p className="about-page__mini-title">Если болит сейчас</p>
                <p className="about-page__mini-text">
                  Не терпите острую боль. Часто важно купировать воспаление,
                  чтобы запустить восстановление.
                </p>
              </div>
            </div>
            <div className="about-page__mini-item">
              <span className="about-page__mini-icon" aria-hidden>
                <Microscope size={16} />
              </span>
              <div>
                <p className="about-page__mini-title">Если нужен диагноз</p>
                <p className="about-page__mini-text">
                  ЭНМГ помогает отличить поражение нерва от поражения мышцы —
                  тактика лечения меняется кардинально.
                </p>
              </div>
            </div>
            <div className="about-page__mini-item">
              <span className="about-page__mini-icon" aria-hidden>
                <CheckCircle2 size={16} />
              </span>
              <div>
                <p className="about-page__mini-title">Если нужна стратегия</p>
                <p className="about-page__mini-text">
                  Эффект держится дольше, когда лечение выстроено по этапам:
                  острый период → восстановление → профилактика.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <article className="about-page__article">
          <section className="about-page__section">
            <h2 className="about-page__section-title">
              <span className="about-page__section-icon" aria-hidden>
                <Activity size={18} />
              </span>
              Когда нужно посетить невролога? Основные симптомы
            </h2>
            <p className="about-page__text">
              Нервная система управляет всем организмом, поэтому симптомы могут
              быть нетипичными. Не откладывайте визит к{" "}
              <strong>неврологу</strong>, если вы наблюдаете у себя:
            </p>
            <ul className="about-page__list">
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Болевой синдром:</strong> острые или хронические боли в
                  шее, грудном отделе, пояснице (люмбаго, ишиас).
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Головные боли и мигрени:</strong> особенно если они
                  сопровождаются аурой или не снимаются обычными анальгетиками.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Головокружения и шаткость походки:</strong> чувство
                  «уплывающей земли» под ногами.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Онемение и слабость:</strong> ощущение «мурашек», ватные
                  ноги или руки, потеря чувствительности в пальцах.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Последствия травм и ДТП:</strong> даже хлыстовая травма
                  шеи может проявиться осложнениями спустя месяцы.
                </span>
              </li>
            </ul>
          </section>

          <section className="about-page__section">
            <h2 className="about-page__section-title">
              <span className="about-page__section-icon" aria-hidden>
                <Microscope size={18} />
              </span>
              ЭНМГ в Бресте: когда осмотра недостаточно
            </h2>
            <p className="about-page__text">
              Для постановки точного диагноза врачу часто требуется
              инструментальная диагностика. Золотым стандартом в выявлении
              патологий периферических нервов и мышц является{" "}
              <strong>электронейромиография (ЭНМГ)</strong>.
            </p>
            <p className="about-page__text">
              <strong>ЭНМГ</strong> — это метод, оценивающий проведение
              электрического импульса по нервам. Если вас беспокоит слабость в
              руке или ноге, а МРТ не показывает грыжу, проблема может быть в
              самом нерве.
            </p>

            <p className="about-page__text">
              <strong>Пройти ЭНМГ в Бресте</strong> необходимо при подозрении на:
            </p>
            <ul className="about-page__list">
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Туннельные синдромы</strong> (запястный, кубитальный,
                  синдром карпального канала);
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Полинейропатии</strong> различного происхождения
                  (диабетическая, алкогольная, токсическая);
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Радикулопатии</strong> и плексопатии;
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Поражения лицевого нерва</strong>.
                </span>
              </li>
            </ul>

            <div className="about-page__callout">
              <div className="about-page__callout-title">
                <CheckCircle2 size={18} aria-hidden />
                Важно
              </div>
              <p className="about-page__callout-text">
                Процедура <strong>ЭНМГ</strong> абсолютно безопасна и позволяет
                отличить поражение мышцы от поражения нерва, что кардинально
                меняет тактику лечения.
              </p>
            </div>
          </section>

          <section className="about-page__section">
            <h2 className="about-page__section-title">
              <span className="about-page__section-icon" aria-hidden>
                <Syringe size={18} />
              </span>
              Лечебные блокады: скорая помощь при острой боли
            </h2>
            <p className="about-page__text">
              Когда боль становится невыносимой, а таблетки и мази не работают,
              на помощь приходит <strong>лечебная блокада</strong>. Многие
              пациенты ошибочно называют это «уколом в спину», путая с простым
              обезболиванием. На самом деле <strong>блокада в неврологии</strong>{" "}
              — это ювелирное введение препарата (анестетика и кортикостероида)
              точно в очаг воспаления или нервное сплетение.
            </p>

            <h3 className="about-page__section-title" style={{ fontSize: "1.15rem" }}>
              <span className="about-page__section-icon" aria-hidden>
                <AlertTriangle size={18} />
              </span>
              Кому и зачем нужна блокада?
            </h3>
            <ul className="about-page__list">
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Остеохондроз и протрузии:</strong> снятие отека и
                  воспаления корешка нерва.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Межреберная невралгия:</strong> мгновенное устранение
                  боли, мешающей дышать.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Грыжи позвоночника:</strong> как компонент комплексного
                  консервативного лечения.
                </span>
              </li>
            </ul>

            <div className="about-page__callout">
              <div className="about-page__callout-title">
                <Activity size={18} aria-hidden />
                Главные преимущества
              </div>
              <div className="about-page__steps">
                <div className="about-page__step">
                  <span className="about-page__step-num">1</span>
                  <div>
                    <div className="about-page__step-title">Мгновенное действие</div>
                    <p className="about-page__step-text">
                      Облегчение часто наступает уже через 5–15 минут.
                    </p>
                  </div>
                </div>
                <div className="about-page__step">
                  <span className="about-page__step-num">2</span>
                  <div>
                    <div className="about-page__step-title">Локальный эффект</div>
                    <p className="about-page__step-text">
                      Лекарство действует в зоне боли и воспаления, минуя ЖКТ.
                    </p>
                  </div>
                </div>
                <div className="about-page__step">
                  <span className="about-page__step-num">3</span>
                  <div>
                    <div className="about-page__step-title">Разрыв порочного круга</div>
                    <p className="about-page__step-text">
                      Уменьшение боли помогает снять спазм и восстановить
                      кровообращение в тканях.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="about-page__section">
            <h2 className="about-page__section-title">
              <span className="about-page__section-icon" aria-hidden>
                <Brain size={18} />
              </span>
              Комплексный подход к лечению
            </h2>
            <p className="about-page__text">
              Хороший <strong>невролог в Бресте</strong> никогда не ограничивается
              одним методом. Терапия должна быть ступенчатой:
            </p>
            <div className="about-page__steps">
              <div className="about-page__step">
                <span className="about-page__step-num">1</span>
                <div>
                  <div className="about-page__step-title">Острый период</div>
                  <p className="about-page__step-text">
                    Купирование боли (НПВС, миорелаксанты, лечебные блокады).
                  </p>
                </div>
              </div>
              <div className="about-page__step">
                <span className="about-page__step-num">2</span>
                <div>
                  <div className="about-page__step-title">Подострый период</div>
                  <p className="about-page__step-text">
                    Физиотерапия, массаж, мануальная терапия, иглорефлексотерапия.
                  </p>
                </div>
              </div>
              <div className="about-page__step">
                <span className="about-page__step-num">3</span>
                <div>
                  <div className="about-page__step-title">Реабилитация</div>
                  <p className="about-page__step-text">
                    ЛФК для формирования крепкого мышечного корсета.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-page__section">
            <h2 className="about-page__section-title">
              <span className="about-page__section-icon" aria-hidden>
                <CheckCircle2 size={18} />
              </span>
              Как выбрать лучшего невролога в Бресте?
            </h2>
            <p className="about-page__text">
              Чтобы не тратить время и деньги зря, при выборе специалиста
              обращайте внимание на следующие критерии:
            </p>
            <ul className="about-page__list">
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Наличие собственной диагностики:</strong> возможность{" "}
                  <strong>сделать ЭНМГ в Бресте</strong> прямо в клинике на
                  первичном приеме экономит дни ожидания.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Мультидисциплинарность:</strong> сотрудничает ли невролог
                  с мануальным терапевтом, реабилитологом, ортопедом.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Владение техникой блокад:</strong> опытный врач знает
                  десятки видов блокад и применяет навигацию для точности.
                </span>
              </li>
              <li className="about-page__li">
                <CheckCircle2 className="about-page__li-icon" size={18} aria-hidden />
                <span>
                  <strong>Приверженность доказательной медицине:</strong>{" "}
                  назначаются процедуры и лекарства с клинически доказанной
                  эффективностью.
                </span>
              </li>
            </ul>

            <div className="about-page__cta">
              <div>
                <div className="about-page__cta-title">
                  Готовы разобраться с причинами боли?
                </div>
                <div className="about-page__cta-text">
                  Своевременная <strong>консультация невролога</strong> и{" "}
                  <strong>ЭНМГ</strong> помогают решить проблему на ранней стадии.
                </div>
              </div>
              <Link href="/contacts" className="about-page__cta-link">
                Записаться
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
