"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Trophy, Target } from "lucide-react";

interface CatCoinGameProps {
  onBack: () => void;
}

export function CatCoinGame({ onBack }: CatCoinGameProps) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const gameUrl = "/games/catcoin/FirstGame.html";

  const handlePlayGame = () => {
    // Mở game trong tab mới
    const gameWindow = window.open(gameUrl, "_blank", "noopener,noreferrer");
    setIsGameStarted(true);

    // Listen for messages from game
    window.addEventListener("message", handleGameMessage);
  };

  const handleGameMessage = (event: MessageEvent) => {
    // Nhận thông tin từ game Godot
    if (event.data.type === "coin-collected") {
      setTotalCoins((prev) => prev + 1);
    } else if (event.data.type === "question-answered") {
      if (event.data.correct) {
        setCorrectAnswers((prev) => prev + 1);
        setScore((prev) => prev + 10);
      }
    } else if (event.data.type === "game-won") {
      setGameWon(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("message", handleGameMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-slate-800 dark:to-yellow-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              🐱 Cat Coin Adventure
            </h1>
          </div>

          {/* Score Display */}
          {isGameStarted && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow">
                <span className="text-2xl">🪙</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">
                  {totalCoins}/10
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow">
                <Target className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-600 dark:text-green-400">
                  {correctAnswers}/10
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Game Container */}
        <Card className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-center text-gray-800 dark:text-slate-100">
              🐱 Nhặt 10 xu và trả lời đúng 10 câu hỏi từ vựng!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500 dark:from-yellow-600 dark:to-orange-700 rounded-b-lg overflow-hidden">
              {/* Game Preview */}
              {!isGameStarted ? (
                <div className="flex items-center justify-center h-[600px] text-white">
                  <div className="text-center">
                    <div className="text-8xl mb-6">🐱💰</div>
                    <h2 className="text-3xl font-bold mb-4">
                      Cat Coin Adventure
                    </h2>
                    <p className="text-lg mb-4 opacity-90">
                      Điều khiển mèo nhặt xu và học từ vựng!
                    </p>
                    <div className="mb-8 text-left max-w-md mx-auto bg-white/20 backdrop-blur-sm rounded-lg p-6">
                      <h3 className="font-bold text-xl mb-3">📋 Luật chơi:</h3>
                      <ul className="space-y-2">
                        <li>✅ Nhặt đủ 10 xu vàng</li>
                        <li>✅ Mỗi xu sẽ có 1 câu hỏi từ vựng</li>
                        <li>✅ Trả lời đúng 10/10 câu để chiến thắng</li>
                        <li>⏱️ Thời gian không giới hạn</li>
                      </ul>
                    </div>
                    <Button
                      onClick={handlePlayGame}
                      size="lg"
                      className="bg-white text-orange-600 hover:bg-gray-100 dark:bg-slate-200 dark:text-orange-700 dark:hover:bg-slate-300 font-bold text-xl px-8 py-4"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      🎮 Chơi Game Ngay
                    </Button>
                    <p className="text-sm mt-4 opacity-75">
                      Game sẽ mở trong tab mới
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] text-white">
                  <div className="text-center">
                    {gameWon ? (
                      <>
                        <div className="text-8xl mb-6">🏆</div>
                        <h2 className="text-3xl font-bold mb-4">
                          Chúc mừng! Bạn đã thắng!
                        </h2>
                        <p className="text-lg mb-4">Điểm số: {score} điểm</p>
                        <p className="text-lg mb-8">
                          Đã trả lời đúng {correctAnswers}/10 câu hỏi từ vựng
                        </p>
                        <Button
                          onClick={() => {
                            setIsGameStarted(false);
                            setScore(0);
                            setTotalCoins(0);
                            setCorrectAnswers(0);
                            setGameWon(false);
                          }}
                          size="lg"
                          className="bg-white text-orange-600 hover:bg-gray-100 font-bold"
                        >
                          🔄 Chơi lại
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-6 animate-bounce">🐱</div>
                        <h2 className="text-2xl font-bold mb-4">
                          Game đang chạy...
                        </h2>
                        <p className="text-lg opacity-90">
                          Kiểm tra tab game để chơi!
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
              📖 Hướng dẫn chơi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-slate-200">
                  🎮 Điều khiển:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• ⬅️➡️ Di chuyển trái/phải</li>
                  <li>• Space hoặc ⬆️ để nhảy</li>
                  <li>• Mouse để chọn đáp án</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-slate-200">
                  🎯 Mục tiêu:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• Nhặt đủ 10 xu vàng 🪙</li>
                  <li>• Trả lời đúng từ vựng</li>
                  <li>• Đạt 10/10 câu đúng để thắng</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-slate-200">
                  💡 Mẹo:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• Đọc kỹ câu hỏi trước khi chọn</li>
                  <li>• Không bị giới hạn thời gian</li>
                  <li>• Mỗi câu đúng +10 điểm</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
