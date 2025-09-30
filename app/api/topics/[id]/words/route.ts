import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topicId = params.id;
    const { data, error } = await supabase
      .from("topic_words")
      .select("id, term, meaning, pos, example, image_url")
      .eq("topic_id", topicId)
      .order("term", { ascending: true });

    if (error) {
      console.error("Topic words Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch topic words" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Topic words API unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic words" },
      { status: 500 }
    );
  }
}
