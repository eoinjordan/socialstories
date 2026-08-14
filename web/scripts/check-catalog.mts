/**
 * Runs the story checker over the shipped catalogue, so the templates cannot
 * fail the advice the app gives its users. Run by CI on every push.
 *
 * With --symbols it additionally asks ARASAAC whether every picture keyword
 * resolves to something. That needs network, so it is opt-in: a template with
 * an unresolvable keyword arrives with a blank picture, which is a real defect
 * but not one worth failing a build over when the upstream API is down.
 */
import { TEMPLATES } from "../lib/catalog";
import { checkStory, type Finding } from "../lib/quality";
import { DEFAULT_DISPLAY, type Story } from "../lib/types";

const checkSymbols = process.argv.includes("--symbols");

function asStory(t: (typeof TEMPLATES)[number]): Story {
  return {
    schemaVersion: 2,
    id: t.id,
    kind: t.kind,
    purpose: t.purpose,
    title: t.title,
    audience: "Template",
    cover: { kind: "pictogram", id: 1, label: t.cover },
    steps: t.steps.map((s, i) => ({
      id: String(i),
      text: s.text,
      spoken: s.spoken,
      sentenceType: s.sentenceType,
      media: { kind: "pictogram", id: 1, label: s.picture },
    })),
    display: { ...DEFAULT_DISPLAY, ...t.display },
    createdAt: "",
    updatedAt: "",
  };
}

let failures = 0;

for (const template of TEMPLATES) {
  const report = checkStory(asStory(template));
  // "idea" findings are prompts for the carer adapting the template (add your
  // own photos, name the reader) and are expected to be open here.
  const blocking = report.findings.filter(
    (f: Finding) => f.severity === "must" || f.severity === "should",
  );
  // Every safety template deliberately trips the supervision reminder; that is
  // the check working, not the template being wrong.
  const real = blocking.filter((f) => f.id !== "supervision");

  if (real.length > 0) {
    failures++;
    console.error(
      `\n✗ ${template.title}  (rating ${report.storyRating ?? "no coaching"})`,
    );
    for (const f of real) {
      console.error(
        `    [${f.severity}] ${f.title}` +
          (f.steps ? `  steps ${f.steps.map((i) => i + 1).join(", ")}` : ""),
      );
    }
  }
}

// The 7th criterion applies to a person's whole collection. The catalogue is
// not one person's library, but shipping a set that is mostly instructions
// would push every user in the wrong direction from the start.
const celebrating = TEMPLATES.filter((t) => t.purpose === "celebrate").length;
if (celebrating * 2 < TEMPLATES.length) {
  failures++;
  console.error(
    `\n✗ Only ${celebrating} of ${TEMPLATES.length} templates celebrate. ` +
      "At least half should.",
  );
}

if (checkSymbols) {
  const keywords = new Set<string>();
  for (const t of TEMPLATES) {
    keywords.add(t.cover);
    t.steps.forEach((s) => keywords.add(s.picture));
  }
  const missing: string[] = [];
  for (const keyword of keywords) {
    try {
      const res = await fetch(
        `https://api.arasaac.org/api/pictograms/en/search/${encodeURIComponent(keyword)}`,
      );
      const hits = res.ok ? await res.json() : [];
      if (!Array.isArray(hits) || hits.length === 0) missing.push(keyword);
    } catch {
      console.warn(`  ? could not check "${keyword}" (network)`);
    }
  }
  if (missing.length > 0) {
    failures++;
    console.error(`\n✗ No ARASAAC symbol for: ${missing.join(", ")}`);
  } else {
    console.log(`✓ all ${keywords.size} picture keywords resolve`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} problem(s) in the catalogue.\n`);
  process.exit(1);
}

console.log(
  `✓ ${TEMPLATES.length} templates pass the story check ` +
    `(${celebrating} celebrate, ${TEMPLATES.length - celebrating} explain)`,
);
