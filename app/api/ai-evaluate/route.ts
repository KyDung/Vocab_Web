import { NextRequest, NextResponse } from "next/server";

// Sử dụng Gemini API (free tier) để đánh giá
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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

async function evaluateWithAI(
  word: string,
  meaning: string,
  userInput: string
): Promise<EvaluationResponse> {
  if (!GEMINI_API_KEY) {
    // Fallback: simple evaluation if no API key
    const normalizedInput = userInput.toLowerCase().trim();
    const normalizedMeaning = meaning.toLowerCase();
    const passed =
      normalizedMeaning.includes(normalizedInput) ||
      normalizedInput.includes(normalizedMeaning);

    return {
      passed,
      feedback: passed ? "Correct answer! ✓" : "Try again! ✗",
      confidence: 0.5,
    };
  }

  try {
    const prompt = `
Evaluate if the user's answer for the English vocabulary word is correct or acceptable.

Word: "${word}"
Expected meaning: "${meaning}"
User's answer: "${userInput}"

Please evaluate whether the user's answer demonstrates understanding of the word's meaning. 
Consider synonyms, partial matches, and different ways of expressing the same concept.

Respond in JSON format only:
{
  "passed": boolean (true if the answer shows understanding, false otherwise),
  "feedback": string (brief explanation in Vietnamese, end with ✓ if passed or ✗ if not passed),
  "confidence": number (0.0 to 1.0 indicating how confident you are in the evaluation)
}

Be generous but fair - if the user shows basic understanding, mark as passed.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON từ AI response
    const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    const evaluation = JSON.parse(cleanResponse);

    return {
      passed: Boolean(evaluation.passed),
      feedback: evaluation.feedback
        ? evaluation.feedback.includes("✓") || evaluation.feedback.includes("✗")
          ? evaluation.feedback
          : evaluation.feedback + (Boolean(evaluation.passed) ? " ✓" : " ✗")
        : Boolean(evaluation.passed)
        ? "AI evaluation completed ✓"
        : "AI evaluation completed ✗",
      confidence: Math.max(
        0,
        Math.min(1, Number(evaluation.confidence) || 0.5)
      ),
    };
  } catch (error) {
    console.error("AI evaluation error:", error);

    // Fallback evaluation
    const normalizedInput = userInput.toLowerCase().trim();
    const normalizedMeaning = meaning.toLowerCase();
    const words = normalizedMeaning.split(/[\s,;.-]+/);

    const passed = words.some(
      (word) =>
        normalizedInput.includes(word.toLowerCase()) ||
        word.toLowerCase().includes(normalizedInput)
    );

    return {
      passed,
      feedback: passed ? "Trả lời đúng! ✓" : "Hãy thử lại! ✗",
      confidence: 0.3,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json();
    const { word, meaning, userInput, source, topic } = body;

    if (!word || !meaning || !userInput) {
      return NextResponse.json(
        { error: "Missing required fields: word, meaning, userInput" },
        { status: 400 }
      );
    }

    // AI evaluation
    const evaluation = await evaluateWithAI(word, meaning, userInput);

    // Return evaluation result - frontend will handle progress saving
    return NextResponse.json({
      success: true,
      evaluation: {
        passed: evaluation.passed,
        feedback: evaluation.feedback,
        confidence: evaluation.confidence,
        word,
        userInput,
      },
    });
  } catch (error) {
    console.error("AI evaluation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
