import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Search proxy for the ARASAAC open pictogram library
 * (https://arasaac.org — symbols licensed CC BY-NC-SA, attributed in the UI).
 * Proxying keeps the client on one origin and lets us cache popular searches.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const locale = searchParams.get("locale") ?? "en";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const url =
    `https://api.arasaac.org/api/pictograms/${encodeURIComponent(locale)}` +
    `/search/${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });

    const raw = (await res.json()) as Array<{
      _id: number;
      keywords?: Array<{ keyword?: string }>;
    }>;
    const results = raw.slice(0, 60).map((p) => ({
      id: p._id,
      label: bestLabel(p.keywords, q),
    }));
    return NextResponse.json({ results });
  } catch {
    // A symbol search failing should degrade to "no results", never to an error
    // page — the user can still write text or upload their own photo.
    return NextResponse.json({ results: [] });
  }
}

/**
 * ARASAAC lists every synonym for a symbol, and the first one is often broader
 * than what was searched for ("brush" for a toothbrush query). Prefer the
 * keyword the user actually typed so labels and alt text stay meaningful.
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
