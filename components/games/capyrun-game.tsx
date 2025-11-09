"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface CapyrunGameProps {
  onBack: () => void;
}

export function CapyrunGame({ onBack }: CapyrunGameProps) {
  const gameUrl = "/games/godot/CapyRun.html";

  const handlePlayGame = () => {
    // Mở game trong tab mới để tránh vấn đề iframe với headers
    window.open(gameUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              🏃‍♂️ Capyrun Adventure
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePlayGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi Game
            </Button>
          </div>
        </div>

        {/* Game Container */}
        <Card className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-center text-gray-800 dark:text-slate-100">
              🏃‍♂️ Cuộc phiêu lưu của Capybara và học từ vựng!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full bg-gradient-to-br from-green-500 to-blue-500 dark:from-emerald-600 dark:to-blue-600 rounded-b-lg overflow-hidden">
              {/* Game Preview */}
              <div className="flex items-center justify-center h-[600px] text-white">
                <div className="text-center">
                  <div className="text-8xl mb-6">🏃‍♂️</div>
                  <h2 className="text-3xl font-bold mb-4">Capyrun Adventure</h2>
                  <p className="text-lg mb-8 opacity-90">
                    Tham gia cuộc phiêu lưu cùng Capybara và học từ vựng!
                  </p>
                  <Button
                    onClick={handlePlayGame}
                    size="lg"
                    className="bg-white text-green-600 hover:bg-gray-100 dark:bg-slate-200 dark:text-emerald-700 dark:hover:bg-slate-300 font-bold text-xl px-8 py-4"
                  >
                    🎮 Chơi Game Ngay
                  </Button>
                  <p className="text-sm mt-4 opacity-75">
                    Game sẽ mở trong tab mới
                  </p>
                </div>
              </div>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-slate-200">🎮 Điều khiển:</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• Sử dụng phím mũi tên hoặc WASD để di chuyển</li>
                  <li>• Space để nhảy</li>
                  <li>• Mouse để tương tác với UI</li>
                  <li>• ESC để pause game</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-slate-200">🎯 Mục tiêu:</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• Điều khiển Capybara chạy và vượt chướng ngại vật</li>
                  <li>• Thu thập các vật phẩm đặc biệt</li>
                  <li>• Học từ vựng tiếng Anh trong game</li>
                  <li>• Đạt điểm số cao nhất có thể</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
