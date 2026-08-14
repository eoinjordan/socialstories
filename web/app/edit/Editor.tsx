"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MediaPicker from "./MediaPicker";
import QualityPanel from "./QualityPanel";
import { classify, SENTENCE_TYPE_HELP, SENTENCE_TYPE_LABELS } from "@/lib/quality";
import type { Media, SentenceType, Step, Story } from "@/lib/types";

export default function Editor({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"clean" | "dirty" | "saving">("clean");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/stories/${fileId}`);
      if (res.status === 401) return router.push("/");
      if (!res.ok) return setError("Could not open this story");
      setStory(await res.json());
    })();
  }, [fileId, router]);

  const update = useCallback((fn: (draft: Story) => void) => {
    setStory((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setSaveState("dirty");
  }, []);

  const save = useCallback(async () => {
    if (!story) return;
    setSaveState("saving");
    const res = await fetch(`/api/stories/${fileId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
    });
    if (!res.ok) {
      setError("Could not save to Drive. Your changes are still on screen.");
      setSaveState("dirty");
      return;
    }
    setError(null);
    setSaveState("clean");
  }, [fileId, story]);

  // Autosave on a short idle delay so carers never lose work to a closed tab.
  useEffect(() => {
    if (saveState !== "dirty") return;
    const t = setTimeout(() => void save(), 1500);
    return () => clearTimeout(t);
  }, [saveState, save]);

  useEffect(() => {
    if (saveState === "clean") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  if (error && !story) return <main className="page"><p className="notice error">{error}</p></main>;
  if (!story) return <main className="page"><p className="muted">Opening…</p></main>;

  const setStep = (index: number, patch: Partial<Step>) =>
    update((d) => {
      d.steps[index] = { ...d.steps[index], ...patch };
    });

  const move = (index: number, delta: number) =>
    update((d) => {
      const to = index + delta;
      if (to < 0 || to >= d.steps.length) return;
      const [s] = d.steps.splice(index, 1);
      d.steps.splice(to, 0, s);
    });

  return (
    <main className="page">
      <div className="row" style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Edit</h1>
        <span className="spacer" />
        <span className="muted" aria-live="polite">
          {saveState === "saving"
            ? "Saving to Drive…"
            : saveState === "dirty"
              ? "Unsaved changes"
              : "Saved to Drive"}
        </span>
        <button className="btn" onClick={() => void save()} disabled={saveState === "saving"}>
          Save now
        </button>
        <Link className="btn secondary" href={`/play/${fileId}`}>
          Play
        </Link>
        <Link className="btn secondary" href="/library">
          Library
        </Link>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      <section className="card">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={story.title}
            onChange={(e) => update((d) => void (d.title = e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="kind">Type</label>
          <select
            id="kind"
            value={story.kind}
            onChange={(e) =>
              update((d) => void (d.kind = e.target.value as Story["kind"]))
            }
          >
            <option value="story">Social story</option>
            <option value="pathway">Care pathway</option>
          </select>
        </div>

        <div className="field">
          <label>Cover picture</label>
          <div style={{ maxWidth: 220 }}>
            <MediaPicker
              label="cover"
              value={story.cover}
              onChange={(m: Media) => update((d) => void (d.cover = m))}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="notes">Notes for carers (never shown in play mode)</label>
          <textarea
            id="notes"
            value={story.carerNotes ?? ""}
            onChange={(e) => update((d) => void (d.carerNotes = e.target.value))}
          />
        </div>
      </section>

      <section className="card">
        <h2>How it plays</h2>
        <label className="check">
          <input
            type="checkbox"
            checked={story.display.readAloud}
            onChange={(e) =>
              update((d) => void (d.display.readAloud = e.target.checked))
            }
          />
          Read each step aloud
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={story.display.highContrast}
            onChange={(e) =>
              update((d) => void (d.display.highContrast = e.target.checked))
            }
          />
          Dark, low-stimulation colours
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={story.display.lockOpen}
            onChange={(e) =>
              update((d) => void (d.display.lockOpen = e.target.checked))
            }
          />
          Stay locked open (exit needs a 3-second hold)
        </label>

        <div className="field" style={{ marginTop: 16, maxWidth: 280 }}>
          <label htmlFor="scale">Text size ({story.display.textScale.toFixed(1)}×)</label>
          <input
            id="scale"
            type="range"
            min={0.8}
            max={2}
            step={0.1}
            value={story.display.textScale}
            onChange={(e) =>
              update((d) => void (d.display.textScale = Number(e.target.value)))
            }
          />
        </div>

        <div className="field" style={{ maxWidth: 280 }}>
          <label htmlFor="auto">
            Auto-advance seconds (0 = tap to move on)
          </label>
          <input
            id="auto"
            type="number"
            min={0}
            max={600}
            value={story.display.autoAdvanceSeconds}
            onChange={(e) =>
              update(
                (d) =>
                  void (d.display.autoAdvanceSeconds = Math.max(
                    0,
                    Number(e.target.value) || 0,
                  )),
              )
            }
          />
        </div>
      </section>

      <QualityPanel story={story} />

      <h2>Steps</h2>
      {story.steps.map((step, i) => (
        <section className="card" key={step.id}>
          <div className="step">
            <MediaPicker
              label={`step ${i + 1}`}
              value={step.media}
              onChange={(m) => setStep(i, { media: m })}
            />
            <div>
              <div className="field">
                <label htmlFor={`text-${step.id}`}>
                  Step {i + 1} — what it says
                </label>
                <textarea
                  id={`text-${step.id}`}
                  value={step.text}
                  placeholder="One short sentence, e.g. “I sit in the big chair.”"
                  onChange={(e) => setStep(i, { text: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`spoken-${step.id}`}>
                  Extra words to speak (optional, not shown on screen)
                </label>
                <input
                  id={`spoken-${step.id}`}
                  type="text"
                  value={step.spoken ?? ""}
                  onChange={(e) => setStep(i, { spoken: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`type-${step.id}`}>
                  This sentence…{" "}
                  <span className="muted" style={{ fontWeight: 400 }}>
                    {SENTENCE_TYPE_HELP[step.sentenceType ?? classify(step.text)]}
                  </span>
                </label>
                <select
                  id={`type-${step.id}`}
                  value={step.sentenceType ?? classify(step.text)}
                  onChange={(e) =>
                    setStep(i, { sentenceType: e.target.value as SentenceType })
                  }
                >
                  {(
                    Object.keys(SENTENCE_TYPE_LABELS) as SentenceType[]
                  ).map((t) => (
                    <option key={t} value={t}>
                      {SENTENCE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="row">
                <button
                  className="btn secondary"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  ↑ Up
                </button>
                <button
                  className="btn secondary"
                  onClick={() => move(i, 1)}
                  disabled={i === story.steps.length - 1}
                >
                  ↓ Down
                </button>
                <button
                  className="btn danger"
                  disabled={story.steps.length === 1}
                  onClick={() => update((d) => void d.steps.splice(i, 1))}
                >
                  Delete step
                </button>
              </div>
            </div>
          </div>
        </section>
      ))}

      <button
        className="btn big"
        onClick={() =>
          update((d) =>
            void d.steps.push({
              id: crypto.randomUUID(),
              text: "",
              media: { kind: "none" },
            }),
          )
        }
      >
        + Add step
      </button>
    </main>
  );
}
