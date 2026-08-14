import generated from "./symbols.generated.json";

/**
 * The symbol set bundled with the app.
 *
 * `symbols.generated.json` maps a search term to the ARASAAC pictogram id that
 * serves it, and the matching PNG is committed under `public/symbols/`. That
 * means the picker works offline, works when ARASAAC is down, and keeps working
 * if upstream reorganises — which matters because these stories are written in
 * hospital corridors and school offices, and because a story that loses its
 * pictures is useless to the person who needs it.
 *
 * Regenerate with `npm run symbols:fetch` after editing `lib/vocabulary.ts`.
 */
interface Entry {
  id: number;
  /** Every bundled term that resolves to this same picture. */
  terms: string[];
}

const INDEX = generated as Record<string, Entry>;

const IDS = new Set<number>(Object.values(INDEX).map((e) => e.id));

export interface SymbolHit {
  id: number;
  label: string;
  /** True when the image ships with the app rather than being fetched. */
  bundled: boolean;
}

export function isBundled(id: number) {
  return IDS.has(id);
}

/** Static URL of a bundled pictogram. */
export function bundledUrl(id: number) {
  return `/symbols/${id}.png`;
}

export const BUNDLED_COUNT = IDS.size;

/**
 * Searches the bundled set. Exact matches first, then prefix, then substring —
 * so typing "wash" offers "wash hands" before "washing machine", and a carer
 * in a hurry gets the obvious answer at the top.
 */
export function searchBundled(query: string, limit = 60): SymbolHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const exact: SymbolHit[] = [];
  const prefix: SymbolHit[] = [];
  const contains: SymbolHit[] = [];
  const seen = new Set<number>();

  for (const [term, entry] of Object.entries(INDEX)) {
    if (seen.has(entry.id)) continue;
    const t = term.toLowerCase();
    const hit: SymbolHit = { id: entry.id, label: term, bundled: true };
    if (t === q) {
      exact.push(hit);
    } else if (t.startsWith(q)) {
      prefix.push(hit);
    } else if (t.includes(q)) {
      contains.push(hit);
    } else {
      continue;
    }
    seen.add(entry.id);
  }

  return [...exact, ...prefix, ...contains].slice(0, limit);
}

/** The bundled term list, grouped for browsing rather than searching. */
export function bundledTerms(): string[] {
  return Object.keys(INDEX).sort();
}
