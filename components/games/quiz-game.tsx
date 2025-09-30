"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PronunciationButton } from "@/components/pronunciation-button";

interface Word {
  term: string;
  meaning: string;
}

interface Question {
  word: Word;
  options: string[];
  correctAnswer: string;
}

interface QuizGameProps {
  onComplete: (correct: number, total: number, time: number) => void;
  onBack: () => void;
}

export function QuizGame({ onComplete, onBack }: QuizGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, questions.length]);

  const loadQuestions = async () => {
    try {
      const response = await fetch("/api/game/random?n=10");
      if (response.ok) {
        const words: Word[] = await response.json();
        const generatedQuestions = generateQuestions(words);
        setQuestions(generatedQuestions);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = (words: Word[]): Question[] => {
    return words.map((word) => {
      const wrongAnswers = words
        .filter((w) => w.meaning !== word.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.meaning);

      const options = [word.meaning, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      );

      return {
        word,
        options,
        correctAnswer: word.meaning,
      };
    });
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === questions[currentIndex].correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleTimeUp = () => {
    if (!selectedAnswer) {
      setSelectedAnswer("");
      setShowResult(true);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      // Game completed - show completion dialog
      setCurrentIndex(questions.length);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setTimeLeft(30);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Không thể tải câu hỏi</h2>
        <Button onClick={onBack}>Quay lại</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (currentIndex >= questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Hoàn thành!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Điểm số: {correctCount}/{questions.length} (
              {Math.round((correctCount / questions.length) * 100)}%)
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Bạn có muốn chơi lại không?
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Chơi lại
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const endTime = Date.now();
                  const timeSpent = Math.round((endTime - startTime) / 1000);
                  onComplete(correctCount, questions.length, timeSpent);
                }}
              >
                Xem kết quả
              </Button>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Thoát
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {currentIndex + 1}/{questions.length}
            </Badge>
            <Badge variant="outline">Đúng: {correctCount}</Badge>
            <Badge
              variant={timeLeft <= 10 ? "destructive" : "secondary"}
              className={
                timeLeft <= 10
                  ? ""
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              }
            >
              <Clock className="w-4 h-4 mr-1" />
              {timeLeft}s
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <Card className="mb-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nghĩa của từ này là gì?
            </h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {currentQuestion.word.term}
              </h3>
              <PronunciationButton text={currentQuestion.word.term} />
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {currentQuestion.options.map((option, index) => {
            let buttonClass =
              "w-full p-4 text-left border-2 transition-all duration-200";

            if (showResult) {
              if (option === currentQuestion.correctAnswer) {
                buttonClass += " border-green-500 bg-green-50 text-green-700";
              } else if (
                option === selectedAnswer &&
                option !== currentQuestion.correctAnswer
              ) {
                buttonClass += " border-red-500 bg-red-50 text-red-700";
              } else {
                buttonClass +=
                  " border-muted bg-muted/50 text-muted-foreground";
              }
            } else {
              buttonClass +=
                " border-border hover:border-primary hover:bg-primary/5";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {showResult &&
                    option === selectedAnswer &&
                    option !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {showResult && (
          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              onClick={nextQuestion}
            >
              {currentIndex < questions.length - 1
                ? "Câu tiếp theo"
                : "Hoàn thành"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
