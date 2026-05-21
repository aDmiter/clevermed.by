import "dotenv/config";
import bcrypt from "bcryptjs";
import { formatDoctorName, parseFullName } from "../lib/doctors";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@clevermed.by";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-in-production";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Администратор" },
  });

  const categorySeed = [
    {
      slug: "priem-konsultaciya",
      name: "Прием врача-специалиста, консультация врача-специалиста",
      sortOrder: 1,
      services: [
        { title: "Консультация врача-специалиста", amount: 66.59 },
      ],
    },
    {
      slug: "manipulyacii",
      name: "Манипуляции общего назначения",
      sortOrder: 2,
      services: [
        {
          title:
            "Периартикулярная (околосуставная) блокада (без стоимости препарата)",
          amount: 47.73,
        },
        {
          title:
            "Блокада при синдроме грушевидной мышцы (без стоимости препарата)",
          amount: 47.73,
        },
        {
          title: "Блокада при туннельных синдромах (без стоимости препарата)",
          amount: 57.38,
        },
        {
          title: "Эпидуральная блокада (без стоимости препарата)",
          amount: 57.38,
        },
        {
          title: "Внутрисуставная блокада (без стоимости препарата)",
          amount: 38.55,
        },
        {
          title: "Паравертебральная блокада (без стоимости препарата)",
          amount: 38.55,
        },
        {
          title: "Мышечная блокада (без стоимости препарата)",
          amount: 38.55,
        },
        {
          title: "Блокада нерва под УЗИ контролем (без стоимости препарата)",
          amount: 224.36,
        },
      ],
    },
    {
      slug: "funkcionalnaya-diagnostika",
      name: "Функциональная диагностика",
      sortOrder: 3,
      services: [
        {
          title:
            "Электромиография с исследованием моторных волокон дополнительно 2 нерва",
          amount: 118.27,
        },
        {
          title:
            "Электромиография с исследованием сенсорных волокон дополнительно 2 нерва",
          amount: 132.61,
        },
        {
          title:
            "Электромиография с исследованием моторных волокон 1 нерва",
          amount: 60.13,
        },
        {
          title:
            "Электромиография с исследованием сенсорных волокон 1 нерва",
          amount: 67.3,
        },
        { title: "Электромиография игольчатая 1 мышца", amount: 149.2 },
        { title: "Вызванный потенциал одной модальности", amount: 132.12 },
      ],
    },
    {
      slug: "ultrazvukovaya-diagnostika",
      name: "Ультразвуковая диагностика",
      sortOrder: 4,
      services: [
        { title: "УЗИ печени", amount: 27.01 },
        { title: "УЗИ поджелудочной железы", amount: 27.01 },
        { title: "УЗИ селезенки", amount: 24.76 },
        { title: "УЗИ почек и надпочечников", amount: 39.39 },
        { title: "УЗИ мочевого пузыря", amount: 34.5 },
        {
          title: "УЗИ мочевого пузыря с определением остаточной мочи",
          amount: 36.75,
        },
        {
          title:
            "УЗИ предстательной железы с мочевым пузырём и определением остаточной мочи (трансабдоминально)",
          amount: 41.64,
        },
        { title: "УЗИ мошонки", amount: 36.75 },
        {
          title:
            "УЗИ матки и придатков с мочевым пузырём (трансабдоминально)",
          amount: 39.25,
        },
        { title: "УЗИ органов брюшной полости и почек", amount: 62.71 },
        { title: "УЗИ органов брюшной полости", amount: 56.08 },
        {
          title:
            "УЗИ щитовидной железы с лимфатическими поверхностными узлами",
          amount: 39.22,
        },
        {
          title: "УЗИ молочных желез с лимфатическими поверхностными узлами",
          amount: 41.55,
        },
        {
          title: "УЗИ слюнных желез (или подчелюстные или околоушные)",
          amount: 34.5,
        },
        { title: "УЗИ мягких тканей", amount: 34.79 },
        { title: "УЗИ плевроперикарда", amount: 44.85 },
        { title: "УЗИ плевральных полостей", amount: 11.2 },
        {
          title: "УЗИ периферических лимфатических узлов (одна локализация)",
          amount: 32.67,
        },
        {
          title: "УЗИ артерий (или вен) верхних конечностей",
          amount: 54.16,
        },
        { title: "УЗИ артерий нижних конечностей", amount: 58.81 },
        { title: "УЗИ вен нижних конечностей", amount: 58.81 },
        { title: "УЗИ сосудов нижних конечностей", amount: 72.51 },
        { title: "УЗИ сосудов верхних конечностей", amount: 67.85 },
        { title: "УЗИ БЦА", amount: 55.05 },
        { title: "УЗИ БЦА с проведением поворотных проб", amount: 69.03 },
        { title: "Комплексное УЗИ БЦА + ТКДА", amount: 83.12 },
        {
          title: "Комплексное УЗИ БЦА + ТКДА + функциональные пробы",
          amount: 111.07,
        },
        {
          title: "ТКДА артерий и вен основания головного мозга",
          amount: 53.22,
        },
        { title: "УЗИ брюшной аорты", amount: 44.93 },
        {
          title: "УЗИ сосудов одного анатомического региона (сосуды отдельных органов)",
          amount: 44.93,
        },
        { title: "УЗИ нерва", amount: 65.0 },
        {
          title: "УЗИ непарных суставов и окружающих мягких тканей",
          amount: 46.81,
        },
        {
          title: "УЗИ парных суставов и окружающих мягких тканей",
          amount: 54.19,
        },
      ],
    },
  ];

  for (const cat of categorySeed) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: { slug: cat.slug, name: cat.name, sortOrder: cat.sortOrder },
    });

    await prisma.service.deleteMany({ where: { categoryId: category.id } });

    let order = 0;
    for (const s of cat.services) {
      order += 1;
      const slug = `${cat.slug}-${String(order).padStart(3, "0")}`;
      await prisma.service.create({
        data: {
          slug,
          categoryId: category.id,
          title: s.title,
          amount: s.amount,
          sortOrder: order,
        },
      });
    }
  }

  const duration25 = await prisma.appointmentDuration.upsert({
    where: { id: "dur-25" },
    update: { label: "25 минут", minutes: 25, sortOrder: 1 },
    create: {
      id: "dur-25",
      label: "25 минут",
      minutes: 25,
      sortOrder: 1,
    },
  });

  const duration50 = await prisma.appointmentDuration.upsert({
    where: { id: "dur-50" },
    update: { label: "50 минут", minutes: 50, sortOrder: 2 },
    create: {
      id: "dur-50",
      label: "50 минут",
      minutes: 50,
      sortOrder: 2,
    },
  });

  await prisma.contactInfo.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      address: "г. Минск, ул. Примерная, 1",
      phone: "+375 (29) 123-45-67",
      email: "info@clevermed.by",
      hours: [
        { label: "Пн – Пт:", value: "8:00 – 20:00" },
        { label: "Суббота:", value: "9:00 – 17:00" },
        { label: "Воскресенье:", value: "только экстренные случаи" },
      ],
    },
  });

  await prisma.aboutContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      missionQuote:
        "Мы создаём пространство, где сложная неврология становится понятной, а пациент чувствует заботу с первой минуты визита.",
      timeline: [
        { year: "2018", title: "Основание центра" },
        { year: "2022", title: "Открытие лаборатории" },
        { year: "2025", title: "Цифровая диагностика OrganiTech" },
      ],
    },
  });

  const doctorsSeed = [
    {
      slug: "reduto-evgenij-valentinovich",
      fullName: "Редуто Евгений Валентинович",
      medicalCategory:
        "Врач высшей квалификационной категории, кандидат медицинских наук",
      imageUrl: "/images/doctors/doctors_1.jpg",
      sortOrder: 1,
    },
    {
      slug: "reduto-valentin-vladimirovich",
      fullName: "Редуто Валентин Владимирович",
      medicalCategory: "Врач высшей квалификационной категории",
      imageUrl: "/images/doctors/doctors_2.jpg",
      sortOrder: 2,
    },
    {
      slug: "brenko-nikita-aleksandrovich",
      fullName: "Бренько Никита Александрович",
      medicalCategory: "Врач 2-ой квалификационной категории",
      imageUrl: "/images/doctors/doctors_3.jpg",
      sortOrder: 3,
    },
    {
      slug: "gonova-svetlana-viktorovna",
      fullName: "Гонова Светлана Викторовна",
      medicalCategory: "Врач 1-ой квалификационной категории",
      imageUrl: "/images/doctors/doctors_4.jpg",
      sortOrder: 4,
    },
  ];

  const doctorIds: string[] = [];

  for (const d of doctorsSeed) {
    const { lastName, firstName, middleName } = parseFullName(d.fullName);
    const name = formatDoctorName({ lastName, firstName, middleName });
    const doctor = await prisma.doctor.upsert({
      where: { slug: d.slug },
      update: {
        lastName,
        firstName,
        middleName,
        name,
        medicalCategory: d.medicalCategory,
        imageUrl: d.imageUrl,
        sortOrder: d.sortOrder,
        published: true,
      },
      create: {
        slug: d.slug,
        lastName,
        firstName,
        middleName,
        name,
        medicalCategory: d.medicalCategory,
        specialty: "",
        imageUrl: d.imageUrl,
        sortOrder: d.sortOrder,
        published: true,
      },
    });
    doctorIds.push(doctor.id);
  }

  const procConsult = await prisma.procedure.upsert({
    where: { id: "proc-consult-25" },
    update: { title: "Консультация невролога", durationId: duration25.id },
    create: {
      id: "proc-consult-25",
      title: "Консультация невролога",
      durationId: duration25.id,
      sortOrder: 1,
    },
  });

  const procEnmg = await prisma.procedure.upsert({
    where: { id: "proc-enmg-50" },
    update: { title: "ЭНМГ", durationId: duration50.id },
    create: {
      id: "proc-enmg-50",
      title: "ЭНМГ",
      durationId: duration50.id,
      sortOrder: 2,
    },
  });

  for (const doctorId of doctorIds) {
    await prisma.doctorProcedure.upsert({
      where: {
        doctorId_procedureId: {
          doctorId,
          procedureId: procConsult.id,
        },
      },
      update: {},
      create: { doctorId, procedureId: procConsult.id },
    });
    await prisma.doctorProcedure.upsert({
      where: {
        doctorId_procedureId: {
          doctorId,
          procedureId: procEnmg.id,
        },
      },
      update: {},
      create: { doctorId, procedureId: procEnmg.id },
    });

  }

  // Дни приёма задаются вручную в админке (/admin/doctors) для каждого врача отдельно.

  console.log(`Seed OK. Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
