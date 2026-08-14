"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  emptyStory,
  mediaImageUrl,
  type StoryKind,
  type StoryPurpose,
  type StorySummary,
} from "@/lib/types";
import { checkLibrary } from "@/lib/quality";

export default function LibraryClient() {
  const router = useRouter();
  const [stories, setStories] = useState<StorySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stories");
      if (res.status === 401) return router.push("/");
      if (!res.ok) throw new Error((await res.json()).error ?? "Load failed");
      setStories((await res.json()).stories);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your library");
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(kind: StoryKind, purpose: StoryPurpose = "explain") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyStory(kind, purpose)),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Create failed");
      const { driveFileId } = await res.json();
      router.push(`/edit/${driveFileId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create");
      setBusy(false);
    }
  }

  async function remove(s: StorySummary) {
    if (!confirm(`Delete “${s.title}” from your Drive? This cannot be undone.`)) {
      return;
    }
    await fetch(`/api/stories/${s.driveFileId}`, { method: "DELETE" });
    void load();
  }

  return (
    <main className="page">
      <div className="row" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>My library</h1>
        <span className="spacer" />
        <Link className="btn" href="/templates">
          Browse templates
        </Link>
        <button className="btn secondary" disabled={busy} onClick={() => create("story")}>
          + New story
        </button>
        <button
          className="btn secondary"
          disabled={busy}
          onClick={() => create("story", "celebrate")}
        >
          + New celebration
        </button>
        <button
          className="btn secondary"
          disabled={busy}
          onClick={() => create("pathway")}
        >
          + New care pathway
        </button>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      {(stories ? checkLibrary(stories) : []).map((r) => (
        <p className="notice" key={r.audience}>
          <strong>{r.audience}</strong> has {r.total} stories, and{" "}
          {r.celebrating === 0 ? "none" : `only ${r.celebrating}`} of them
          celebrate something they already do well. The criteria ask for at
          least half. A collection that is all instructions tells its reader
          they are a problem to be managed.
        </p>
      ))}

      {stories === null ? (
        <p className="muted">Loading your Drive…</p>
      ) : stories.length === 0 ? (
        <div className="card">
          <h2>Nothing here yet</h2>
          <p className="muted">
            Start from a <Link href="/templates">template</Link>, or build your
            own from scratch. A <strong>story</strong> explains a situation one
            picture at a time
            (&ldquo;Going to the dentist&rdquo;). A <strong>care pathway</strong>{" "}
            lays out a routine or plan of care in order (&ldquo;Morning
            routine&rdquo;, &ldquo;What happens at the hospital&rdquo;).
          </p>
        </div>
      ) : (
        <div className="grid">
          {stories.map((s) => {
            const cover = mediaImageUrl(s.cover);
            return (
              <article className="story-card" key={s.driveFileId}>
                <div className="thumb">
                  {cover ? (
                    <img alt="" src={cover} />
                  ) : (
                    <span className="muted">No picture</span>
                  )}
                </div>
                <div className="body">
                  <span className={s.purpose === "celebrate" ? "tag good" : "tag"}>
                    {s.purpose === "celebrate"
                      ? "Celebrates"
                      : s.kind === "pathway"
                        ? "Pathway"
                        : "Story"}
                  </span>
                  <h3>{s.title}</h3>
                  <p className="muted">
                    {s.stepCount} step{s.stepCount === 1 ? "" : "s"}
                  </p>
                  <span className="spacer" />
                  <div className="row">
                    <Link className="btn" href={`/play/${s.driveFileId}`}>
                      Play
                    </Link>
                    <Link
                      className="btn secondary"
                      href={`/edit/${s.driveFileId}`}
                    >
                      Edit
                    </Link>
                    <button
                      className="btn danger"
                      onClick={() => remove(s)}
                      aria-label={`Delete ${s.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
