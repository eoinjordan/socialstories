import { neon } from "@neondatabase/serverless";
import { StoreError } from "./types";

/**
 * Photos uploaded by hosted-account users.
 *
 * Drive-storage users keep their photos in Drive alongside their stories; this
 * is the equivalent for people who never connect Drive. Ids are prefixed so a
 * single `Media` reference can point at either backend without another schema
 * change — anything starting `h:` lives here, everything else is a Drive file
 * id. That keeps the story document identical across both stores, which is
 * what lets a backup to Drive be a straight copy.
 *
 * Images are held as base64 text rather than bytea because the Neon HTTP
 * driver moves JSON, and an 8 MB cap on uploads keeps rows well inside what
 * that can carry comfortably.
 */
const PREFIX = "h:";

export function isHostedMedia(fileId: string) {
  return fileId.startsWith(PREFIX);
}

function db() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
  if (!url) throw new StoreError("No database configured", 503);
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

async function ready() {
  const sql = db();
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS media (
        id            text PRIMARY KEY,
        user_id       text NOT NULL,
        content_type  text NOT NULL,
        data_base64   text NOT NULL,
        created_at    timestamptz NOT NULL DEFAULT now()
      )
    `;
  })().catch((e) => {
    schemaReady = null;
    throw e;
  });
  await schemaReady;
  return sql;
}

export async function putHostedMedia(
  userId: string,
  contentType: string,
  bytes: ArrayBuffer,
): Promise<string> {
  const sql = await ready();
  const id = `${PREFIX}${crypto.randomUUID()}`;
  await sql`
    INSERT INTO media (id, user_id, content_type, data_base64)
    VALUES (${id}, ${userId}, ${contentType}, ${Buffer.from(bytes).toString("base64")})
  `;
  return id;
}

export async function getHostedMedia(
  userId: string,
  id: string,
): Promise<{ contentType: string; bytes: Buffer } | null> {
  const sql = await ready();
  // Scoped to the owner: an unguessable id is not an access control.
  const rows = (await sql`
    SELECT content_type, data_base64 FROM media
    WHERE id = ${id} AND user_id = ${userId}
  `) as Array<{ content_type: string; data_base64: string }>;
  if (rows.length === 0) return null;
  return {
    contentType: rows[0].content_type,
    bytes: Buffer.from(rows[0].data_base64, "base64"),
  };
}
