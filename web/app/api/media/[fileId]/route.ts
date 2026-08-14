import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchMedia } from "@/lib/drive";
import { errorResponse } from "@/lib/apiError";
import { getHostedMedia, isHostedMedia } from "@/lib/store/media";
import { StoreError } from "@/lib/store/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ fileId: string }> };

/**
 * Streams an image back to the signed-in user from whichever store holds it.
 * Nothing here is public: Drive access tokens stay on the server, and hosted
 * images are looked up scoped to their owner.
 */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new StoreError("Not signed in", 401);

    if (isHostedMedia(fileId)) {
      const found = await getHostedMedia(userId, fileId);
      if (!found) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      return new NextResponse(new Uint8Array(found.bytes), {
        headers: {
          "Content-Type": found.contentType,
          "Cache-Control": "private, max-age=86400",
        },
      });
    }

    if (!session.accessToken || session.error) {
      throw new StoreError("Google Drive is not connected", 428);
    }
    const upstream = await fetchMedia(session.accessToken, fileId);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
        // Ids are immutable, so this is safe to cache hard per-user.
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
