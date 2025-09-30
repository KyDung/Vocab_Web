"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Word {
  term: string;
  meaning: string;
}

interface TypingGameProps {
  onComplete: (correct: number, total: number, time: number) => void;
  onBack: () => void;
}

export function TypingGame({ onComplete, onBack }: TypingGameProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds per word
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && words.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, words.length]);

  useEffect(() => {
    if (inputRef.current && !showResult) {
      inputRef.current.focus();
    }
  }, [currentIndex, showResult]);

  const loadWords = async () => {
    try {
      const response = await fetch("/api/game/random?n=10");
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      }
    } catch (error) {
      console.error("Failed to load words:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showResult) return;

    const isCorrect =
      userInput.toLowerCase().trim() === words[currentIndex].term.toLowerCase();
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    setShowResult(true);
  };

  const handleTimeUp = () => {
    if (!showResult) {
      setShowResult(true);
    }
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput("");
      setShowResult(false);
      setTimeLeft(45);
    } else {
      // Game completed - show completion dialog
      setCurrentIndex(words.length);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setUserInput("");
    setShowResult(false);
    setCorrectCount(0);
    setTimeLeft(45);
    loadWords();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Không thể tải từ vựng</h2>
        <Button onClick={onBack}>Quay lại</Button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const isCorrect =
    userInput.toLowerCase().trim() === currentWord.term.toLowerCase();

  if (currentIndex >= words.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Hoàn thành!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Điểm số: {correctCount}/{words.length} (
              {Math.round((correctCount / words.length) * 100)}%)
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
                  onComplete(correctCount, words.length, timeSpent);
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
              {currentIndex + 1}/{words.length}
            </Badge>
            <Badge variant="outline">Đúng: {correctCount}</Badge>
            <Badge
              variant={timeLeft <= 15 ? "destructive" : "secondary"}
              className={
                timeLeft <= 15
                  ? ""
                  : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
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
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <Card className="mb-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <Keyboard className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Gõ từ tiếng Anh tương ứng:
            </h2>
            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              {currentWord.meaning}
            </h3>
          </CardContent>
        </Card>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Nhập từ tiếng Anh..."
              disabled={showResult}
              className={`text-center text-2xl py-6 ${
                showResult
                  ? isCorrect
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-500 bg-red-50 text-red-700"
                  : ""
              }`}
            />
            {showResult && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
            )}
          </div>
          {!showResult && (
            <div className="text-center mt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                disabled={!userInput.trim()}
              >
                Kiểm tra
              </Button>
            </div>
          )}
        </form>

        {/* Result */}
        {showResult && (
          <div className="text-center mb-8">
            <div
              className={`p-4 rounded-lg mb-4 ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {isCorrect ? (
                <p className="text-green-700 font-semibold">Chính xác!</p>
              ) : (
                <div className="text-red-700">
                  <p className="font-semibold">Sai rồi!</p>
                  <p>
                    Đáp án đúng:{" "}
                    <span className="font-bold">{currentWord.term}</span>
                  </p>
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              onClick={nextWord}
            >
              {currentIndex < words.length - 1 ? "Từ tiếp theo" : "Hoàn thành"}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Nhấn Enter để kiểm tra đáp án</p>
        </div>
      </div>
    </div>
  );
}
