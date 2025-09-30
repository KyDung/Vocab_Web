import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET - Lấy thống kê từ user_word_strings bằng string method
export async function GET(request: NextRequest) {
  try {
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
    console.log(`📊 Getting stats for user: ${userId}`);

    // Lấy tất cả records của user từ string table
    const { data, error } = await supabase
      .from("user_word_strings")
      .select("source, mastered_words, learning_words")
      .eq("user_id", userId);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Khởi tạo stats object
    const stats = {
      total: {
        mastered: 0,
        learning: 0,
        total: 0,
      },
      bySource: {} as Record<
        string,
        {
          mastered: number;
          learning: number;
          total: number;
          masteredWords: string[];
          learningWords: string[];
        }
      >,
    };

    // Process từng source (oxford, topics)
    if (data && data.length > 0) {
      data.forEach((record) => {
        const source = record.source || "unknown";

        // Split strings và filter empty - đúng logic bạn yêu cầu
        const masteredWords = record.mastered_words
          ? record.mastered_words.split("'").filter(Boolean)
          : [];
        const learningWords = record.learning_words
          ? record.learning_words.split("'").filter(Boolean)
          : [];

        const masteredCount = masteredWords.length;
        const learningCount = learningWords.length;

        // Add to source stats
        stats.bySource[source] = {
          mastered: masteredCount,
          learning: learningCount,
          total: masteredCount + learningCount,
          masteredWords,
          learningWords,
        };

        // Add to total stats
        stats.total.mastered += masteredCount;
        stats.total.learning += learningCount;
        stats.total.total += masteredCount + learningCount;

        console.log(
          `📈 ${source}: ${masteredCount} mastered, ${learningCount} learning`
        );
      });
    }

    // Tính phần trám completion
    const oxfordTotal = 3000; // Target Oxford words
    const topicsTotal = 500; // Estimated topics words

    const result = {
      success: true,
      data: {
        // Tổng quan chung
        overview: {
          totalMastered: stats.total.mastered,
          totalLearning: stats.total.learning,
          totalStudied: stats.total.total,
          masteryRate:
            stats.total.total > 0
              ? ((stats.total.mastered / stats.total.total) * 100).toFixed(1)
              : "0",
        },

        // Chi tiết theo source
        bySource: {
          oxford: {
            mastered: stats.bySource.oxford?.mastered || 0,
            learning: stats.bySource.oxford?.learning || 0,
            total: stats.bySource.oxford?.total || 0,
            masteryRate:
              stats.bySource.oxford?.total > 0
                ? (
                    (stats.bySource.oxford.mastered /
                      stats.bySource.oxford.total) *
                    100
                  ).toFixed(1)
                : "0",
            progress: `${stats.bySource.oxford?.mastered || 0}/${oxfordTotal}`,
            completionRate: (
              ((stats.bySource.oxford?.mastered || 0) / oxfordTotal) *
              100
            ).toFixed(1),
          },
          topics: {
            mastered: stats.bySource.topics?.mastered || 0,
            learning: stats.bySource.topics?.learning || 0,
            total: stats.bySource.topics?.total || 0,
            masteryRate:
              stats.bySource.topics?.total > 0
                ? (
                    (stats.bySource.topics.mastered /
                      stats.bySource.topics.total) *
                    100
                  ).toFixed(1)
                : "0",
            progress: `${stats.bySource.topics?.mastered || 0}`,
            completionRate: "N/A", // Topics không có fixed total
          },
        },

        // Raw data cho debugging
        rawStats: stats,
      },
    };

    console.log(`📊 Final stats result:`, result.data.overview);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        data: {
          overview: {
            totalMastered: 0,
            totalLearning: 0,
            totalStudied: 0,
            masteryRate: "0",
          },
          bySource: {
            oxford: {
              mastered: 0,
              learning: 0,
              total: 0,
              masteryRate: "0",
              progress: "0/3000",
              completionRate: "0",
            },
            topics: {
              mastered: 0,
              learning: 0,
              total: 0,
              masteryRate: "0",
              progress: "0",
              completionRate: "N/A",
            },
          },
        },
      },
      { status: 500 }
    );
  }
}
