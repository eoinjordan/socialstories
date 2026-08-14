import { NextResponse } from "next/server";
import { searchBundled, type SymbolHit } from "@/lib/symbols";

export const dynamic = "force-dynamic";

/**
 * Symbol search: the bundled set first, then ARASAAC's live library.
 *
 * Bundled results come back instantly and work with no network, which is the
 * common case for the words these stories actually use. The live search then
 * tops up with anything else in ARASAAC's catalogue. If ARASAAC is unreachable
 * the bundled results still stand on their own, so the picker is never empty.
 *
 * Symbols are ARASAAC pictograms (Sergio Palao / Government of Aragón),
 * CC BY-NC-SA, attributed in the UI.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const locale = searchParams.get("locale") ?? "en";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const bundled = searchBundled(q);
  const seen = new Set(bundled.map((r) => r.id));
  const results: SymbolHit[] = [...bundled];

  try {
    const res = await fetch(
      `https://api.arasaac.org/api/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 86400 } },
    );
    if (res.ok) {
      const raw = (await res.json()) as Array<{
        _id: number;
        keywords?: Array<{ keyword?: string }>;
      }>;
      for (const p of raw) {
        if (seen.has(p._id) || results.length >= 80) continue;
        results.push({
          id: p._id,
          label: bestLabel(p.keywords, q),
          bundled: false,
        });
        seen.add(p._id);
      }
    }
  } catch {
    // Upstream down: the bundled results are still a usable answer.
  }

  return NextResponse.json({ results });
}

/**
 * ARASAAC lists every synonym for a symbol, and the first is often broader than
 * what was searched for ("brush" for a toothbrush query). Prefer the word the
 * user actually typed so labels and alt text stay meaningful.
 */
function bestLabel(
  keywords: Array<{ keyword?: string }> | undefined,
  query: string,
): string {
  const words = (keywords ?? [])
    .map((k) => k.keyword)
    .filter((k): k is string => Boolean(k));
  if (words.length === 0) return query;
  const needle = query.toLowerCase();
  return (
    words.find((w) => w.toLowerCase() === needle) ??
    words.find((w) => w.toLowerCase().includes(needle)) ??
    words[0]
  );
}
