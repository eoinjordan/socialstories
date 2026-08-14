import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { errorResponse } from "@/lib/apiError";
import type { Story } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ fileId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    return NextResponse.json(await (await getStore()).read(fileId));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    const store = await getStore();
    const story = (await req.json()) as Story;
    story.updatedAt = new Date().toISOString();
    await store.write(story, fileId);
    return NextResponse.json({ driveFileId: fileId, updatedAt: story.updatedAt });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { fileId } = await params;
    await (await getStore()).remove(fileId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
