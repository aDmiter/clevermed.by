import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const days = await prisma.doctorAvailabilityDay.findMany({
    select: {
      doctorId: true,
      dateKey: true,
      doctor: { select: { name: true, sortOrder: true } },
    },
    orderBy: [{ doctor: { sortOrder: "asc" } }, { dateKey: "asc" }],
  });

  const byDoctor = new Map<
    string,
    { doctorId: string; dates: string[] }
  >();
  for (const d of days) {
    const name = d.doctor.name;
    if (!byDoctor.has(name)) {
      byDoctor.set(name, { doctorId: d.doctorId, dates: [] });
    }
    byDoctor.get(name)!.dates.push(d.dateKey);
  }

  console.log("Total availability day records:", days.length);
  for (const [name, { doctorId, dates }] of byDoctor) {
    console.log(`\n${name} (${doctorId}):`);
    console.log("  ", dates.join(", "));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
