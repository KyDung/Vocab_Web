import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { word, meaning, example, userInput } = await request.json();

    console.log("Sending request to Gemini API...");
    console.log("Input data:", { word, meaning, example, userInput });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
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
                  text: `Bạn là một giáo viên tiếng Anh. Đánh giá ngắn gọn bằng tiếng Việt về cách học sinh sử dụng từ vựng.

Từ vựng: "${word}"
Nghĩa: ${meaning}
Ví dụ: ${example}
Câu của học sinh: "${userInput}"

Yêu cầu phản hồi:
- KHÔNG chào hỏi
- Ngắn gọn, đúng trọng tâm (tối đa 60 từ)
- Đánh giá: đúng/sai nghĩa, ngữ pháp
- Đưa ra cách sửa (nếu cần)
- Khen ngợi ngắn gọn

Trả lời trực tiếp, không dài dòng.`,
                },
              ],
            },
          ],
        }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "🚨 GEMINI PRACTICE API ERROR:",
        response.status,
        errorText
      );

      let errorMessage = "Hệ thống AI phân tích từ vựng đang gặp sự cố. ";

      if (response.status === 429) {
        errorMessage += "Đã vượt quá giới hạn sử dụng API.";
        console.error("🚫 QUOTA EXCEEDED");
      } else if (response.status === 403) {
        errorMessage += "Không có quyền truy cập AI API.";
        console.error("🚫 FORBIDDEN - Kiểm tra API key");
      } else {
        errorMessage += `Lỗi không xác định (${response.status}).`;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorText,
          geminiStatus: response.status,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log("API Response data:", JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({
        success: true,
        feedback: data.candidates[0].content.parts[0].text,
      });
    } else {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("💥 GEMINI PRACTICE SYSTEM ERROR:", error);

    if (!process.env.GEMINI_API_KEY) {
      console.error("🔑 MISSING GEMINI_API_KEY environment variable");
      return NextResponse.json(
        {
          success: false,
          error: "Hệ thống AI chưa được cấu hình đúng. Thiếu API key.",
          details: "GEMINI_API_KEY not found",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Hệ thống AI phân tích gặp lỗi nghiêm trọng. Vui lòng liên hệ quản trị viên.",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
