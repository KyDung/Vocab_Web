import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export const runtime = "nodejs";

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

    const { error, count } = await supabase
      .from("oxford_words")
      .update({ image_url: imageUrl })
      .eq("term", term);

    if (error) {
      console.error("oxford/image Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ term, image_url: imageUrl, updated: count });
  } catch (e) {
    console.error("oxford/image error:", e);
    return NextResponse.json(
      { error: "Failed to fetch/save image" },
      { status: 500 }
    );
  }
}
