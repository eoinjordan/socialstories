"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, StoryTemplate } from "@/lib/catalog";

export default function TemplateBrowser({
  templates,
  categories,
}: {
  templates: StoryTemplate[];
  categories: Category[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Category | "All">("All");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<StoryTemplate | null>(null);

  const shown =
    filter === "All" ? templates : templates.filter((t) => t.category === filter);

  async function use(t: StoryTemplate) {
    setBusyId(t.id);
    setError(null);
    try {
      const res = await fetch(`/api/templates/${t.id}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not copy");
      const { driveFileId } = await res.json();
      router.push(`/edit/${driveFileId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not copy the template");
      setBusyId(null);
    }
  }

  return (
    <main className="page">
      <div className="row" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Templates</h1>
        <span className="spacer" />
        <Link className="btn secondary" href="/library">
          My library
        </Link>
      </div>

      <p className="muted" style={{ maxWidth: "70ch" }}>
        Ready-made starting points. Copying one puts your own editable copy in
        your Drive — change the words, and swap the symbols for photos of the
        real people and places wherever you can.
      </p>

      {error ? <p className="notice error">{error}</p> : null}

      <div className="row" style={{ margin: "20px 0" }}>
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            className={`btn ${filter === c ? "" : "secondary"}`}
            onClick={() => setFilter(c as Category | "All")}
            aria-pressed={filter === c}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid">
        {shown.map((t) => (
          <article className="story-card" key={t.id}>
            <div className="body">
              <span className="tag">
                {t.kind === "pathway" ? "Pathway" : "Story"}
              </span>
              <h3>{t.title}</h3>
              <p className="muted">{t.summary}</p>
              <p className="muted">
                {t.steps.length} steps · {t.category}
              </p>
              <span className="spacer" />
              <div className="row">
                <button
                  className="btn"
                  disabled={busyId !== null}
                  onClick={() => void use(t)}
                >
                  {busyId === t.id ? "Copying…" : "Use this"}
                </button>
                <button
                  className="btn secondary"
                  onClick={() => setPreview(preview?.id === t.id ? null : t)}
                  aria-expanded={preview?.id === t.id}
                >
                  {preview?.id === t.id ? "Hide words" : "Read words"}
                </button>
              </div>
              {preview?.id === t.id ? (
                <ol style={{ paddingLeft: "1.2em", margin: 0 }}>
                  {t.steps.map((s, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {s.text}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 40, maxWidth: "70ch" }}>
        Template wording is original to this project and released under CC0 —
        use it however you like. Symbols come from{" "}
        <a href="https://arasaac.org" rel="noreferrer noopener" target="_blank">
          ARASAAC
        </a>{" "}
        (author Sergio Palao, owner Government of Aragón), licensed CC BY-NC-SA.
      </p>
    </main>
  );
}
