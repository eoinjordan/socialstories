import {
  deleteFile,
  listStories,
  readStory,
  writeStory,
} from "../drive";
import type { Store } from "./types";

/**
 * Adapter putting the existing Drive client behind the common Store interface.
 * The Drive "id" is the Drive file id, which is why `StorySummary` calls the
 * field `driveFileId` — it predates hosted storage and is kept so that URLs
 * already in people's browser history keep working.
 */
export function driveStore(token: string): Store {
  return {
    mode: "drive",
    list: () => listStories(token),
    read: (id) => readStory(token, id),
    write: (story, id) => writeStory(token, story, id),
    remove: (id) => deleteFile(token, id),
  };
}
