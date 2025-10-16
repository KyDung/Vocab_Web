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
  LogOut,
  Camera,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  Globe,
  Check,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
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
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [occupation, setOccupation] = useState("");

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setBirthDate(user.birth_date || "");
      setGender(user.gender || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setOccupation(user.occupation || "");
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
    const emailNotif = localStorage.getItem("emailNotifications");
    setEmailNotifications(emailNotif !== null ? emailNotif === "true" : true);
  }, []);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return { text: "Yếu", color: "text-red-500" };
    if (score <= 3) return { text: "Trung bình", color: "text-yellow-500" };
    if (score <= 4) return { text: "Mạnh", color: "text-blue-500" };
    return { text: "Rất mạnh", color: "text-green-500" };
  };

  const getPasswordStrengthBar = (score: number) => {
    const percentage = (score / 6) * 100;
    let colorClass = "bg-red-500";
    if (score > 2) colorClass = "bg-yellow-500";
    if (score > 3) colorClass = "bg-blue-500";
    if (score > 4) colorClass = "bg-green-500";
    return { percentage, colorClass };
  };

  // Enhanced password validation
  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password)
    };

    const isValid = Object.values(requirements).every(req => req === true);
    
    return { 
      isValid, 
      requirements,
      score: getPasswordStrength(password)
    };
  };

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
        city,
        country,
        occupation,
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

    // Basic validation
    if (newPassword !== confirmPassword) {
      showMessage("Mật khẩu xác nhận không khớp", "error");
      setLoading(false);
      return;
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      showMessage("Mật khẩu mới chưa đạt yêu cầu bảo mật", "error");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify current password without changing session
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user?.email) {
        showMessage("Không thể xác minh người dùng", "error");
        setLoading(false);
        return;
      }

      // Try to sign in with current password to verify it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.data.user.email,
        password: currentPassword
      });

      if (verifyError) {
        showMessage("Mật khẩu hiện tại không đúng", "error");
        setLoading(false);
        return;
      }

      // Step 2: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        // Handle specific Supabase errors
        if (updateError.message.includes("Password should be at least")) {
          showMessage("Mật khẩu phải có ít nhất 6 ký tự", "error");
        } else if (updateError.message.includes("New password should be different")) {
          showMessage("Mật khẩu mới phải khác mật khẩu hiện tại", "error");
        } else {
          showMessage(`Lỗi cập nhật mật khẩu: ${updateError.message}`, "error");
        }
        setLoading(false);
        return;
      }

      // Success
      showMessage("Đổi mật khẩu thành công!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error("Password change error:", error);
      showMessage("Có lỗi không mong muốn xảy ra. Vui lòng thử lại.", "error");
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

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem("emailNotifications", checked.toString());
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
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === "success" 
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}>
            {message}
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
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

                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
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
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      required
                    />
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Độ mạnh mật khẩu:</span>
                          <span className={getPasswordStrengthText(getPasswordStrength(newPassword)).color}>
                            {getPasswordStrengthText(getPasswordStrength(newPassword)).text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBar(getPasswordStrength(newPassword)).colorClass}`}
                            style={{ width: `${getPasswordStrengthBar(getPasswordStrength(newPassword)).percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p>Để có mật khẩu mạnh hơn, hãy bao gồm:</p>
                          <ul className="ml-4 space-y-0.5">
                            <li className={validatePassword(newPassword).requirements.minLength ? "text-green-600" : "text-gray-400"}>
                              ✓ Ít nhất 8 ký tự
                            </li>
                            <li className={validatePassword(newPassword).requirements.hasUppercase ? "text-green-600" : "text-gray-400"}>
                              ✓ Chữ hoa (A-Z)
                            </li>
                            <li className={validatePassword(newPassword).requirements.hasLowercase ? "text-green-600" : "text-gray-400"}>
                              ✓ Chữ thường (a-z)
                            </li>
                            <li className={validatePassword(newPassword).requirements.hasNumber ? "text-green-600" : "text-gray-400"}>
                              ✓ Số (0-9)
                            </li>
                            <li className={validatePassword(newPassword).requirements.hasSpecialChar ? "text-green-600" : "text-gray-400"}>
                              ✓ Ký tự đặc biệt (!@#$%^&*)
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
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
                    {confirmPassword && newPassword && confirmPassword !== newPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Mật khẩu xác nhận không khớp
                      </p>
                    )}
                    {confirmPassword && newPassword && confirmPassword === newPassword && confirmPassword.length > 0 && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Mật khẩu khớp
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || !validatePassword(newPassword).isValid}
                    className="w-full md:w-auto"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang cập nhật...
                      </div>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </Button>
                </form>
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
                    onCheckedChange={handleEmailNotificationsChange}
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

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <User className="w-5 h-5" />
                  Quản lý tài khoản
                </CardTitle>
                <CardDescription>
                  Các tùy chọn về tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Thông tin tài khoản
                  </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Ngày tạo:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> Đã xác thực</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600 dark:text-red-400">
                    Vùng nguy hiểm
                  </h4>
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        Đăng xuất
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        Đăng xuất khỏi tài khoản trên thiết bị này
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}