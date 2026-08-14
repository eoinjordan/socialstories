import { NextResponse } from "next/server";
import { requireToken, uploadImage } from "@/lib/drive";
import { errorResponse } from "@/lib/apiError";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const token = await requireToken();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file supplied" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${file.type || "unknown"}` },
        { status: 415 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is larger than 8 MB" },
        { status: 413 },
      );
    }
    const fileId = await uploadImage(
      token,
      file.name || "photo",
      file.type,
      await file.arrayBuffer(),
    );
    return NextResponse.json({ fileId });
  } catch (e) {
    return errorResponse(e);
  }
}
