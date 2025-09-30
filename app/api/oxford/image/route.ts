import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
export const runtime = "nodejs";

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number.parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function fetchUnsplash(term: string) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", term);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "squarish");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}`,
      "Accept-Version": "v1",
    },
    next: { revalidate: 60 * 60 }, // cache 1h
  });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const data = await res.json();
  const hit = data?.results?.[0];
  return hit?.urls?.small || hit?.urls?.regular || null;
}

export async function POST(req: NextRequest) {
  try {
    const { term } = await req.json();
    if (!term)
      return NextResponse.json({ error: "term required" }, { status: 400 });

    const imageUrl = await fetchUnsplash(term);
    if (!imageUrl)
      return NextResponse.json({ error: "No image found" }, { status: 404 });

    const { rowCount } = await pool.query(
      `UPDATE public.oxford_words
       SET image_url = $1
       WHERE LOWER(term) = LOWER($2)`,
      [imageUrl, term]
    );

    return NextResponse.json({ term, image_url: imageUrl, updated: rowCount });
  } catch (e) {
    console.error("oxford/image error:", e);
    return NextResponse.json(
      { error: "Failed to fetch/save image" },
      { status: 500 }
    );
  }
}
