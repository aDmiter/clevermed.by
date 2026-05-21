import { writeFileSync } from "fs";

const res = await fetch("https://clevermed.by/doctors");
const html = await res.text();
writeFileSync("tmp-doctors.html", html, "utf8");
console.log("length:", html.length);

const imgSrc = [...html.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1]);
console.log("images:", imgSrc.filter((u) => /doctor|upload|wp-content|\.jpg|\.png|\.webp/i.test(u)));

const blocks = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/gi)];
console.log("h3:", blocks.map((m) => m[1]));

const links = [...html.matchAll(/href=["']([^"']*doctor[^"']*)["']/gi)];
console.log("links:", [...new Set(links.map((m) => m[1]))]);
