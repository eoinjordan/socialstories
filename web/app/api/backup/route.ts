import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { errorResponse } from "@/lib/apiError";
import { driveStore } from "@/lib/store/drive";
import { hostedConfigured, hostedStore } from "@/lib/store/hosted";
import { StoreError } from "@/lib/store/types";

export const dynamic = "force-dynamic";

/**
 * Copies every hosted story into the user's own Google Drive.
 *
 * This is a plain copy, not an export format: both stores hold the identical
 * JSON document, so the backup is immediately usable — openable by the Android
 * app, or restorable simply by switching storage mode to Drive.
 *
 * It creates rather than updates, so running it twice leaves two copies. That
 * is the deliberate choice for a backup: a corrupted or accidentally-emptied
 * story should not overwrite the good copy taken last week.
 */
export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new StoreError("Not signed in", 401);
    if (!session.accessToken || session.error) {
      throw new StoreError("Google Drive is not connected", 428);
    }
    if (!hostedConfigured()) {
      throw new StoreError("There is no hosted storage to back up", 400);
    }

    const hosted = hostedStore(userId);
    const drive = driveStore(session.accessToken);

    const summaries = await hosted.list();
    let copied = 0;
    const failed: string[] = [];

    for (const summary of summaries) {
      try {
        await drive.write(await hosted.read(summary.driveFileId));
        copied++;
      } catch {
        // One story failing should not abandon the rest of the backup.
        failed.push(summary.title);
      }
    }

    return NextResponse.json({ copied, total: summaries.length, failed });
  } catch (e) {
    return errorResponse(e);
  }
}
