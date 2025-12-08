import { NextRequest, NextResponse } from "next/server";

interface EvaluationRequest {
  word: string;
  meaning: string;
  userInput: string;
  source: "oxford" | "topics";
  topic?: string;
}

interface EvaluationResponse {
  passed: boolean;
  feedback: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { word, meaning, userInput, source, topic }: EvaluationRequest =
      await request.json();

    console.log("=== AI EVALUATION REQUEST ===");
    console.log("Word:", word);
    console.log("Meaning:", meaning);
    console.log("User Input:", userInput);
    console.log("Source:", source);

    // Call Gemini API for intelligent evaluation
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY || "",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Bạn là một giáo viên tiếng Anh chuyên nghiệp. Hãy đánh giá câu tiếng Anh của học sinh với các tiêu chí:

**Từ vựng học:** "${word}" (nghĩa: ${meaning})
**Câu của học sinh:** "${userInput}"

**Yêu cầu đánh giá:**

1. **KIỂM TRA CƠ BẢN:**
   - Có sử dụng từ "${word}" không?
   - Câu có ý nghĩa rõ ràng không?
   - Ngữ pháp có đúng không? (đặc biệt chú ý subject-verb agreement)

2. **TIÊU CHÍ ĐẠT/CHƯA ĐẠT:**
   - ĐẠT: Dùng đúng từ + ngữ pháp cơ bản đúng + có ý nghĩa
   - CHƯA ĐẠT: Không dùng từ hoặc sai ngữ pháp nghiêm trọng hoặc không có ý nghĩa

3. **LƯU Ý QUAN TRỌNG:**
   - KHÔNG trừ điểm vì thiếu viết hoa đầu câu
   - KHÔNG trừ điểm vì thiếu dấu chấm cuối câu
   - CHỈ tập trung vào: dùng từ đúng nghĩa + ngữ pháp cơ bản + ý nghĩa câu

**Trả lời thẳng bằng text thuần, KHÔNG dùng JSON:**

Đánh giá ngắn gọn theo format (KHÔNG dùng ** markdown):
📚 Từ vựng: [nếu không dùng từ "${word}" thì ghi "Không sử dụng từ vựng yêu cầu", nếu có thì đánh giá]
🔤 Ngữ pháp: [đánh giá ngữ pháp, chỉ ra lỗi cụ thể nếu có] 
✨ Chất lượng: [đánh giá tổng thể về câu]
💡 Kết luận: [ĐẠT/CHƯA ĐẠT + gợi ý ngắn gọn]

Trả lời trực tiếp, không bao bọc trong JSON, markdown hay code block.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("🚨 GEMINI API ERROR:", geminiResponse.status, errorText);

      // Return specific error messages for different status codes
      let errorMessage = "Hệ thống AI đánh giá đang gặp sự cố. ";
      let errorDetails = "";

      if (geminiResponse.status === 429) {
        errorMessage += "Đã vượt quá giới hạn sử dụng API.";
        errorDetails = "Quota exceeded - cần nâng cấp hoặc đợi reset quota";
        console.error("🚫 QUOTA EXCEEDED - Cần kiểm tra billing và quota");
      } else if (geminiResponse.status === 403) {
        errorMessage += "Không có quyền truy cập AI API.";
        errorDetails = "API key invalid hoặc chưa enable billing";
        console.error("🚫 FORBIDDEN - Kiểm tra API key và billing setup");
      } else if (geminiResponse.status === 400) {
        errorMessage += "Định dạng yêu cầu không hợp lệ.";
        errorDetails = "Bad request format";
        console.error("🚫 BAD REQUEST - Kiểm tra request format");
      } else {
        errorMessage += `Lỗi không xác định (${geminiResponse.status}).`;
        errorDetails = errorText;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorDetails,
          geminiStatus: geminiResponse.status,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      ); // Service Unavailable
    }

    const geminiData = await geminiResponse.json();
    console.log("Raw Gemini Response:", JSON.stringify(geminiData, null, 2));

    if (
      !geminiData.candidates ||
      !geminiData.candidates[0]?.content?.parts?.[0]?.text
    ) {
      throw new Error("Invalid Gemini response structure");
    }

    const geminiText = geminiData.candidates[0].content.parts[0].text;
    console.log("Gemini Text Response:", geminiText);

    // Process the response to extract feedback and determine if passed
    const cleanedText = geminiText.trim();

    // Determine if passed by checking for "ĐẠT" vs "CHƯA ĐẠT"
    const passed =
      cleanedText.includes("Kết luận: ĐẠT") ||
      (cleanedText.includes("ĐẠT") && !cleanedText.includes("CHƯA ĐẠT"));

    const evaluation: EvaluationResponse = {
      passed: passed,
      feedback: cleanedText, // Just use the clean text directly
      confidence: passed ? 0.85 : 0.75,
    };

    console.log("=== FINAL EVALUATION ===");
    console.log("Passed:", evaluation.passed);
    console.log("Confidence:", evaluation.confidence);
    console.log("Feedback:", evaluation.feedback);

    return NextResponse.json({
      success: true,
      evaluation: evaluation,
      source: "gemini-ai",
    });
  } catch (error) {
    console.error("💥 AI EVALUATION SYSTEM ERROR:", error);

    // Check if it's missing API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("🔑 MISSING GEMINI_API_KEY environment variable");
      return NextResponse.json(
        {
          success: false,
          error: "Hệ thống AI chưa được cấu hình đúng. Thiếu API key.",
          details: "GEMINI_API_KEY environment variable is missing",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Hệ thống AI gặp lỗi nghiêm trọng. Vui lòng liên hệ quản trị viên.",
        details:
          error instanceof Error ? error.message : "Unknown system error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
