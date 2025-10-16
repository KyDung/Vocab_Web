"use client";

import type React from "react";
import { useAuth } from "@/lib/auth-context";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Lock,
  Bell,
  Palette,
  Database,
  LogOut,
  Camera,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Target,
  BookOpen,
  Globe,
  Download,
  Upload,
  Trash2,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, signOut, updateProfile } = useAuth();
  const router = useRouter();

  // Personal Info States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [occupation, setOccupation] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [languageLevel, setLanguageLevel] = useState("");

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [studyReminder, setStudyReminder] = useState(true);
  const [progressNotifications, setProgressNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setBirthDate(user.birth_date || "");
      setGender(user.gender || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setOccupation(user.occupation || "");
      setLearningGoal(user.learning_goal || "");
      setLanguageLevel(user.language_level || "");
    }
  }, [user]);

  // Load settings from localStorage
  useEffect(() => {
    // Load theme
    const theme = localStorage.getItem("theme");
    const isDark = theme === "dark";
    setDarkMode(isDark);

    // Apply theme immediately
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Load notification settings
    const settings = {
      emailNotifications: localStorage.getItem("emailNotifications"),
      pushNotifications: localStorage.getItem("pushNotifications"),
      studyReminder: localStorage.getItem("studyReminder"),
      progressNotifications: localStorage.getItem("progressNotifications"),
      weeklyReport: localStorage.getItem("weeklyReport"),
    };

    setEmailNotifications(settings.emailNotifications !== null ? settings.emailNotifications === "true" : true);
    setPushNotifications(settings.pushNotifications !== null ? settings.pushNotifications === "true" : false);
    setStudyReminder(settings.studyReminder !== null ? settings.studyReminder === "true" : true);
    setProgressNotifications(settings.progressNotifications !== null ? settings.progressNotifications === "true" : true);
    setWeeklyReport(settings.weeklyReport !== null ? settings.weeklyReport === "true" : true);
  }, []);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handlePersonalInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name,
        bio,
        phone,
        birth_date: birthDate,
        gender,
        address,
        city,
        country,
        occupation,
        learning_goal: learningGoal,
        language_level: languageLevel,
      });
      showMessage("Cập nhật thông tin cá nhân thành công!", "success");
    } catch (error) {
      showMessage("Có lỗi xảy ra khi cập nhật thông tin.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      showMessage("Mật khẩu xác nhận không khớp", "error");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      showMessage("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement actual password change with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showMessage("Đổi mật khẩu thành công!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showMessage("Có lỗi xảy ra khi đổi mật khẩu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleThemeChange = (checked: boolean) => {
    setDarkMode(checked);
    const theme = checked ? "dark" : "light";
    localStorage.setItem("theme", theme);

    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Settings handlers
  const handleSettingChange = (setting: string, value: boolean) => {
    localStorage.setItem(setting, value.toString());
    switch (setting) {
      case "emailNotifications":
        setEmailNotifications(value);
        break;
      case "pushNotifications":
        setPushNotifications(value);
        break;
      case "studyReminder":
        setStudyReminder(value);
        break;
      case "progressNotifications":
        setProgressNotifications(value);
        break;
      case "weeklyReport":
        setWeeklyReport(value);
        break;
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement actual data export
      const userData = {
        profile: user,
        settings: {
          emailNotifications,
          pushNotifications,
          studyReminder,
          progressNotifications,
          weeklyReport,
          darkMode,
        },
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vocab-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showMessage("Xuất dữ liệu thành công!", "success");
    } catch (error) {
      showMessage("Có lỗi xảy ra khi xuất dữ liệu.", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Vui lòng đăng nhập để truy cập cài đặt.
              </p>
              <Button asChild className="mt-4">
                <a href="/auth/login">Đăng nhập</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Cài đặt tài khoản
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý thông tin cá nhân và tùy chọn ứng dụng
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">{message}</p>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
            <TabsTrigger value="data">Dữ liệu</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <User className="w-5 h-5" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin hồ sơ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {user.name?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name || user.email}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => router.push("/profile/simple")}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Đổi ảnh đại diện
                    </Button>
                  </div>
                  <Badge variant="default">Email</Badge>
                </div>

                <Separator />

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        disabled={false}
                      />
                      {false && (
                        <p className="text-xs text-gray-500">
                          Email Google không thể thay đổi
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Lock className="w-5 h-5" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu để bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Bell className="w-5 h-5" />
                  Thông báo
                </CardTitle>
                <CardDescription>
                  Quản lý cách bạn nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Thông báo email</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhận thông báo qua email về tiến độ học tập
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={handleEmailNotificationsChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhận thông báo đẩy trên trình duyệt
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={handlePushNotificationsChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Palette className="w-5 h-5" />
                  Giao diện
                </CardTitle>
                <CardDescription>Tùy chỉnh giao diện ứng dụng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Chế độ tối</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sử dụng giao diện tối để bảo vệ mắt
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={handleThemeChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Database className="w-5 h-5" />
                  Quản lý dữ liệu
                </CardTitle>
                <CardDescription>
                  Xuất, nhập hoặc xóa dữ liệu của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">Xuất dữ liệu học tập</Button>
                  <Button variant="outline">Nhập từ vựng từ file</Button>
                  <Button variant="outline">Sao lưu tiến độ</Button>
                  <Button variant="outline">Khôi phục dữ liệu</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600 dark:text-red-400">
                    Vùng nguy hiểm
                  </h4>
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        Xóa tài khoản
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu
                      </p>
                    </div>
                    <Button variant="destructive">Xóa tài khoản</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  Đăng xuất
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Đăng xuất khỏi tài khoản trên thiết bị này
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
