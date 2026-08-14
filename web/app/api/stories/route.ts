import { NextResponse } from "next/server";
import { listStories, requireToken, writeStory } from "@/lib/drive";
import { errorResponse } from "@/lib/apiError";
import type { Story } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await requireToken();
    return NextResponse.json({ stories: await listStories(token) });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Creates a new story file. Returns the Drive id to address it by from now on. */
export async function POST(req: Request) {
  try {
    const token = await requireToken();
    const story = (await req.json()) as Story;
    const driveFileId = await writeStory(token, story);
    return NextResponse.json({ driveFileId });
  } catch (e) {
    return errorResponse(e);
  }
}

