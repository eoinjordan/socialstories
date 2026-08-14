import { NextResponse } from "next/server";
import { templateById } from "@/lib/catalog";
import { getStore } from "@/lib/store";
import { resolveKeywords } from "@/lib/pictograms";
import { DEFAULT_DISPLAY, SCHEMA_VERSION, type Story } from "@/lib/types";
import { errorResponse } from "@/lib/apiError";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ templateId: string }> };

/**
 * Copies a catalogue template into the user's Drive as a normal, fully editable
 * story. Nothing links back to the template afterwards — it is a starting
 * point, not a subscription.
 */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const { templateId } = await params;
    const template = templateById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Unknown template" }, { status: 404 });
    }
    const store = await getStore();

    const media = await resolveKeywords([
      template.cover,
      ...template.steps.map((s) => s.picture),
    ]);

    const now = new Date().toISOString();
    const story: Story = {
      schemaVersion: SCHEMA_VERSION,
      id: crypto.randomUUID(),
      kind: template.kind,
      purpose: template.purpose,
      title: template.title,
      carerNotes:
        `Started from the "${template.title}" template. ` +
        `Edit the words and swap in photos of real people and places — ` +
        `familiar pictures usually work better than generic symbols.`,
      cover: media.get(template.cover) ?? { kind: "none" },
      steps: template.steps.map((s) => ({
        id: crypto.randomUUID(),
        text: s.text,
        spoken: s.spoken,
        sentenceType: s.sentenceType,
        media: media.get(s.picture) ?? { kind: "none" },
      })),
      display: { ...DEFAULT_DISPLAY, ...template.display },
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ driveFileId: await store.write(story) });
  } catch (e) {
    return errorResponse(e);
  }
}
