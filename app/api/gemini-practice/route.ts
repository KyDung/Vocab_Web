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
          "X-goog-api-key": "AIzaSyDBjGo2VNcCax-h_WHZZ2vuT85YWA0whVQ",
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
      console.error("API Error response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
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
    console.error("Gemini API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Có lỗi xảy ra khi phân tích. Vui lòng thử lại!",
      },
      { status: 500 }
    );
  }
}
