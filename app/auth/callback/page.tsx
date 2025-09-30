"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Xử lý OAuth callback từ Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          setMessage(`Lỗi xác thực: ${error.message}`);
          return;
        }

        if (data.session && data.session.user) {
          const user = data.session.user;
          setStatus("success");

          // Xác định loại đăng nhập
          const isGoogleAuth = user.app_metadata?.provider === "google";
          const welcomeMessage = isGoogleAuth
            ? `Chào mừng ${
                user.user_metadata?.full_name || user.email
              }! Đăng nhập Google thành công.`
            : "Email đã được xác thực thành công!";

          setMessage(
            `${welcomeMessage} Bạn sẽ được chuyển hướng trong giây lát.`
          );

          // Chuyển hướng sau 2 giây
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            "Không thể hoàn tất quá trình xác thực. Vui lòng thử lại."
          );
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setStatus("error");
        setMessage("Có lỗi không mong muốn xảy ra. Vui lòng thử lại.");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="w-8 h-8 animate-spin" />
            )}
            {status === "success" && <CheckCircle className="w-8 h-8" />}
            {status === "error" && <XCircle className="w-8 h-8" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Đang xác thực..."}
            {status === "success" && "Xác thực thành công!"}
            {status === "error" && "Xác thực thất bại"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status === "error" && (
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Quay lại đăng nhập
              </Button>
              <Button
                onClick={() => router.push("/auth/register")}
                variant="outline"
                className="w-full"
              >
                Đăng ký lại
              </Button>
            </div>
          )}

          {status === "success" && (
            <p className="text-sm text-green-600">
              Đang chuyển hướng đến trang hồ sơ...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
