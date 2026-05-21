import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const before = await prisma.doctorAvailabilityDay.count();
  const deleted = await prisma.doctorAvailabilityDay.deleteMany({});
  console.log(`Deleted ${deleted.count} availability days (was ${before} records).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
