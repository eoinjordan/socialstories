import type { Media } from "./types";

interface Hit {
  _id: number;
  keywords?: Array<{ keyword?: string }>;
}

const cache = new Map<string, Media>();

/**
 * Resolves a plain-English keyword to an ARASAAC symbol, server side.
 *
 * Templates store keywords rather than symbol ids so that the catalogue stays
 * readable and does not rot when ARASAAC reorganises its library. A keyword
 * that finds nothing degrades to "no picture" — the story is still usable, and
 * the carer can pick a symbol or photo themselves in the editor.
 */
export async function resolveKeyword(
  keyword: string,
  locale = "en",
): Promise<Media> {
  const key = `${locale}:${keyword}`;
  const cached = cache.get(key);
  if (cached) return cached;

  let media: Media = { kind: "none" };
  try {
    const res = await fetch(
      `https://api.arasaac.org/api/pictograms/${locale}/search/${encodeURIComponent(keyword)}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 86400 } },
    );
    if (res.ok) {
      const hits = (await res.json()) as Hit[];
      if (Array.isArray(hits) && hits.length > 0) {
        media = { kind: "pictogram", id: hits[0]._id, label: keyword };
      }
    }
  } catch {
    // Offline or upstream down: fall through to "no picture".
  }
  cache.set(key, media);
  return media;
}

/** Resolves many keywords, de-duplicated, a few at a time to stay polite. */
export async function resolveKeywords(
  keywords: string[],
  locale = "en",
): Promise<Map<string, Media>> {
  const unique = [...new Set(keywords)];
  const out = new Map<string, Media>();
  const BATCH = 6;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const media = await Promise.all(batch.map((k) => resolveKeyword(k, locale)));
    batch.forEach((k, j) => out.set(k, media[j]));
  }
  return out;
}
