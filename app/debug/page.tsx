"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DebugSupabase() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [googleDebug, setGoogleDebug] = useState<any>({});

  // Debug Google OAuth configuration
  const debugGoogleOAuth = async () => {
    setLoading(true);
    const debug: any = {
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Missing",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "✅ Present"
        : "❌ Missing",
      currentUrl: window.location.origin,
      callbackUrl: `${window.location.origin}/auth/callback`,
      expectedSupabaseCallback: `https://nxfurjppnfmjsdpbngfj.supabase.co/auth/v1/callback`,
    };

    console.log("🔍 Starting Google OAuth debug...");

    try {
      // Test Supabase connection first
      console.log("🔍 Testing Supabase connection...");
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        debug.supabaseConnection = `❌ Connection failed: ${sessionError.message}`;
      } else {
        debug.supabaseConnection = "✅ Connection OK";
        debug.currentSession = session
          ? "✅ Has session"
          : "⚪ No session (normal)";
      }

      // Test Google OAuth provider với chi tiết
      console.log("🔍 Testing Google OAuth provider...");
      console.log(
        "🔍 Using redirect URL:",
        `${window.location.origin}/auth/callback`
      );

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true, // Don't redirect, just test
        },
      });

      console.log("🔍 OAuth response data:", data);
      console.log("🔍 OAuth response error:", error);

      if (error) {
        debug.googleOAuthTest = `❌ Error: ${error.message}`;
        debug.errorCode = error.status || "unknown";
        debug.fullError = JSON.stringify(error, null, 2);
        console.error("🔴 Full OAuth Error:", error);

        // Chi tiết hóa các loại lỗi
        if (
          error.message.includes("Provider not found") ||
          error.message.includes("google")
        ) {
          debug.solution =
            "❌ Google provider có vấn đề!\n\nKiểm tra:\n1. Google provider có thực sự được enable không?\n2. Client ID và Client Secret đã điền chưa?\n3. Thử refresh lại Supabase Dashboard";
          debug.status = "PROVIDER_ISSUE";
        } else if (
          error.message.includes("Invalid redirect") ||
          error.message.includes("redirect_uri")
        ) {
          debug.solution = `❌ Redirect URI không được accept!\n\nCần thêm vào Google Cloud Console > Credentials > OAuth 2.0 Client:\n• ${window.location.origin}/auth/callback\n• https://nxfurjppnfmjsdpbngfj.supabase.co/auth/v1/callback`;
          debug.status = "REDIRECT_URL_ISSUE";
        } else if (error.message.includes("unauthorized_client")) {
          debug.solution =
            "❌ Client ID không hợp lệ hoặc bị disable trong Google Cloud Console";
          debug.status = "CLIENT_UNAUTHORIZED";
        } else if (error.message.includes("invalid_client")) {
          debug.solution = "❌ Client Secret sai hoặc Client ID không đúng";
          debug.status = "INVALID_CLIENT";
        } else {
          debug.solution = `❌ Lỗi khác: ${
            error.message
          }\n\nChi tiết: ${JSON.stringify(error, null, 2)}`;
          debug.status = "OTHER_ERROR";
        }
      } else if (data && data.url) {
        debug.googleOAuthTest = "✅ Google OAuth provider working!";
        debug.oauthUrl = data.url;
        debug.status = "PROVIDER_READY";
        debug.solution =
          "✅ Google OAuth hoạt động bình thường!\n\nCó thể là vấn đề ở client-side. Thử:\n1. Clear browser cache\n2. Thử incognito mode\n3. Test redirect thực tế";

        // Kiểm tra URL có chứa client_id không
        if (data.url.includes("client_id=")) {
          debug.clientIdInUrl = "✅ Client ID found in OAuth URL";
        } else {
          debug.clientIdInUrl =
            "❌ No Client ID in OAuth URL - check Supabase config";
        }
      } else {
        debug.googleOAuthTest = "⚠️ Unexpected response - no error but no URL";
        debug.status = "UNEXPECTED";
        debug.solution = "⚠️ Response bất thường. Có thể là vấn đề tạm thời.";
      }

      // Thêm test thực tế với redirect
      debug.testInstructions = `📋 Để test thực tế:\n1. Vào http://localhost:3001/auth\n2. Mở Console (F12)\n3. Click 'Đăng nhập với Google'\n4. Xem có redirect đến Google không`;
    } catch (err: any) {
      debug.googleOAuthTest = `❌ Exception: ${err.message}`;
      debug.status = "EXCEPTION";
      debug.fullException = JSON.stringify(err, null, 2);
      console.error("🔴 Exception:", err);
    }

    console.log("🔍 Final debug results:", debug);
    setGoogleDebug(debug);
    setLoading(false);
  };
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("password123");

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      setResults({
        type: "connection",
        data,
        error,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setResults({
        type: "connection",
        error: err,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Demo User",
          },
        },
      });
      setResults({
        type: "signup",
        data,
        error,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setResults({
        type: "signup",
        error: err,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      setResults({
        type: "signin",
        data,
        error,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setResults({
        type: "signin",
        error: err,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testEnvVars = () => {
    setResults({
      type: "env",
      data: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing",
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Debug Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={testEnvVars} disabled={loading}>
                Test Env Vars
              </Button>
              <Button onClick={testConnection} disabled={loading}>
                Test Connection
              </Button>
              <Button onClick={testSignUp} disabled={loading}>
                Test Sign Up
              </Button>
              <Button onClick={testSignIn} disabled={loading}>
                Test Sign In
              </Button>
              <Button
                onClick={debugGoogleOAuth}
                disabled={loading}
                className="md:col-span-2 bg-red-500 hover:bg-red-600"
              >
                🔍 Debug Google OAuth
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Test Email</Label>
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Test Password</Label>
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
              </div>
            </div>

            {results && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Results ({results.type}) - {results.timestamp}
                </h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}

            {Object.keys(googleDebug).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  🔍 Google OAuth Debug Results
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {Object.entries(googleDebug).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>
                        <div className="text-right max-w-md">
                          {typeof value === "string" && value.includes("❌") ? (
                            <span className="text-red-600 font-semibold">
                              {value}
                            </span>
                          ) : typeof value === "string" &&
                            value.includes("✅") ? (
                            <span className="text-green-600 font-semibold">
                              {value}
                            </span>
                          ) : typeof value === "string" &&
                            value.includes("⚠️") ? (
                            <span className="text-yellow-600 font-semibold">
                              {value}
                            </span>
                          ) : (
                            <code className="bg-white px-2 py-1 rounded text-xs">
                              {String(value)}
                            </code>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {googleDebug.solution && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm whitespace-pre-line">
                        <strong>💡 Hướng dẫn khắc phục:</strong>
                        <br />
                        {googleDebug.solution}
                      </p>
                    </div>
                  )}

                  {googleDebug.status === "PROVIDER_NOT_ENABLED" && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">
                        🚨 Google Provider chưa được kích hoạt!
                      </h4>
                      <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                        <li>
                          Vào <strong>Supabase Dashboard</strong>
                        </li>
                        <li>
                          <strong>Authentication</strong> →{" "}
                          <strong>Providers</strong>
                        </li>
                        <li>
                          Tìm <strong>Google</strong> và <strong>Enable</strong>{" "}
                          nó
                        </li>
                        <li>
                          Thêm <strong>Client ID</strong> và{" "}
                          <strong>Client Secret</strong> từ Google Cloud Console
                        </li>
                        <li>
                          Click <strong>Save</strong>
                        </li>
                      </ol>
                    </div>
                  )}

                  {googleDebug.status === "PROVIDER_READY" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        ✅ Google OAuth sẵn sàng!
                      </h4>
                      <p className="text-sm text-green-700">
                        Provider đã được cấu hình đúng. Bạn có thể test Google
                        login ngay bây giờ!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
