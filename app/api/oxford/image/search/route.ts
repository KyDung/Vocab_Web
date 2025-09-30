// app/api/oxford/image/search/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/oxford/image/search?term=apple&per=8
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");
    const per = Math.min(Number(searchParams.get("per") || "8"), 12);
    if (!term)
      return NextResponse.json({ error: "term required" }, { status: 400 });

    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", term);
    url.searchParams.set("per_page", String(per));
    url.searchParams.set("orientation", "squarish");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}`,
        "Accept-Version": "v1",
      },
      next: { revalidate: 60 * 60 }, // cache 1h
    });
    if (!res.ok)
      return NextResponse.json(
        { error: `Unsplash ${res.status}` },
        { status: 500 }
      );

    const data = await res.json();
    const urls = (data?.results || [])
      .map((r: any) => r?.urls?.small || r?.urls?.regular)
      .filter(Boolean);

    return NextResponse.json({ term, urls });
  } catch (e: any) {
    console.error("image/search error:", e);
    return NextResponse.json(
      { error: "Failed to search images" },
      { status: 500 }
    );
  }
}
