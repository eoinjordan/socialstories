import type { Story, StorySummary } from "../types";

/**
 * Where a person's stories live.
 *
 * There are two implementations and the app works fully with either:
 *
 *  - `hosted`  — an account on this site, rows in Postgres scoped to the
 *                signed-in user. This is the default because it works the
 *                moment someone signs in, with no extra permissions to grant.
 *  - `drive`   — files in the user's own Google Drive. No copy is kept here.
 *                Requires the `drive.file` scope, granted separately.
 *
 * Both store the identical `Story` JSON document, which is also what the
 * Android app reads. That is deliberate: a story written in one place can be
 * copied to the other without conversion, and backing up hosted stories to
 * Drive is a straight copy rather than an export format.
 */
export type StorageMode = "hosted" | "drive";

export interface Store {
  readonly mode: StorageMode;
  list(): Promise<StorySummary[]>;
  read(id: string): Promise<Story>;
  /** Creates when `id` is absent, overwrites when present. Returns the id. */
  write(story: Story, id?: string): Promise<string>;
  remove(id: string): Promise<void>;
}

export class StoreError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
