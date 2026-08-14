import { neon } from "@neondatabase/serverless";
import { migrate, type Story, type StorySummary } from "../types";
import { StoreError, type Store } from "./types";

/**
 * Hosted storage: one row per story, scoped to the account that owns it.
 *
 * Every query filters on `user_id`, and that value comes from the server-side
 * session — never from anything the client sends. This is care information
 * about identifiable, often vulnerable people, so that scoping is the single
 * most important thing in this file, and there is deliberately no code path
 * that reads or writes a story without it.
 *
 * Uses the Neon serverless driver over HTTP, which is what Vercel provisions
 * now that `@vercel/postgres` is retired. Any Postgres connection string in
 * `DATABASE_URL` or `POSTGRES_URL` works.
 */

function connectionString() {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
}

export function hostedConfigured() {
  return connectionString().length > 0;
}

function db() {
  const url = connectionString();
  if (!url) throw new StoreError("No database configured", 503);
  return neon(url);
}

export function hostedStore(userId: string): Store {
  return {
    mode: "hosted",

    async list() {
      const sql = await ready();
      const rows = (await sql`
        SELECT id, doc, updated_at
        FROM stories
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 500
      `) as Array<{ id: string; doc: Story; updated_at: string }>;

      return rows.map(({ id, doc, updated_at }): StorySummary => {
        const story = migrate(doc);
        return {
          id: story.id,
          // Whatever the backend, this is the address the UI navigates by. The
          // field keeps its Drive-era name so URLs already in people's browser
          // history keep working.
          driveFileId: id,
          title: story.title,
          kind: story.kind,
          purpose: story.purpose,
          audience: story.audience,
          stepCount: story.steps.length,
          cover: story.cover,
          updatedAt: new Date(updated_at).toISOString(),
        };
      });
    },

    async read(id) {
      const sql = await ready();
      const rows = (await sql`
        SELECT doc FROM stories WHERE id = ${id} AND user_id = ${userId}
      `) as Array<{ doc: Story }>;
      if (rows.length === 0) throw new StoreError("Story not found", 404);
      return migrate(rows[0].doc);
    },

    async write(story, id) {
      const sql = await ready();
      const rowId = id ?? crypto.randomUUID();
      const doc = JSON.stringify(story);
      // The WHERE on the update branch means a mismatched owner changes
      // nothing at all, rather than overwriting someone else's story.
      const rows = (await sql`
        INSERT INTO stories (id, user_id, doc, updated_at)
        VALUES (${rowId}, ${userId}, ${doc}::jsonb, now())
        ON CONFLICT (id) DO UPDATE
          SET doc = ${doc}::jsonb, updated_at = now()
          WHERE stories.user_id = ${userId}
        RETURNING id
      `) as Array<{ id: string }>;
      if (rows.length === 0) throw new StoreError("Story not found", 404);
      return rowId;
    },

    async remove(id) {
      const sql = await ready();
      await sql`DELETE FROM stories WHERE id = ${id} AND user_id = ${userId}`;
    },
  };
}

let schemaReady: Promise<void> | null = null;

/**
 * Creates the table on first use and hands back the query function.
 *
 * A migration tool would be overkill for one table, and this keeps deployment
 * to "set DATABASE_URL". The promise is cached so concurrent requests on a warm
 * lambda do not each issue the DDL.
 */
async function ready() {
  const sql = db();
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS stories (
        id          text PRIMARY KEY,
        user_id     text NOT NULL,
        doc         jsonb NOT NULL,
        updated_at  timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS stories_user_updated
      ON stories (user_id, updated_at DESC)
    `;
  })().catch((e) => {
    // Never cache a failure: a transient error at cold start would otherwise
    // poison the lambda for the rest of its life.
    schemaReady = null;
    throw e;
  });
  await schemaReady;
  return sql;
}
