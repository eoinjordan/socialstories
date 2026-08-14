"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mediaImageUrl, type Story } from "@/lib/types";

const EXIT_HOLD_MS = 3000;

/**
 * Full-screen play / status-radiator mode.
 *
 * Design constraints that drive the odd-looking bits below:
 *  - the screen must not sleep while a pathway is on display;
 *  - a single accidental tap must never close the story;
 *  - it has to work identically whether someone is tapping through it or it is
 *    left running unattended on a wall-mounted tablet.
 */
export default function Player({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/stories/${fileId}`);
      if (res.status === 401) return router.push("/");
      if (!res.ok) return setError("Could not open this story");
      setStory(await res.json());
    })();
  }, [fileId, router]);

  // Keep the screen awake. Re-acquired on visibility change because the
  // browser drops the lock whenever the tab is backgrounded.
  useEffect(() => {
    if (!story) return;
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (t: "screen") => Promise<typeof sentinel> };
        }).wakeLock;
        if (!wl || document.visibilityState !== "visible") return;
        const s = await wl.request("screen");
        if (cancelled) void s?.release();
        else sentinel = s;
      } catch {
        // Wake lock is a progressive enhancement; ignore refusals.
      }
    };

    void acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      void sentinel?.release();
    };
  }, [story]);

  const step = story?.steps[index];

  // Speak the current step.
  useEffect(() => {
    if (!story?.display.readAloud || !step) return;
    const phrase = [step.text, step.spoken].filter(Boolean).join(". ").trim();
    if (!phrase || typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(phrase);
    utter.rate = 0.85;
    speechSynthesis.speak(utter);
    return () => speechSynthesis.cancel();
  }, [step, story?.display.readAloud]);

  const total = story?.steps.length ?? 0;
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, total - 1)),
    [total],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Unattended mode: cycle through the steps and loop back to the start.
  useEffect(() => {
    const secs = story?.display.autoAdvanceSeconds ?? 0;
    if (!secs || total === 0) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % total), secs * 1000);
    return () => clearTimeout(t);
  }, [index, story?.display.autoAdvanceSeconds, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const exit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    router.push("/library");
  }, [router]);

  // Hold-to-exit. A tap that is released early does nothing at all.
  useEffect(() => {
    if (holdMs === 0) return;
    if (holdMs >= EXIT_HOLD_MS) {
      exit();
      return;
    }
    const t = setTimeout(() => setHoldMs((h) => (h === 0 ? 0 : h + 100)), 100);
    return () => clearTimeout(t);
  }, [holdMs, exit]);

  if (error) {
    return (
      <main className="page">
        <p className="notice error">{error}</p>
        <button className="btn" onClick={() => router.push("/library")}>
          Back to library
        </button>
      </main>
    );
  }
  if (!story || !step) return <main className="page"><p className="muted">Opening…</p></main>;

  const src = mediaImageUrl(step.media);
  const locked = story.display.lockOpen;

  return (
    <div
      ref={rootRef}
      className={`player${story.display.highContrast ? " contrast" : ""}`}
      style={{ ["--text-scale" as string]: story.display.textScale }}
    >
      {locked ? (
        <button
          className="hold-exit"
          aria-label="Hold for three seconds to exit"
          onPointerDown={() => setHoldMs(100)}
          onPointerUp={() => setHoldMs(0)}
          onPointerLeave={() => setHoldMs(0)}
          onPointerCancel={() => setHoldMs(0)}
        >
          Hold to exit
          <span
            className="fill"
            style={{ width: `${Math.min(100, (holdMs / EXIT_HOLD_MS) * 100)}%` }}
          />
        </button>
      ) : (
        <button className="hold-exit" onClick={exit}>
          Exit
        </button>
      )}

      <div className="stage">
        {src ? <img alt={step.media.kind === "none" ? "" : step.media.label} src={src} /> : null}
        <p className="caption">{step.text || story.title}</p>
      </div>

      <div className="progress" aria-hidden="true">
        {story.steps.map((s, i) => (
          <span
            key={s.id}
            className={i === index ? "current" : i < index ? "done" : ""}
          />
        ))}
      </div>

      <div className="controls">
        <button
          className="btn secondary"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous step"
        >
          ← Back
        </button>
        <button
          className="btn"
          onClick={() => {
            if (index === total - 1) {
              if (!locked) exit();
              else setIndex(0);
            } else next();
          }}
          aria-label={index === total - 1 ? "Finish" : "Next step"}
        >
          {index === total - 1 ? (locked ? "Start again" : "Finished") : "Next →"}
        </button>
      </div>

      <p
        className="muted"
        style={{ textAlign: "center", padding: "0 16px 12px", fontSize: "0.8rem" }}
      >
        Step {index + 1} of {total}
        {" · "}
        <button
          onClick={() => void rootRef.current?.requestFullscreen?.().catch(() => {})}
          style={{
            background: "none",
            border: 0,
            font: "inherit",
            color: "inherit",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Full screen
        </button>
      </p>
    </div>
  );
}
