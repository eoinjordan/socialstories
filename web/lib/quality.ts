import type { SentenceType, Story } from "./types";

/**
 * Checks a story against the widely-published Social Story authoring criteria
 * developed by Carol Gray, as summarised in the University of Bath / SOFA
 * "Guidance for writing and delivering Social Stories".
 *
 * IMPORTANT, both legally and honestly:
 *
 *  - This implements the *method* — a described procedure — in our own words.
 *    No text from Carol Gray's handouts, the Bath guidance, or any other
 *    publication is reproduced here or anywhere else in this repository.
 *  - "Social Story™" is Carol Gray's trademark and is attached to her criteria.
 *    Passing these checks does NOT make a story a certified Social Story, and
 *    the UI must never claim it does. This is a drafting aid that catches the
 *    common mistakes; it is not an authority and it cannot judge whether the
 *    story is true, kind, or right for the particular child.
 *  - Anyone writing stories seriously should read the source material. See
 *    catalog/README.md for where to find it.
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
  /** Describing sentences ÷ coaching sentences. Null when nothing coaches. */
  describeRatio: number | null;
  counts: Record<SentenceType, number>;
  /** True when no "must" finding is outstanding. */
  passes: boolean;
}

/** Sentence types that describe rather than direct. */
const DESCRIBING: SentenceType[] = ["descriptive", "perspective", "affirmative"];

/**
 * Second person makes a story instruct rather than explain, which is the single
 * most common thing that turns a social story into a list of orders.
 */
const SECOND_PERSON = /\b(you|your|you're|yours|yourself)\b/i;

/** Judgemental or commanding words the criteria steer away from. */
const AUTHORITARIAN =
  /\b(must|should|shouldn't|mustn't|don't|do not|never|always|bad|naughty|stupid|silly|wrong|can't|cannot|won't)\b/i;

/** Words that hedge instead of stating what actually happens. */
const VAGUE = /\b(get|got|stuff|things|nice|good boy|good girl)\b/i;

export function checkStory(story: Story): QualityReport {
  const findings: Finding[] = [];
  const steps = story.steps.filter((s) => s.text.trim().length > 0);

  const counts: Record<SentenceType, number> = {
    descriptive: 0,
    perspective: 0,
    affirmative: 0,
    coaching: 0,
    partial: 0,
  };
  for (const step of steps) {
    counts[step.sentenceType ?? classify(step.text)]++;
  }

  // --- Criterion 3: three parts and a title -------------------------------
  if (!story.title.trim() || /^new (social story|care pathway)$/i.test(story.title)) {
    findings.push({
      id: "title-missing",
      severity: "must",
      criterion: 3,
      title: "Give it a real title",
      detail:
        "The title says what the story is about. Keep it positive and about " +
        "what the person is doing, not what they must stop doing — " +
        "\"Getting my hair cut\" rather than \"Not shouting at the barber\".",
    });
  }
  if (steps.length < 3) {
    findings.push({
      id: "too-short",
      severity: "should",
      criterion: 3,
      title: "Add a beginning, middle and end",
      detail:
        "A story usually needs at least three steps: one that introduces the " +
        "topic, some that describe what happens, and one that closes on a " +
        "settled note.",
    });
  }

  // --- Criterion 5: voice and vocabulary ----------------------------------
  const secondPerson = indexesMatching(steps, SECOND_PERSON);
  if (secondPerson.length > 0) {
    findings.push({
      id: "second-person",
      severity: "must",
      criterion: 5,
      steps: secondPerson,
      title: "Avoid “you”",
      detail:
        "Write as “I” (or “he”/“she”/“they” for things that are hard to own). " +
        "“You” turns an explanation into an instruction aimed at the reader.",
    });
  }

  const bossy = indexesMatching(steps, AUTHORITARIAN);
  if (bossy.length > 0) {
    findings.push({
      id: "authoritarian",
      severity: "should",
      criterion: 5,
      steps: bossy,
      title: "Soften commanding or judging words",
      detail:
        "Words like “must”, “should”, “never” and “naughty” make the story " +
        "sound like a telling-off. “I can try to…” and “usually” carry the " +
        "same information without the judgement — and stay true when the " +
        "thing occasionally does not happen.",
    });
  }

  const vague = indexesMatching(steps, VAGUE);
  if (vague.length > 0) {
    findings.push({
      id: "vague",
      severity: "idea",
      criterion: 5,
      steps: vague,
      title: "Say exactly what happens",
      detail:
        "Literal accuracy matters. “We buy the bread” is clearer than “we get " +
        "the bread”; “the nurse looks in my ear” is clearer than “the nurse " +
        "does some things”.",
    });
  }

  const absolutes = steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => /\b(everyone|always|never|all people)\b/i.test(s.text))
    .map(({ i }) => i);
  if (absolutes.length > 0) {
    findings.push({
      id: "absolutes",
      severity: "idea",
      criterion: 5,
      steps: absolutes,
      title: "Check the absolute words are true",
      detail:
        "“Always”, “never” and “everyone” are taken literally. If there is any " +
        "chance the story will be wrong one day, “usually” or “most people” " +
        "keeps it trustworthy.",
    });
  }

  // --- Criterion 7 & 8: sentence mix and the describe-to-direct ratio ------
  if (counts.descriptive === 0 && steps.length > 0) {
    findings.push({
      id: "no-descriptive",
      severity: "must",
      criterion: 7,
      title: "Add at least one plain description",
      detail:
        "Every story needs at least one sentence that simply states a fact " +
        "about the situation — what happens, where, or who is there.",
    });
  }

  const describing = DESCRIBING.reduce((n, t) => n + counts[t], 0);
  const describeRatio = counts.coaching === 0 ? null : describing / counts.coaching;
  if (describeRatio !== null && describeRatio < 2) {
    findings.push({
      id: "too-directive",
      severity: "must",
      criterion: 8,
      title: "The story directs more than it explains",
      detail:
        `There ${describing === 1 ? "is" : "are"} ${describing} sentence` +
        `${describing === 1 ? "" : "s"} that describe and ${counts.coaching} ` +
        `that coach, a ratio of ${describeRatio.toFixed(1)}. The guidance asks ` +
        "for at least two describing sentences for every coaching one, so the " +
        "story explains the situation rather than issuing instructions. Add " +
        "description, or turn a “I will…” into “people usually…”.",
    });
  }

  // --- Criterion 6: the six questions --------------------------------------
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
      id: "six-questions",
      severity: "idea",
      criterion: 6,
      title: `Consider answering: ${unanswered.join(", ")}`,
      detail:
        "Stories work best when they cover who is involved, what happens, " +
        "where and when it happens, why it happens, and how to take part. " +
        "The missing ones above may be obvious to you but not to the reader.",
    });
  }

  // --- Criterion 9: make it theirs -----------------------------------------
  const photos = story.steps.filter((s) => s.media.kind === "drive").length;
  if (photos === 0 && steps.length > 0) {
    findings.push({
      id: "no-photos",
      severity: "idea",
      criterion: 9,
      title: "Add photos of the real people and places",
      detail:
        "Generic symbols are a fine starting point, but a story lands much " +
        "harder when it shows their actual dentist, their actual bus stop, " +
        "their own face. Every picture can be swapped for a photo.",
    });
  }

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

  // --- Criterion 4: length --------------------------------------------------
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
        "One idea per screen. If a step runs past about twenty words, it is " +
        "usually two steps. Longer explanation can go in the spoken-only field.",
    });
  }

  return {
    findings: findings.sort((a, b) => rank(a.severity) - rank(b.severity)),
    describeRatio,
    counts,
    passes: !findings.some((f) => f.severity === "must"),
  };
}

/**
 * Best-effort guess at a sentence's type, used to pre-fill the tag so authors
 * are correcting rather than starting from nothing. Always overridable — the
 * author's own tag wins.
 */
export function classify(text: string): SentenceType {
  const t = text.toLowerCase().trim();
  if (!t) return "descriptive";
  if (/_{2,}|\.{3}$|…$/.test(t)) return "partial";
  if (/\b(i (will|can|could) try|i can|i will|i could ask|i should try)\b/.test(t)) {
    return "coaching";
  }
  if (/\b(feels?|felt|likes?|enjoys?|happy|sad|angry|worried|proud|scared|hurts?|comfortable)\b/.test(t)) {
    return "perspective";
  }
  if (/\b(this is (okay|ok|important|good|fine|allowed)|that is (okay|ok|good|fine)|it is allowed|that helps)\b/.test(t)) {
    return "affirmative";
  }
  return "descriptive";
}

export const SENTENCE_TYPE_LABELS: Record<SentenceType, string> = {
  descriptive: "Describes a fact",
  perspective: "Describes a thought or feeling",
  affirmative: "Reassures or emphasises",
  coaching: "Suggests what to do",
  partial: "Leaves a gap to fill in",
};

export const SENTENCE_TYPE_HELP: Record<SentenceType, string> = {
  descriptive: "What happens, who is there, where it is. No opinion.",
  perspective: "How someone feels or what they think about it.",
  affirmative: "A short line that steadies the reader — “this is okay”.",
  coaching: "Suggests a response. Keep these few — see the ratio below.",
  partial: "A gap the reader fills, used to check they have understood.",
};

function indexesMatching(
  steps: Array<{ text: string }>,
  re: RegExp,
): number[] {
  return steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => re.test(s.text))
    .map(({ i }) => i);
}

function rank(s: Severity) {
  return s === "must" ? 0 : s === "should" ? 1 : 2;
}
