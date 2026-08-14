import { cookies } from "next/headers";
import { auth } from "@/auth";
import { driveStore } from "./drive";
import { hostedConfigured, hostedStore } from "./hosted";
import { StoreError, type StorageMode, type Store } from "./types";

export { StoreError } from "./types";
export type { StorageMode, Store } from "./types";
export { hostedConfigured } from "./hosted";

const COOKIE = "storage-mode";

/**
 * Picks the store for the current request.
 *
 * The preference lives in a cookie rather than a database row, because it has
 * to be readable before we know which database to ask — and because someone
 * using Drive-only storage has deliberately asked us not to keep rows about
 * them at all.
 */
export async function getStore(): Promise<Store> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new StoreError("Not signed in", 401);

  const mode = await storageMode();

  if (mode === "drive") {
    if (!session.accessToken || session.error) {
      throw new StoreError(
        "Google Drive is not connected. Connect it in Settings, or switch to storing stories in your account.",
        428,
      );
    }
    return driveStore(session.accessToken);
  }

  if (!hostedConfigured()) {
    throw new StoreError(
      "This site has no hosted storage configured. Connect Google Drive in Settings to store stories in your own Drive.",
      503,
    );
  }
  return hostedStore(userId);
}

export async function storageMode(): Promise<StorageMode> {
  const chosen = (await cookies()).get(COOKIE)?.value;
  if (chosen === "drive" || chosen === "hosted") return chosen;
  // Default to whichever actually works on this deployment. A fork with no
  // database should still be fully usable via Drive.
  return hostedConfigured() ? "hosted" : "drive";
}

export const STORAGE_COOKIE = COOKIE;
