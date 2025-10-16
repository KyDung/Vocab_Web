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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Cài đặt tài khoản
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý thông tin cá nhân và tùy chọn ứng dụng
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === "success" 
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}>
            {message}
          </div>
        )}

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Cá nhân</TabsTrigger>
            <TabsTrigger value="learning">Học tập</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
            <TabsTrigger value="data">Dữ liệu</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-6">
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
                {/* Avatar Section */}
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
                  <Badge variant="default">
                    {user.user_metadata?.language_level || "Beginner"}
                  </Badge>
                </div>

                <Separator />

                {/* Personal Information Form */}
                <form onSubmit={handlePersonalInfoUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                      <p className="text-xs text-gray-500">
                        Email không thể thay đổi
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Giới thiệu bản thân</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Viết vài dòng về bản thân bạn..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+84 123 456 789"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Ngày sinh</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="birthDate"
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Giới tính</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                          <SelectItem value="prefer-not-to-say">Không muốn tiết lộ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Nghề nghiệp</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="occupation"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="Sinh viên, Kỹ sư, Giáo viên..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Hà Nội, TP.HCM..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Quốc gia</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Việt Nam"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Đường ABC, Quận XYZ"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <BookOpen className="w-5 h-5" />
                  Cài đặt học tập
                </CardTitle>
                <CardDescription>
                  Cá nhân hóa trải nghiệm học tập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="languageLevel">Trình độ tiếng Anh</Label>
                    <Select value={languageLevel} onValueChange={setLanguageLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (A1-A2)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (B1-B2)</SelectItem>
                        <SelectItem value="advanced">Advanced (C1-C2)</SelectItem>
                        <SelectItem value="native">Native Speaker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learningGoal">Mục tiêu học tập</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="learningGoal"
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        placeholder="TOEIC, IELTS, giao tiếp hàng ngày..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => updateProfile({ learning_goal: learningGoal, language_level: languageLevel })}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật mục tiêu học tập"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Lock className="w-5 h-5" />
                  Bảo mật tài khoản
                </CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu và cài đặt bảo mật
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
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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

            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Shield className="w-5 h-5" />
                  Cài đặt bảo mật khác
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Xác thực 2 lớp</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Thêm lớp bảo mật cho tài khoản
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Thiết lập
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Phiên đăng nhập</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quản lý các thiết bị đã đăng nhập
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
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
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="study-reminder">Nhắc nhở học tập</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhận nhắc nhở học tập hàng ngày
                    </p>
                  </div>
                  <Switch
                    id="study-reminder"
                    checked={studyReminder}
                    onCheckedChange={(checked) => handleSettingChange("studyReminder", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="progress-notifications">Thông báo tiến độ</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhận thông báo về milestone và achievement
                    </p>
                  </div>
                  <Switch
                    id="progress-notifications"
                    checked={progressNotifications}
                    onCheckedChange={(checked) => handleSettingChange("progressNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-report">Báo cáo tuần</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhận báo cáo tiến độ học tập hàng tuần
                    </p>
                  </div>
                  <Switch
                    id="weekly-report"
                    checked={weeklyReport}
                    onCheckedChange={(checked) => handleSettingChange("weeklyReport", checked)}
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

          {/* Data Tab */}
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Xuất dữ liệu học tập
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Nhập từ vựng từ file
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Sao lưu tiến độ
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Khôi phục dữ liệu
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
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
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Xóa tài khoản
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Card */}
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
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}