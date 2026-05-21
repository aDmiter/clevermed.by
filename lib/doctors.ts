const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function formatDoctorName(parts: {
  lastName: string;
  firstName: string;
  middleName?: string | null;
}): string {
  return [parts.lastName, parts.firstName, parts.middleName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function slugifyDoctorName(name: string): string {
  const lower = name.trim().toLowerCase();
  let result = "";
  for (const char of lower) {
    if (CYRILLIC_TO_LATIN[char] !== undefined) {
      result += CYRILLIC_TO_LATIN[char];
    } else if (/[a-z0-9]/.test(char)) {
      result += char;
    } else if (/\s|-/.test(char)) {
      result += "-";
    }
  }
  return result.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function parseFullName(fullName: string): {
  lastName: string;
  firstName: string;
  middleName: string | null;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { lastName: "", firstName: "", middleName: null };
  }
  if (parts.length === 1) {
    return { lastName: parts[0], firstName: "", middleName: null };
  }
  if (parts.length === 2) {
    return { lastName: parts[0], firstName: parts[1], middleName: null };
  }
  return {
    lastName: parts[0],
    firstName: parts[1],
    middleName: parts.slice(2).join(" "),
  };
}

export const DOCTOR_IMAGE_DIR = "public/images/doctors";
export const DOCTOR_IMAGE_PUBLIC_PREFIX = "/images/doctors";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const MAX_DOCTOR_IMAGE_BYTES = 5 * 1024 * 1024;
