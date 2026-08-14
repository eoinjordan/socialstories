import { NextResponse } from "next/server";
import { getStore, storageMode } from "@/lib/store";
import { errorResponse } from "@/lib/apiError";
import type { Story } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getStore();
    return NextResponse.json({
      stories: await store.list(),
      storage: await storageMode(),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Creates a new story. Returns the id to address it by from now on. */
export async function POST(req: Request) {
  try {
    const store = await getStore();
    const story = (await req.json()) as Story;
    return NextResponse.json({ driveFileId: await store.write(story) });
  } catch (e) {
    return errorResponse(e);
  }
}
