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
            Story Rating:{" "}
            <strong>
              {report.storyRating === null
                ? "nothing coaches — that is fine"
                : report.storyRating.toFixed(1)}
            </strong>
            {report.storyRating !== null && report.storyRating >= 4
              ? " — at or above the required 4."
              : report.storyRating !== null
                ? " — the criteria require 4 or more."
                : ""}
            <br />
            Describing sentences ÷ coaching sentences, counting the title as a
            describing sentence.
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
            These checks follow the Social Stories 10.4 criteria (Carol Gray,
            Catherine Faherty, Siobhan Timmins &amp; Aaron Lanou). Passing them
            does <strong>not</strong> make this a Social Story. Most of the
            criteria — gathering information about the person, judging what
            they have misunderstood, planning how the story is introduced and
            reviewed — are human work no checker can see. Read it aloud before
            you use it.
          </p>
        </>
      ) : null}
    </section>
  );
}
