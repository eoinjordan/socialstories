import { NextResponse } from "next/server";
import { deleteFile, readStory, requireToken, writeStory } from "@/lib/drive";
import { errorResponse } from "@/lib/apiError";
import type { Story } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ fileId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    const token = await requireToken();
    return NextResponse.json(await readStory(token, fileId));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    const token = await requireToken();
    const story = (await req.json()) as Story;
    story.updatedAt = new Date().toISOString();
    await writeStory(token, story, fileId);
    return NextResponse.json({ driveFileId: fileId, updatedAt: story.updatedAt });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    await deleteFile(await requireToken(), fileId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
