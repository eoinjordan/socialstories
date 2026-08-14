/**
 * The on-disk document format. One of these is stored per story as a JSON file
 * in the user's own Google Drive, so the format has to be self-describing and
 * forwards-compatible: the Android client reads the exact same bytes.
 */
export const SCHEMA_VERSION = 1;

/** Where a picture comes from. */
export type Media =
  | { kind: "none" }
  /** An ARASAAC pictogram, referenced by its numeric id. */
  | { kind: "pictogram"; id: number; label: string }
  /** A photo the user uploaded; lives as a file in their Drive folder. */
  | { kind: "drive"; fileId: string; label: string };

/**
 * The seven sentence types collapse to five distinct kinds for tagging
 * purposes (the three coaching variants behave identically for the ratio
 * check). See lib/quality.ts.
 */
export type SentenceType =
  | "descriptive"
  | "perspective"
  | "affirmative"
  | "coaching"
  | "partial";

export interface Step {
  id: string;
  /** Short sentence, first person, present tense. Kept deliberately short. */
  text: string;
  media: Media;
  /** Optional longer text read aloud but not shown, for low-literacy users. */
  spoken?: string;
  /** Author's tag, used by the quality check. Guessed when absent. */
  sentenceType?: SentenceType;
}

export type StoryKind = "story" | "pathway";

export interface Story {
  schemaVersion: number;
  id: string;
  kind: StoryKind;
  title: string;
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
  stepCount: number;
  cover: Media;
  updatedAt: string;
}

export function emptyStory(kind: StoryKind): Story {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    kind,
    title: kind === "pathway" ? "New care pathway" : "New social story",
    cover: { kind: "none" },
    steps: [{ id: crypto.randomUUID(), text: "", media: { kind: "none" } }],
    display: { ...DEFAULT_DISPLAY },
    createdAt: now,
    updatedAt: now,
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
