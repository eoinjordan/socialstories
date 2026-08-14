import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/drive";
import { errorResponse } from "@/lib/apiError";
import { storageMode } from "@/lib/store";
import { putHostedMedia } from "@/lib/store/media";
import { StoreError } from "@/lib/store/types";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Accepts a photo and puts it wherever the user's stories live, so a photo can
 * never end up somewhere its story cannot reach.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new StoreError("Not signed in", 401);

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

    const bytes = await file.arrayBuffer();
    const mode = await storageMode();

    if (mode === "drive") {
      if (!session.accessToken || session.error) {
        throw new StoreError("Google Drive is not connected", 428);
      }
      const fileId = await uploadImage(
        session.accessToken,
        file.name || "photo",
        file.type,
        bytes,
      );
      return NextResponse.json({ fileId });
    }

    return NextResponse.json({
      fileId: await putHostedMedia(userId, file.type, bytes),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
