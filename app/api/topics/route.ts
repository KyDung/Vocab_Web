import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch topics and embed related topic_words (will return arrays if relationship exists)
    const { data: topics, error } = await supabase
      .from("topics")
      .select("id, name, description, topic_words(id)")
      .order("name", { ascending: true })

    if (error) {
      console.error("Topics API Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
    }

    // Map to include word_count derived from embedded topic_words
    const result = (topics || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      word_count: Array.isArray(t.topic_words) ? t.topic_words.length : 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Topics API unexpected error:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}
