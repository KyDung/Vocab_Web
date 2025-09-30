import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET - Get all word statuses từ string (không cần word parameter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get("word"); // Optional - để backward compatibility
    const source = searchParams.get("source") || "oxford"; // Default oxford

    // Get user from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = user.id;
    console.log(`🔍 GET: ${word ? `"${word}"` : "all words"} từ ${source}`);

    // Lấy strings từ database
    const { data, error } = await supabase
      .from("user_word_strings")
      .select("mastered_words, learning_words")
      .eq("user_id", userId)
      .eq("source", source)
      .single();

    if (word) {
      // Legacy mode: return specific word status
      let status = "not-started";

      if (data) {
        const masteredList = data.mastered_words
          ? data.mastered_words.split("'").filter(Boolean)
          : [];
        const learningList = data.learning_words
          ? data.learning_words.split("'").filter(Boolean)
          : [];

        if (masteredList.includes(word)) {
          status = "mastered";
        } else if (learningList.includes(word)) {
          status = "learning";
        }
      }

      console.log(`📤 Status: "${word}" = ${status}`);
      return NextResponse.json({ word, source, status });
    } else {
      // New mode: return all strings for parsing by frontend
      const result = {
        masteredWords: data?.mastered_words || "",
        learningWords: data?.learning_words || "",
        source,
      };

      console.log(`📤 All statuses for ${source}:`, result);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET error:", error);
    const { searchParams } = new URL(request.url);
    return NextResponse.json({
      masteredWords: "",
      learningWords: "",
      source: searchParams.get("source") || "oxford",
    });
  }
}

// POST - Update word status trong string
export async function POST(request: NextRequest) {
  try {
    const { word, source, isCorrect } = await request.json();

    if (!word || !source || typeof isCorrect !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get user from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = user.id;
    const newStatus = isCorrect ? "mastered" : "learning";

    console.log(`💾 POST: "${word}" → ${newStatus}`);

    // Lấy record hiện tại
    let { data: existing } = await supabase
      .from("user_word_strings")
      .select("*")
      .eq("user_id", userId)
      .eq("source", source)
      .single();

    let masteredWords: string[] = [];
    let learningWords: string[] = [];

    if (existing) {
      // Parse strings hiện có
      masteredWords = existing.mastered_words
        ? existing.mastered_words.split("'").filter((w: string) => w)
        : [];
      learningWords = existing.learning_words
        ? existing.learning_words.split("'").filter((w: string) => w)
        : [];
    }

    // Remove word khỏi cả 2 arrays - O(n + m)
    // Trong thực tế với vocabulary app, n và m thường rất nhỏ (< 1000) nên performance impact không đáng kể
    masteredWords = masteredWords.filter((w: string) => w !== word);
    learningWords = learningWords.filter((w: string) => w !== word);

    // Add vào array đúng
    if (isCorrect) {
      masteredWords.push(word);
    } else {
      learningWords.push(word);
    }

    // Convert về strings
    const masteredString = masteredWords.join("'");
    const learningString = learningWords.join("'");

    console.log(`✨ Mastered: "${masteredString}"`);
    console.log(`� Learning: "${learningString}"`);

    if (existing) {
      // Update
      await supabase
        .from("user_word_strings")
        .update({
          mastered_words: masteredString,
          learning_words: learningString,
          last_updated: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new
      await supabase.from("user_word_strings").insert({
        user_id: userId,
        source,
        mastered_words: masteredString,
        learning_words: learningString,
      });
    }

    console.log(`📤 Updated: "${word}" = ${newStatus}`);
    return NextResponse.json({ word, source, status: newStatus });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
