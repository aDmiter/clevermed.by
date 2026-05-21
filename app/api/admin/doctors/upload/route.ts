import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/admin-api";
import {
  ALLOWED_IMAGE_TYPES,
  DOCTOR_IMAGE_DIR,
  DOCTOR_IMAGE_PUBLIC_PREFIX,
  MAX_DOCTOR_IMAGE_BYTES,
} from "@/lib/doctors";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Допустимы только JPEG, PNG и WebP" },
      { status: 400 },
    );
  }

  if (file.size > MAX_DOCTOR_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Размер файла не должен превышать 5 МБ" },
      { status: 400 },
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(process.cwd(), DOCTOR_IMAGE_DIR);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const imageUrl = `${DOCTOR_IMAGE_PUBLIC_PREFIX}/${filename}`;
  return NextResponse.json({ imageUrl });
}
