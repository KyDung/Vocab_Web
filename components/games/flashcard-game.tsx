"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PronunciationButton } from "@/components/pronunciation-button";

interface Word {
  term: string;
  meaning: string;
}

interface FlashcardGameProps {
  onComplete: (correct: number, total: number, time: number) => void;
  onBack: () => void;
}

export function FlashcardGame({ onComplete, onBack }: FlashcardGameProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadWords();
  }, []);

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

  const handleKnew = () => {
    setCorrectCount((prev) => prev + 1);
    nextCard();
  };

  const handleForgot = () => {
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Game completed - show completion dialog instead of calling onComplete immediately
      setCurrentIndex(words.length); // This will trigger the completion screen
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
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
              Bạn đã nhớ {correctCount}/{words.length} từ
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
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <Card
          className="mb-8 min-h-[300px] cursor-pointer bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex items-center justify-center p-8 text-center min-h-[300px]">
            {!isFlipped ? (
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-gray-800 dark:text-white select-none">
                    {currentWord.term}
                  </h2>
                  <PronunciationButton text={currentWord.term} />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Nhấn để xem nghĩa
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  {currentWord.meaning}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Bạn có nhớ từ này không?
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {!isFlipped ? (
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              onClick={() => setIsFlipped(true)}
            >
              Hiện nghĩa
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                onClick={handleForgot}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Quên rồi
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                onClick={handleKnew}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Nhớ rồi
              </Button>
            </>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Phím tắt: Space = Lật thẻ, Enter = Nhớ rồi, Esc = Quên rồi</p>
        </div>
      </div>
    </div>
  );
}
