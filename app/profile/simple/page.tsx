"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Loader2,
  TrendingUp,
  Download,
  BookOpen,
  Target,
} from "lucide-react";

export default function SimpleProfile() {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user learning stats - được gọi ngay cả khi không có user thật
  useEffect(() => {
    fetchUserStats(); // Real user stats from Supabase
  }, []);

  const fetchUserStats = async () => {
    setLoadingStats(true);
    try {
      console.log("📊 Fetching stats from new string-based API...");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error("No access token available");
        setStats(null);
        return;
      }

      const response = await fetch(`/api/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        console.log("📈 Stats loaded successfully:", data.data);
        setStats(data.data);
      } else {
        console.log("❌ Stats API error:", data.error);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const exportLearningReport = () => {
    if (!stats) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      overview: stats.overview,
      bySource: stats.bySource,
      totalMastered: stats.overview.totalMastered,
      totalLearning: stats.overview.totalLearning,
      totalStudied: stats.overview.totalStudied,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocabulary-stats-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Không có token xác thực");
      }

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      console.log("API Response:", { status: response.status, data });

      if (!response.ok) {
        console.error("Upload failed:", data);
        throw new Error(
          data.error || `Upload failed with status ${response.status}`
        );
      }

      // Update user profile with new avatar URL
      await updateProfile({
        avatar_url: data.url,
      });

      setAvatarUrl(data.url);
      alert("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="w-full max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
              Chưa đăng nhập
            </h3>
            <p className="text-gray-600 dark:text-slate-300">
              Vui lòng đăng nhập để truy cập hồ sơ cá nhân
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Hồ sơ cá nhân
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Quản lý thông tin và avatar của bạn
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-t-lg">
            <CardTitle className="text-gray-900 dark:text-slate-100 text-xl">
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-600 shadow-xl">
                  <AvatarImage
                    src={avatarUrl || user.avatar || "/placeholder-user.jpg"}
                    alt="Profile picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-green-500 to-blue-500 text-white">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="space-y-3 text-center">
                <Button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Tải ảnh đại diện
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Tối đa 2MB • JPG, PNG, GIF, WEBP
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Họ và tên
                </label>
                <div className="relative">
                  <Input
                    value={user.name || "Chưa cập nhật"}
                    readOnly
                    className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 pl-10"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Input
                    value={user.email || ""}
                    readOnly
                    className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 pl-10"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  ID người dùng
                </label>
                <div className="relative">
                  <Input
                    value={user.id?.substring(0, 20) + "..." || ""}
                    readOnly
                    className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 pl-10 font-mono text-xs"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Progress Stats Section */}
            <div className="grid gap-6 mt-6">
              {/* Overall Progress */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Tiến độ học từ vựng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-gray-600 dark:text-slate-300">
                        Đang tải thống kê...
                      </span>
                    </div>
                  ) : stats ? (
                    <div className="space-y-6">
                      {/* Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Tổng tiến độ từ vựng
                          </span>
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            {stats.overview.totalMastered}/
                            {stats.overview.totalStudied} từ đã đạt
                          </span>
                        </div>
                        <Progress
                          value={parseFloat(stats.overview.masteryRate)}
                          className="h-3"
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
                          {stats.overview.masteryRate}% đã thành thạo từ những
                          từ đã học
                        </p>
                      </div>

                      {/* Quick Stats Grid - Oxford Focus */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800/50">
                          <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                            {stats.bySource.oxford.mastered}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                            Oxford Words Mastered
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            ({stats.bySource.oxford.masteryRate}% of studied)
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-100 dark:border-purple-800/50">
                          <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                            {stats.overview.totalStudied}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                            Total Words Studied
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">
                            Across all sources
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-orange-100 dark:border-orange-800/50">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-white text-sm font-bold">
                              📚
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                            {stats.overview.totalLearning}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                            Currently Learning
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            In progress
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-slate-300">
                        Chưa có dữ liệu học tập
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Hãy bắt đầu học từ vựng để xem tiến trình!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vocabulary Progress */}
              {stats && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 dark:text-slate-100 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Tiến độ từ vựng
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportLearningReport}
                        className="text-xs"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Xuất báo cáo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Progress - Oxford Focus */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-center">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Oxford 3000 Progress
                        </h3>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {stats.bySource.oxford.progress}
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                          {stats.bySource.oxford.completionRate}% of Oxford 3000
                          completed
                        </p>
                        <Progress
                          value={parseFloat(
                            stats.bySource.oxford.completionRate
                          )}
                          className="h-3"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
