"use client";

import { useMemo, useState } from "react";
import { checkStory, SENTENCE_TYPE_LABELS, type Severity } from "@/lib/quality";
import type { SentenceType, Story } from "@/lib/types";

const SEVERITY_LABEL: Record<Severity, string> = {
  must: "Fix",
  should: "Worth changing",
  idea: "Idea",
};

/**
 * Live feedback while writing. Shown collapsed by default so it advises rather
 * than nags — a carer who knows the person in front of them is entitled to
 * ignore every word of this.
 */
export default function QualityPanel({ story }: { story: Story }) {
  const [open, setOpen] = useState(false);
  const report = useMemo(() => checkStory(story), [story]);

  const mustCount = report.findings.filter((f) => f.severity === "must").length;

  return (
    <section className="card">
      <div className="row">
        <h2 style={{ margin: 0 }}>Story check</h2>
        <span className="spacer" />
        <span className={mustCount > 0 ? "tag warn" : "tag"}>
          {mustCount > 0
            ? `${mustCount} to fix`
            : report.findings.length > 0
              ? `${report.findings.length} suggestions`
              : "Looks good"}
        </span>
        <button
          className="btn secondary"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open ? (
        <>
          <div className="row" style={{ marginTop: 16, gap: 20 }}>
            {(Object.keys(SENTENCE_TYPE_LABELS) as SentenceType[]).map((t) => (
              <span key={t} className="muted">
                <strong>{report.counts[t]}</strong> {SENTENCE_TYPE_LABELS[t].toLowerCase()}
              </span>
            ))}
          </div>

          <p className="muted" style={{ marginTop: 8 }}>
            Describing-to-coaching ratio:{" "}
            <strong>
              {report.describeRatio === null
                ? "no coaching sentences"
                : report.describeRatio.toFixed(1)}
            </strong>
            {report.describeRatio !== null && report.describeRatio >= 2
              ? " — at or above the recommended 2."
              : report.describeRatio !== null
                ? " — the guidance asks for 2 or more."
                : ""}
          </p>

          {report.findings.length === 0 ? (
            <p>Nothing flagged. Read it aloud once more before you use it.</p>
          ) : (
            <ul style={{ paddingLeft: "1.2em" }}>
              {report.findings.map((f) => (
                <li key={f.id} style={{ marginBottom: 14 }}>
                  <strong>
                    {SEVERITY_LABEL[f.severity]}: {f.title}
                  </strong>
                  {f.steps?.length ? (
                    <span className="muted">
                      {" "}
                      (step{f.steps.length > 1 ? "s" : ""}{" "}
                      {f.steps.map((i) => i + 1).join(", ")})
                    </span>
                  ) : null}
                  <br />
                  <span className="muted">{f.detail}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="muted" style={{ fontSize: "0.85rem", marginTop: 20 }}>
            These checks follow the publicly described Social Story authoring
            criteria developed by Carol Gray. Passing them does not make this a
            certified Social Story™ — and no automated check can tell you
            whether the story is true, kind, or right for the person you are
            writing it for. You still have to read it aloud and think.
          </p>
        </>
      ) : null}
    </section>
  );
}
