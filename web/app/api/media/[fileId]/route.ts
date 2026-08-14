import { NextResponse } from "next/server";
import { fetchMedia, requireToken } from "@/lib/drive";
import { errorResponse } from "@/lib/apiError";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ fileId: string }> };

/**
 * Streams a Drive image to the signed-in user. The access token stays on the
 * server; the browser only ever sees this same-origin URL.
 */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    const token = await requireToken();
    const upstream = await fetchMedia(token, fileId);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
        // Drive ids are immutable, so this is safe to cache hard per-user.
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
