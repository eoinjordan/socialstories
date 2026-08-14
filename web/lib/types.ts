/**
 * The on-disk document format. One of these is stored per story as a JSON file
 * in the user's own Google Drive, so the format has to be self-describing and
 * forwards-compatible: the Android client reads the exact same bytes.
 *
 * v2 moved the sentence model to the Social Stories 10.4 criteria, which
 * recognise only two sentence types (Descriptive and Coaching) rather than the
 * seven of earlier revisions. See lib/quality.ts and catalog/SOURCES.md.
 */
export const SCHEMA_VERSION = 2;

/** Where a picture comes from. */
export type Media =
  | { kind: "none" }
  /** An ARASAAC pictogram, referenced by its numeric id. */
  | { kind: "pictogram"; id: number; label: string }
  /** A photo the user uploaded; lives as a file in their Drive folder. */
  | { kind: "drive"; fileId: string; label: string };

/**
 * 10.4 recognises two sentence types. We split Coaching into two because the
 * criteria treat them differently: both count in the Story Rating denominator,
 * but only sentences that coach the *Audience* are capped at one per story.
 *
 *  - `descriptive`   — states a fact about the situation, inside or out.
 *  - `coachesAudience` — guides the reader's own response. At most one.
 *  - `coachesTeam`   — describes what other people (or the reader's own
 *                      rehearsed self-coaching) will do.
 */
export type SentenceType = "descriptive" | "coachesAudience" | "coachesTeam";

/**
 * The 7th criterion requires at least half of the stories written for a given
 * person to celebrate something they already do well, so each story has to
 * declare which kind it is.
 */
export type StoryPurpose = "explain" | "celebrate";

export interface Step {
  id: string;
  /** Short sentence, first or third person, present tense. */
  text: string;
  media: Media;
  /** Optional longer text read aloud but not shown, for low-literacy users. */
  spoken?: string;
  /** Author's tag, used by the story check. Guessed when absent. */
  sentenceType?: SentenceType;
}

export type StoryKind = "story" | "pathway";

export interface Story {
  schemaVersion: number;
  id: string;
  kind: StoryKind;
  title: string;
  /**
   * Who the story is for. Free text — a first name or a nickname is enough.
   * Used to group stories when checking the 50% celebration rule, so it is
   * worth keeping consistent across a person's stories.
   */
  audience?: string;
  purpose: StoryPurpose;
  /** Free-text note for the carer, never shown in play mode. */
  carerNotes?: string;
  cover: Media;
  steps: Step[];
  display: DisplaySettings;
  updatedAt: string;
  createdAt: string;
}

export interface DisplaySettings {
  /** Speak each step with the browser/device voice as it appears. */
  readAloud: boolean;
  /** 1 = default. Scales every piece of text in play mode. */
  textScale: number;
  /** Dark, low-stimulation palette instead of the default light one. */
  highContrast: boolean;
  /** Seconds per step when running as an unattended status radiator. 0 = manual. */
  autoAdvanceSeconds: number;
  /** Hide the exit button behind a long press so it can be left running. */
  lockOpen: boolean;
}

export const DEFAULT_DISPLAY: DisplaySettings = {
  readAloud: true,
  textScale: 1,
  highContrast: false,
  autoAdvanceSeconds: 0,
  lockOpen: false,
};

/** Metadata returned by the library listing (without loading every step). */
export interface StorySummary {
  id: string;
  driveFileId: string;
  title: string;
  kind: StoryKind;
  purpose: StoryPurpose;
  audience?: string;
  stepCount: number;
  cover: Media;
  updatedAt: string;
}

export function emptyStory(kind: StoryKind, purpose: StoryPurpose = "explain"): Story {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    kind,
    purpose,
    title:
      purpose === "celebrate"
        ? "New celebration story"
        : kind === "pathway"
          ? "New care pathway"
          : "New social story",
    cover: { kind: "none" },
    steps: [{ id: crypto.randomUUID(), text: "", media: { kind: "none" } }],
    display: { ...DEFAULT_DISPLAY },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Brings a story read from Drive up to the current schema.
 *
 * Stories live in people's own Drives indefinitely, so old documents have to
 * keep opening. v1 used the seven-sentence-type model; its three "describing"
 * types all collapse to Descriptive under 10.4, and `partial` (a fill-in-the-gap
 * comprehension check) is descriptive in form.
 */
export function migrate(raw: Story & { steps: Array<Step & { sentenceType?: string }> }): Story {
  if ((raw.schemaVersion ?? 1) >= SCHEMA_VERSION) return raw;
  const remap: Record<string, SentenceType> = {
    descriptive: "descriptive",
    perspective: "descriptive",
    affirmative: "descriptive",
    partial: "descriptive",
    coaching: "coachesAudience",
  };
  return {
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    purpose: raw.purpose ?? "explain",
    steps: raw.steps.map((s) => ({
      ...s,
      sentenceType: s.sentenceType ? remap[s.sentenceType] : undefined,
    })),
  };
}

export function mediaImageUrl(media: Media): string | null {
  switch (media.kind) {
    case "pictogram":
      return `/api/pictograms/image/${media.id}`;
    case "drive":
      return `/api/media/${media.fileId}`;
    default:
      return null;
  }
}
