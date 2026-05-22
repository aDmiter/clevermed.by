import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const [doctors, services, prices] = await Promise.all([
    prisma.doctor.updateMany({ data: { published: true } }),
    prisma.service.updateMany({ data: { published: true } }),
    prisma.price.updateMany({ data: { published: true } }),
  ]);

  console.log(
    `Опубликовано: врачей ${doctors.count}, услуг ${services.count}, цен ${prices.count}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
