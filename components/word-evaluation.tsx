"use client";

import { useState, useEffect } from "react";
import { Brain, Star, Volume2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface WordEvaluationProps {
  word: string;
  meaning: string;
  source: "oxford" | "topics";
  topic?: string;
  className?: string;
  onEvaluationComplete?: (passed: boolean) => void;
}

interface EvaluationState {
  passed: boolean | null;
  feedback: string;
  attempts: number;
  loading: boolean;
}

export function WordEvaluation({
  word,
  meaning,
  source,
  topic,
  className = "",
  onEvaluationComplete,
}: WordEvaluationProps) {
  const [userInput, setUserInput] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationState>({
    passed: null,
    feedback: "",
    attempts: 0,
    loading: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Load existing progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error("No access token available");
          return;
        }

        const response = await fetch(
          `/api/word-status?word=${encodeURIComponent(word)}&source=${source}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to load word status:", response.status);
          return;
        }

        const data = await response.json();

        if (data.status) {
          setEvaluation((prev) => ({
            ...prev,
            passed:
              data.status === "mastered"
                ? true
                : data.status === "learning"
                ? false
                : null,
            feedback:
              data.status === "mastered"
                ? "Đã thành thạo từ này!"
                : data.status === "learning"
                ? "Đang học từ này"
                : "",
            attempts: data.status !== "not-started" ? 1 : 0,
          }));
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();
  }, [word, source, user]);

  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const submitToAI = async () => {
    if (!userInput.trim()) return;

    setEvaluation((prev) => ({ ...prev, loading: true }));

    try {
      // Gọi API evaluation
      const response = await fetch("/api/ai-evaluate-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          meaning,
          userInput: userInput.trim(),
          source,
          topic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newEvaluation = {
          passed: data.evaluation.passed,
          feedback: data.evaluation.feedback,
          attempts: evaluation.attempts + 1,
          loading: false,
        };

        setEvaluation(newEvaluation);

        console.log("AI Evaluation Result:", {
          word,
          userInput: userInput.trim(),
          passed: data.evaluation.passed,
          feedback: data.evaluation.feedback,
        });

        // Lưu progress vào database
        try {
          if (user) {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
              console.error("No access token for saving progress");
              return;
            }

            const response = await fetch("/api/word-status", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                word,
                source,
                isCorrect: data.evaluation.passed,
              }),
            });

            if (!response.ok) {
              console.error("Failed to save word status:", response.status);
            } else {
              console.log("Word status saved successfully");
            }
          }
        } catch (progressError) {
          console.error("Error saving progress:", progressError);
        }

        // Callback để cập nhật UI parent
        onEvaluationComplete?.(data.evaluation.passed);

        // Auto close dialog sau 3 giây nếu đạt
        if (data.evaluation.passed) {
          setTimeout(() => {
            setIsOpen(false);
            setUserInput("");
          }, 3000);
        }
      } else {
        setEvaluation((prev) => ({ ...prev, loading: false }));
        console.error("Evaluation failed:", data.error);
      }
    } catch (error) {
      console.error("Error calling AI evaluation:", error);
      setEvaluation((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetEvaluation = () => {
    setUserInput("");
    setEvaluation({ passed: null, feedback: "", attempts: 0, loading: false });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Pronunciation Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={speak}
        className="pronunciation-btn"
        title={`Phát âm "${word}"`}
      >
        <Volume2 className="w-4 h-4" />
      </Button>

      {/* Star Rating Display */}
      <div className="flex items-center">
        {evaluation.passed === true ? (
          <div title="Đã thành thạo từ này" className="animate-pulse">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
          </div>
        ) : evaluation.passed === false ? (
          <div title="Chưa thành thạo từ này - hãy thử lại!">
            <Star className="w-5 h-5 text-red-400 dark:text-red-500 fill-red-100 dark:fill-red-900" />
          </div>
        ) : (
          <div title="Chưa đánh giá - click 'Gửi tới AI' để kiểm tra">
            <Star className="w-5 h-5 text-gray-400 dark:text-gray-500 fill-gray-200 dark:fill-gray-700 opacity-80" />
          </div>
        )}
        {/* Production info - evaluation results */}
        <span className="text-xs text-gray-500 ml-1">
          {evaluation.passed === true
            ? "✓"
            : evaluation.passed === false
            ? "✗"
            : "?"}
        </span>
      </div>

      {/* AI Evaluation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            <Brain className="w-4 h-4 mr-2" />
            Gửi tới AI
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Đánh giá từ vựng
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {word}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={speak}
                className="mb-2"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Nghe phát âm
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>Nghĩa:</strong> {meaning}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Hãy viết một câu tiếng Anh sử dụng từ này:
              </p>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Viết câu tiếng Anh với từ này..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitToAI()}
                disabled={evaluation.loading}
                className="text-left"
              />

              <Button
                onClick={submitToAI}
                disabled={!userInput.trim() || evaluation.loading}
                className="w-full"
              >
                {evaluation.loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đánh giá...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi tới AI
                  </>
                )}
              </Button>
            </div>

            {/* Kết quả đánh giá chi tiết */}
            {evaluation.feedback && (
              <div
                className={`p-4 rounded-lg ${
                  evaluation.passed
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  {evaluation.passed ? (
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Star className="w-6 h-6 text-red-600 fill-red-600" />
                  )}
                  <span className="font-semibold">
                    {evaluation.passed ? "Xuất sắc!" : "Cần cải thiện"}
                  </span>
                </div>

                {/* Hiển thị feedback chi tiết với format markdown-like */}
                <div className="text-sm whitespace-pre-line">
                  {evaluation.feedback}
                </div>

                {evaluation.passed && (
                  <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-center">
                    <p className="text-sm font-medium">
                      🎉 Bạn đã thành thạo từ này!
                    </p>
                  </div>
                )}
              </div>
            )}

            {evaluation.attempts > 0 && (
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Lần thử: {evaluation.attempts}</span>
                <Button variant="ghost" size="sm" onClick={resetEvaluation}>
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
