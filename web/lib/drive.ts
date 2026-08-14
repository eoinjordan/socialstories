import { auth } from "@/auth";
import type { Story, StorySummary } from "./types";

const API = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";

/** Name of the folder created in the root of the user's Drive. */
export const FOLDER_NAME = "Social Stories";
/** Stamped on every file we create so we can find our own things reliably. */
const APP_TAG = "social-stories";

export class DriveError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Throws if the caller is not signed in, otherwise yields a usable token. */
export async function requireToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    throw new DriveError("Not signed in to Google Drive", 401);
  }
  return session.accessToken;
}

async function drive<T>(
  token: string,
  path: string,
  init: RequestInit = {},
  base = API,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new DriveError(
      `Drive request failed (${res.status}): ${await res.text()}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  appProperties?: Record<string, string>;
}

/** Finds — or creates on first use — the app's folder in the user's Drive. */
export async function getFolderId(token: string): Promise<string> {
  const q = [
    "mimeType='application/vnd.google-apps.folder'",
    `name='${FOLDER_NAME}'`,
    "trashed=false",
    "'root' in parents",
  ].join(" and ");
  const found = await drive<{ files: DriveFile[] }>(
    token,
    `/files?q=${encodeURIComponent(q)}&fields=files(id)&spaces=drive`,
  );
  if (found.files.length > 0) return found.files[0].id;

  const created = await drive<DriveFile>(token, "/files?fields=id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      appProperties: { app: APP_TAG },
    }),
  });
  return created.id;
}

export async function listStories(token: string): Promise<StorySummary[]> {
  const folderId = await getFolderId(token);
  const q = [
    `'${folderId}' in parents`,
    "trashed=false",
    "mimeType='application/json'",
  ].join(" and ");
  const res = await drive<{ files: DriveFile[] }>(
    token,
    `/files?q=${encodeURIComponent(q)}` +
      "&fields=files(id,name,modifiedTime,appProperties)" +
      "&orderBy=modifiedTime desc&pageSize=200",
  );

  // The summary fields are mirrored into appProperties when we save, so the
  // library page costs one request instead of one download per story.
  return res.files
    .filter((f) => f.appProperties?.app === APP_TAG)
    .map((f) => ({
      id: f.appProperties?.storyId ?? f.id,
      driveFileId: f.id,
      title: f.appProperties?.title ?? f.name.replace(/\.json$/, ""),
      kind: (f.appProperties?.kind as StorySummary["kind"]) ?? "story",
      stepCount: Number(f.appProperties?.stepCount ?? 0),
      cover: f.appProperties?.cover
        ? (JSON.parse(f.appProperties.cover) as StorySummary["cover"])
        : { kind: "none" },
      updatedAt: f.modifiedTime ?? "",
    }));
}

export async function readStory(
  token: string,
  driveFileId: string,
): Promise<Story> {
  const res = await fetch(`${API}/files/${driveFileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new DriveError("Could not read story", res.status);
  return (await res.json()) as Story;
}

function appPropertiesFor(story: Story): Record<string, string> {
  return {
    app: APP_TAG,
    storyId: story.id,
    title: story.title.slice(0, 120),
    kind: story.kind,
    stepCount: String(story.steps.length),
    // appProperties values are capped at 124 bytes, so only small refs fit.
    cover: JSON.stringify(story.cover).slice(0, 120),
  };
}

/** Creates or overwrites the story's JSON file and returns its Drive id. */
export async function writeStory(
  token: string,
  story: Story,
  driveFileId?: string,
): Promise<string> {
  const folderId = await getFolderId(token);
  const metadata: Record<string, unknown> = {
    name: `${safeName(story.title)}.json`,
    mimeType: "application/json",
    appProperties: appPropertiesFor(story),
  };
  // Drive rejects `parents` on update; it is only valid at creation time.
  if (!driveFileId) metadata.parents = [folderId];

  const boundary = `sstories${Math.random().toString(36).slice(2)}`;
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    `${JSON.stringify(story, null, 2)}\r\n` +
    `--${boundary}--`;

  const path = driveFileId
    ? `/files/${driveFileId}?uploadType=multipart&fields=id`
    : `/files?uploadType=multipart&fields=id`;
  const result = await drive<DriveFile>(
    token,
    path,
    {
      method: driveFileId ? "PATCH" : "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
    UPLOAD,
  );
  return result.id;
}

export async function deleteFile(token: string, driveFileId: string) {
  const res = await fetch(`${API}/files/${driveFileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new DriveError("Could not delete", res.status);
  }
}

/** Uploads an image and returns its Drive file id. */
export async function uploadImage(
  token: string,
  name: string,
  contentType: string,
  bytes: ArrayBuffer,
): Promise<string> {
  const folderId = await getFolderId(token);
  const metadata = {
    name: safeName(name),
    parents: [folderId],
    appProperties: { app: APP_TAG, role: "media" },
  };

  const boundary = `sstoriesimg${Math.random().toString(36).slice(2)}`;
  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${contentType}\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n`,
  );
  const b64 = encoder.encode(base64(bytes));
  const tail = encoder.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(head.length + b64.length + tail.length);
  body.set(head, 0);
  body.set(b64, head.length);
  body.set(tail, head.length + b64.length);

  const result = await drive<DriveFile>(
    token,
    "/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
    UPLOAD,
  );
  return result.id;
}

/** Streams an image back to the browser so the token never leaves the server. */
export async function fetchMedia(token: string, fileId: string) {
  return fetch(`${API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

function safeName(name: string) {
  return (name.replace(/[\\/:*?"<>|]/g, "-").trim() || "untitled").slice(0, 100);
}

function base64(buf: ArrayBuffer) {
  return Buffer.from(buf).toString("base64");
}
