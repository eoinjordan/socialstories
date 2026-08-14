import type { SentenceType, Story, StorySummary } from "./types";

/**
 * Checks a story against the **Social Stories 10.4 Criteria** (Carol Gray,
 * Catherine Faherty, Siobhan Timmins & Aaron Lanou, 2023), and against the
 * "It's Not a Social Story if…" screening questions that accompany them.
 *
 * IMPORTANT, both legally and honestly:
 *
 *  - This implements the *method* — a described procedure — in our own words.
 *    No text from the 10.4 handouts, the Bath/SOFA guidance, or any other
 *    publication is reproduced here or anywhere in this repository. Those
 *    documents are copyrighted and licensed for private use only.
 *  - "Social Story" and "Social Article" are Carol Gray's terms, attached to
 *    these criteria. Passing these checks does NOT make a story a Social Story
 *    and the UI must never claim it does. Most of the criteria — gathering
 *    information, judging what the person has misunderstood, choosing a
 *    respectful tone, planning how the story is introduced — are human work
 *    that no parser can see.
 *  - The screening instrument itself says it cannot confirm a story *is* a
 *    Social Story, only spot some ways it is not. The same is true here, more
 *    so. This is a drafting aid.
 *
 * Notable 10.4 changes from earlier revisions, which this file follows:
 *  - two sentence types, not seven;
 *  - the Story Rating must be **4 or more** (it was 2 in the 10.2-era guides);
 *  - **at most one** sentence may coach the Audience;
 *  - the title counts as a Descriptive Sentence in the formula;
 *  - at least **half** of a person's stories must celebrate what they do well.
 */

export type Severity = "must" | "should" | "idea";

export interface Finding {
  id: string;
  severity: Severity;
  /** Which of the ten criteria this relates to, for the curious. */
  criterion: number;
  title: string;
  detail: string;
  /** Step indexes the finding points at, if any. */
  steps?: number[];
}

export interface QualityReport {
  findings: Finding[];
  /**
   * Descriptive ÷ Coaching, with the title counted as Descriptive.
   * Null when the story coaches nowhere, which is fine and common.
   */
  storyRating: number | null;
  counts: Record<SentenceType, number>;
  /** True when no "must" finding is outstanding. */
  passes: boolean;
}

/** Second person turns a description into an instruction aimed at the reader. */
const SECOND_PERSON = /\b(you|your|you're|yours|yourself|you'll|you've)\b/i;

/**
 * Vocabulary the criteria rule out. The 10.4 screening lists should, shouldn't,
 * must, mustn't, ought, bad, naughty and inappropriate explicitly, and says
 * there are more; the rest here are the same kind of word.
 */
const JUDGEMENTAL =
  /\b(should|shouldn't|must|mustn't|ought|bad|naughty|inappropriate|misbehav\w*|stupid|silly|lazy|rude|wrong|disgusting|disgraceful)\b/i;

/** Vague verbs and nouns that dodge saying what actually happens. */
const VAGUE = /\b(get|got|stuff|nice|good boy|good girl|behave)\b/i;

/** Absolutes a literal reader will hold the story to. */
const ABSOLUTE = /\b(everyone|everybody|always|never|all people|nobody|no one)\b/i;

/**
 * Describing something the reader did wrong. The criteria forbid personalised
 * accounts of an Audience's negative behaviour in either voice — it shames the
 * reader in a document meant to reassure them.
 */
const NEGATIVE_SELF =
  /\b(i|he|she|they)\s+(hit|hits|bit|bites|kick|kicks|punch|punches|shout|shouts|scream|screams|swear|swears|lash|lashes)\b/i;

/**
 * Topics where a story must not stand in for an adult being present. The
 * criteria are explicit that a Social Story never replaces supervision, and
 * road safety is the example they give.
 */
const SUPERVISION_TOPIC =
  /\b(road|traffic|crossing|cross the|street|lost|stranger|fire|emergency|medicine|medication|knife|kettle|hot water|swim|water|drown)\b/i;

export function checkStory(story: Story): QualityReport {
  const findings: Finding[] = [];
  const steps = story.steps.filter((s) => s.text.trim().length > 0);

  const counts: Record<SentenceType, number> = {
    descriptive: 0,
    coachesAudience: 0,
    coachesTeam: 0,
  };
  for (const step of steps) {
    counts[step.sentenceType ?? classify(step.text)]++;
  }

  const hasTitle = Boolean(
    story.title.trim() &&
      !/^new (social story|care pathway|celebration story)$/i.test(story.title),
  );

  // --- Criterion 8: the formula -------------------------------------------
  // The title is itself a Descriptive Sentence and counts in the numerator.
  const describing = counts.descriptive + (hasTitle ? 1 : 0);
  const coaching = counts.coachesAudience + counts.coachesTeam;
  const storyRating = coaching === 0 ? null : describing / coaching;

  if (storyRating !== null && storyRating < 4) {
    findings.push({
      id: "story-rating",
      severity: "must",
      criterion: 8,
      title: `Story Rating is ${storyRating.toFixed(1)} — it needs to be 4 or more`,
      detail:
        `${describing} sentence${describing === 1 ? "" : "s"} describe ` +
        `(counting the title) and ${coaching} coach. The criteria ask for at ` +
        "least four describing sentences per coaching one, so the story " +
        "explains the situation rather than issuing instructions. Add " +
        "description, or turn an “I will…” into “people usually…”.",
    });
  }

  if (counts.coachesAudience > 1) {
    findings.push({
      id: "too-much-coaching",
      severity: "must",
      criterion: 8,
      steps: indexesOfType(steps, "coachesAudience"),
      title: "Only one sentence may tell the reader what to do",
      detail:
        `There are ${counts.coachesAudience}. Keep the single most useful one ` +
        "and rewrite the others as description — what happens, what other " +
        "people do, or what usually works — so the story stays an explanation.",
    });
  }

  // --- Criterion 3: structure ----------------------------------------------
  if (!hasTitle) {
    findings.push({
      id: "title-missing",
      severity: "must",
      criterion: 3,
      title: "Give it a real title",
      detail:
        "The title has to represent the topic, and it counts as a describing " +
        "sentence in the formula. Keep it about what the person is doing — " +
        "“Getting my hair cut”, not “Not shouting at the barber”.",
    });
  }
  if (steps.length < 3) {
    findings.push({
      id: "three-parts",
      severity: "must",
      criterion: 3,
      title: "A story needs an introduction, a body and a conclusion",
      detail:
        "Three parts, each of which may be a single sentence: one that " +
        "introduces the topic, one or more that add the detail, and one that " +
        "sums up and settles.",
    });
  }

  // --- Criterion 5: tone, safety and respect -------------------------------
  push(findings, steps, SECOND_PERSON, {
    id: "second-person",
    severity: "must",
    criterion: 5,
    title: "Remove “you”",
    detail:
      "Stories are written in the first person (“I”, “we”) or the third " +
      "(“he”, “she”, “they”). “You” points at the reader and instructs them.",
  });

  push(findings, steps, JUDGEMENTAL, {
    id: "judgemental",
    severity: "must",
    criterion: 5,
    title: "Remove judging or commanding words",
    detail:
      "Words like “should”, “must”, “ought”, “bad”, “naughty” and " +
      "“inappropriate” are ruled out — they turn a reassuring document into a " +
      "telling-off. “Usually”, “I can try to…” and plain description carry the " +
      "same information without the judgement.",
  });

  push(findings, steps, NEGATIVE_SELF, {
    id: "negative-behaviour",
    severity: "must",
    criterion: 5,
    title: "Do not narrate what the reader did wrong",
    detail:
      "A personalised account of the reader's own difficult behaviour, in any " +
      "voice, shames them in a document meant to reassure. Describe what " +
      "happens and what helps instead — the reader already knows what they did.",
  });

  push(findings, steps, ABSOLUTE, {
    id: "absolutes",
    severity: "should",
    criterion: 5,
    title: "Check the absolute words are literally true",
    detail:
      "“Always”, “never” and “everyone” will be taken at face value, and the " +
      "story loses trust the first time reality disagrees. “Usually” and " +
      "“most people” stay true.",
  });

  push(findings, steps, VAGUE, {
    id: "vague",
    severity: "idea",
    criterion: 5,
    title: "Say exactly what happens",
    detail:
      "Literal accuracy is required. “We buy the bread” beats “we get the " +
      "bread”; “the nurse looks in my ear” beats “the nurse does some things”.",
  });

  // The criteria are explicit that a story never replaces supervision.
  const topic = `${story.title} ${steps.map((s) => s.text).join(" ")}`;
  if (SUPERVISION_TOPIC.test(topic)) {
    findings.push({
      id: "supervision",
      severity: "should",
      criterion: 1,
      title: "This story must not stand in for an adult being there",
      detail:
        "Road safety, getting lost, medicines and water are the classic " +
        "examples: the story explains what happens, it does not make the " +
        "situation safe. Make sure the supervision plan is written in the " +
        "carer notes, and that nobody treats the story as the safeguard.",
    });
  }

  // --- Criterion 6: the WH questions ---------------------------------------
  const all = steps.map((s) => `${s.text} ${s.spoken ?? ""}`).join(" ").toLowerCase();
  const unanswered = [
    { q: "where", re: /\b(at|in|on)\s+(the|my|our)\b|room|shop|school|hospital|home|outside/ },
    { q: "when", re: /\b(morning|night|before|after|then|first|next|last|today|every day|time)\b/ },
    { q: "who", re: /\b(i|we|mum|dad|nurse|doctor|teacher|friend|people|grown-?up|someone)\b/ },
    { q: "why", re: /\b(because|so that|so i|to keep|helps?|means)\b/ },
  ]
    .filter(({ re }) => !re.test(all))
    .map(({ q }) => q);
  if (unanswered.length > 0 && steps.length >= 3) {
    findings.push({
      id: "wh-questions",
      severity: "idea",
      criterion: 6,
      title: `Consider answering: ${unanswered.join(", ")}`,
      detail:
        "Stories work best when they cover who is there, what happens, where " +
        "and when, why it happens, and how to take part. The missing ones are " +
        "often the ones that are obvious to you and invisible to the reader.",
    });
  }

  // --- Criterion 4: format --------------------------------------------------
  const missingPictures = story.steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.media.kind === "none" && s.text.trim())
    .map(({ i }) => i);
  if (missingPictures.length > 0) {
    findings.push({
      id: "missing-pictures",
      severity: "should",
      criterion: 4,
      steps: missingPictures,
      title: "Some steps have no picture",
      detail:
        "This app is for people who may not read the words. A step with no " +
        "picture is a blank screen to them.",
    });
  }

  const longSteps = steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.text.trim().split(/\s+/).length > 20)
    .map(({ i }) => i);
  if (longSteps.length > 0) {
    findings.push({
      id: "long-steps",
      severity: "should",
      criterion: 4,
      steps: longSteps,
      title: "Some steps are long",
      detail:
        "One idea per screen. Past about twenty words a step is usually two " +
        "steps. Longer explanation can go in the spoken-only field.",
    });
  }

  if (story.steps.every((s) => s.media.kind !== "drive") && steps.length > 0) {
    findings.push({
      id: "no-photos",
      severity: "idea",
      criterion: 4,
      title: "Add photos of the real people and places",
      detail:
        "Tailoring the story to the reader is a criterion in its own right. " +
        "Their actual dentist, their actual bus stop, their own face — every " +
        "picture here can be swapped for a photo.",
    });
  }

  if (!story.audience?.trim()) {
    findings.push({
      id: "no-audience",
      severity: "idea",
      criterion: 7,
      title: "Say who this story is for",
      detail:
        "Naming the reader lets the library check the rule that at least half " +
        "of a person's stories should celebrate what they already do well.",
    });
  }

  return {
    findings: findings.sort((a, b) => rank(a.severity) - rank(b.severity)),
    storyRating,
    counts,
    passes: !findings.some((f) => f.severity === "must"),
  };
}

export interface LibraryFinding {
  audience: string;
  celebrating: number;
  total: number;
}

/**
 * The 7th criterion is about a person's whole library rather than any single
 * story: at least half of what is written for someone should applaud what they
 * already do well. A collection that is entirely instructions tells its reader
 * they are a problem to be managed.
 */
export function checkLibrary(stories: StorySummary[]): LibraryFinding[] {
  const byAudience = new Map<string, StorySummary[]>();
  for (const s of stories) {
    const key = s.audience?.trim() || "";
    if (!key) continue; // cannot judge a collection we cannot group
    byAudience.set(key, [...(byAudience.get(key) ?? []), s]);
  }
  return [...byAudience.entries()]
    .map(([audience, list]) => ({
      audience,
      celebrating: list.filter((s) => s.purpose === "celebrate").length,
      total: list.length,
    }))
    .filter((r) => r.total >= 2 && r.celebrating * 2 < r.total);
}

/**
 * Best-effort guess at a sentence's type, used to pre-fill the tag so authors
 * correct rather than start from nothing. The author's own tag always wins.
 *
 * Under 10.4 everything that is not coaching is descriptive — including
 * sentences about feelings, which earlier revisions treated separately.
 */
export function classify(text: string): SentenceType {
  const t = text.toLowerCase().trim();
  if (!t) return "descriptive";
  // "Now I can wait" and "Today I asked" report something that already
  // happened; they describe an achievement rather than guiding a future
  // response. Celebration stories are largely made of these, and counting them
  // as coaching would push a perfectly good story below the required rating.
  if (/^(now|today|yesterday)\b/.test(t) || /\bused to\b/.test(t)) {
    return "descriptive";
  }
  // "I can/will…" is the reader being guided: coaching aimed at the Audience.
  if (/\b(i (will|can|could|might) (try|ask|use|take|go|tell|look|wait|say|hold|press)|i can try|i will try)\b/.test(t)) {
    return "coachesAudience";
  }
  // Someone else's response, or the reader's own rehearsed self-talk.
  if (/\b(will help|can help|helps? me|a grown-?up (will|can)|my (mum|dad|teacher|carer|nurse|doctor) (will|can)|someone (will|can)|staff (will|can))\b/.test(t)) {
    return "coachesTeam";
  }
  return "descriptive";
}

export const SENTENCE_TYPE_LABELS: Record<SentenceType, string> = {
  descriptive: "Describes something",
  coachesAudience: "Tells the reader what to do",
  coachesTeam: "Says what other people do",
};

export const SENTENCE_TYPE_HELP: Record<SentenceType, string> = {
  descriptive:
    "A fact about the situation, inside or out — what happens, who is there, how it feels. Most sentences should be this.",
  coachesAudience:
    "Guides the reader's own response. At most one of these per story.",
  coachesTeam:
    "Describes what other people will do, or self-talk the reader has already rehearsed.",
};

function indexesOfType(
  steps: Array<{ text: string; sentenceType?: SentenceType }>,
  type: SentenceType,
): number[] {
  return steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (s.sentenceType ?? classify(s.text)) === type)
    .map(({ i }) => i);
}

function push(
  findings: Finding[],
  steps: Array<{ text: string }>,
  re: RegExp,
  finding: Omit<Finding, "steps">,
) {
  const hits = steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => re.test(s.text))
    .map(({ i }) => i);
  if (hits.length > 0) findings.push({ ...finding, steps: hits });
}

function rank(s: Severity) {
  return s === "must" ? 0 : s === "should" ? 1 : 2;
}
