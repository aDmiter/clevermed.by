import { mkdir, writeFile } from "fs/promises";
import path from "path";

const BASE = "https://clevermed.by";
const files = [
  "doctors_1.jpg",
  "doctors_2.jpg",
  "doctors_3.jpg",
  "doctors_4.jpg",
];

const outDir = path.join("public", "images", "doctors");
await mkdir(outDir, { recursive: true });

for (const file of files) {
  const url = `${BASE}/images/doctors/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed ${url}: ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = path.join(outDir, file);
  await writeFile(dest, buf);
  console.log("saved", dest);
}

console.log("done");
