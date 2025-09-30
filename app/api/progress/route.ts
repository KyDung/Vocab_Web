import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Lấy progress của user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const source = searchParams.get("source"); // 'oxford' | 'topics' | 'all'

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let query = supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (source && source !== "all") {
      query = query.eq("source", source);
    }

    const { data: progress, error } = await query;

    if (error) {
      console.error("Error fetching progress:", error);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    // Tính thống kê
    const totalWords = progress?.length || 0;
    const masteredWords = progress?.filter((p) => p.is_mastered).length || 0;
    const inProgress = totalWords - masteredWords;

    return NextResponse.json({
      success: true,
      data: {
        progress: progress || [],
        stats: {
          totalWords,
          masteredWords,
          inProgress,
          masteryRate:
            totalWords > 0
              ? ((masteredWords / totalWords) * 100).toFixed(1)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Progress GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Cập nhật progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, word, wordMeaning, source, topic, isMastered, feedback } =
      body;

    if (!userId || !word || !source) {
      return NextResponse.json(
        { error: "Missing required fields: userId, word, source" },
        { status: 400 }
      );
    }

    // Kiểm tra xem đã có record chưa
    const { data: existing } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("word", word)
      .eq("source", source)
      .single();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const progressData: any = {
      user_id: userId,
      word,
      word_meaning: wordMeaning,
      source,
      topic: topic || null,
      is_mastered: isMastered,
      attempts: (existing?.attempts || 0) + 1,
      learned_date: existing?.learned_date || today,
      last_attempt_date: now.toISOString(),
      ai_feedback: feedback,
      updated_at: now.toISOString(),
    };

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("user_progress")
        .update(progressData)
        .eq("id", existing.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Insert new record
      progressData.first_attempt_date = now.toISOString();
      progressData.created_at = now.toISOString();

      const { data, error } = await supabase
        .from("user_progress")
        .insert([progressData])
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("Error saving progress:", result.error);
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Progress POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
