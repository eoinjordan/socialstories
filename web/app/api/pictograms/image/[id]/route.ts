import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 604800; // a week; pictogram ids are stable

type Ctx = { params: Promise<{ id: string }> };

/** Proxies a single ARASAAC pictogram PNG. Public — no user data involved. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Bad pictogram id" }, { status: 400 });
  }
  const upstream = await fetch(
    `https://static.arasaac.org/pictograms/${id}/${id}_500.png`,
  );
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
