"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  occupation?: string;
  learning_goal?: string;
  language_level?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    occupation?: string;
    learning_goal?: string;
    language_level?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: { message: string } }>;
  signUp: (
    email: string,
    password: string,
    options?: { data: { full_name: string } }
  ) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    occupation?: string;
    learning_goal?: string;
    language_level?: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session từ Supabase THẬT
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes THẬT
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      name:
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        "Người dùng",
      email: supabaseUser.email || "",
      avatar:
        supabaseUser.user_metadata?.avatar_url ||
        generateAvatarPlaceholder(
          supabaseUser.user_metadata?.name || supabaseUser.email || "U"
        ),
      bio: supabaseUser.user_metadata?.bio,
      phone: supabaseUser.user_metadata?.phone,
      birth_date: supabaseUser.user_metadata?.birth_date,
      gender: supabaseUser.user_metadata?.gender,
      address: supabaseUser.user_metadata?.address,
      city: supabaseUser.user_metadata?.city,
      country: supabaseUser.user_metadata?.country,
      occupation: supabaseUser.user_metadata?.occupation,
      learning_goal: supabaseUser.user_metadata?.learning_goal,
      language_level: supabaseUser.user_metadata?.language_level,
      user_metadata: {
        full_name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name,
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        bio: supabaseUser.user_metadata?.bio,
        phone: supabaseUser.user_metadata?.phone,
        birth_date: supabaseUser.user_metadata?.birth_date,
        gender: supabaseUser.user_metadata?.gender,
        address: supabaseUser.user_metadata?.address,
        city: supabaseUser.user_metadata?.city,
        country: supabaseUser.user_metadata?.country,
        occupation: supabaseUser.user_metadata?.occupation,
        learning_goal: supabaseUser.user_metadata?.learning_goal,
        language_level: supabaseUser.user_metadata?.language_level,
      },
    };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Map Supabase login errors to user-friendly Vietnamese messages
        let errorMessage = error.message;

        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email hoặc mật khẩu không đúng";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage =
            "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư và xác nhận email trước khi đăng nhập";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Quá nhiều lần thử đăng nhập. Vui lòng đợi vài phút";
        } else if (error.message.includes("User not found")) {
          errorMessage =
            "Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Định dạng email không hợp lệ";
        }

        return { error: { message: errorMessage } };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
      return {};
    } catch (error: any) {
      return { error: { message: error.message || "Đăng nhập thất bại" } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    options?: { data: { full_name: string } }
  ) => {
    setLoading(true);
    try {
      // Dynamic redirect URL detection
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : `${
              process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
            }/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: options?.data?.full_name,
            full_name: options?.data?.full_name,
          },
        },
      });

      if (error) {
        // Map Supabase errors to user-friendly Vietnamese messages
        let errorMessage = error.message;

        if (error.message.includes("User already registered")) {
          errorMessage = "Email này đã được đăng ký";
        } else if (error.message.includes("already registered")) {
          errorMessage = "Tài khoản với email này đã tồn tại";
        } else if (error.message.includes("Email rate limit")) {
          errorMessage = "Quá nhiều yêu cầu, vui lòng đợi vài phút";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Địa chỉ email không hợp lệ";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "Mật khẩu phải có ít nhất 6 ký tự";
        } else if (error.message.includes("signup is disabled")) {
          errorMessage = "Tính năng đăng ký tạm thời bị vô hiệu hóa";
        }

        return { error: { message: errorMessage } };
      }

      // KHÔNG tự động set user - để user xác thực email trước
      return {};
    } catch (error: any) {
      return { error: { message: error.message || "Đăng ký thất bại" } };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      console.log("🔵 Attempting Google OAuth login...");
      console.log("🔵 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("🔵 Current origin:", window.location.origin);

      // Kiểm tra xem có Supabase URL không
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error(
          "❌ NEXT_PUBLIC_SUPABASE_URL chưa được cấu hình trong .env.local"
        );
      }

      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error(
          "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY chưa được cấu hình trong .env.local"
        );
      }

      console.log("✅ Environment variables OK");

      // Test kết nối Supabase trước
      const { data: testSession, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("🔴 Supabase connection failed:", sessionError);
        throw new Error(`Không thể kết nối Supabase: ${sessionError.message}`);
      }
      console.log("✅ Supabase connection OK");

      // Thử Google OAuth
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : `${
              process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
            }/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("🔴 Supabase Google OAuth error:", error);
        console.error("🔴 Error details:", JSON.stringify(error, null, 2));

        // Specific error messages based on common issues
        if (
          error.message.includes("Provider not found") ||
          error.message.includes("google")
        ) {
          throw new Error(
            "❌ Google provider chưa được kích hoạt hoặc cấu hình sai trong Supabase Dashboard.\n\n🔧 Hướng dẫn:\n1. Vào Supabase Dashboard > Authentication > Providers\n2. Enable Google provider\n3. Thêm Client ID và Client Secret từ Google Cloud Console"
          );
        } else if (
          error.message.includes("Invalid redirect URL") ||
          error.message.includes("redirect")
        ) {
          throw new Error(
            `❌ Redirect URL không hợp lệ.\n\n🔧 Cần thêm vào Google Cloud Console:\n• ${window.location.origin}/auth/callback\n• https://your-project-id.supabase.co/auth/v1/callback`
          );
        } else if (
          error.message.includes("unauthorized") ||
          error.message.includes("client")
        ) {
          throw new Error(
            "❌ Google Client ID hoặc Client Secret không đúng. Vui lòng kiểm tra lại trong Supabase settings."
          );
        } else {
          throw new Error(
            `❌ Google OAuth error: ${
              error.message
            }\n\n🔍 Chi tiết: ${JSON.stringify(error, null, 2)}`
          );
        }
      }

      console.log("🟢 Google OAuth redirect initiated successfully");
      console.log("🟢 OAuth data:", data);

      // OAuth redirect sẽ handle việc authentication
      // Không cần set loading = false ở đây vì sẽ redirect
    } catch (error: any) {
      console.error("🔴 Google login failed:", error);
      setLoading(false);
      throw new Error(
        error.message ||
          "❌ Đăng nhập Google thất bại. Vui lòng kiểm tra cấu hình Supabase."
      );
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: {
    name?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    occupation?: string;
    learning_goal?: string;
    language_level?: string;
  }) => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        full_name: data.name,
        avatar_url: data.avatar_url,
        bio: data.bio,
        phone: data.phone,
        birth_date: data.birth_date,
        gender: data.gender,
        address: data.address,
        city: data.city,
        country: data.country,
        occupation: data.occupation,
        learning_goal: data.learning_goal,
        language_level: data.language_level,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const updatedUser = {
      ...user,
      name: data.name || user.name,
      bio: data.bio || user.bio,
      phone: data.phone || user.phone,
      birth_date: data.birth_date || user.birth_date,
      gender: data.gender || user.gender,
      address: data.address || user.address,
      city: data.city || user.city,
      country: data.country || user.country,
      occupation: data.occupation || user.occupation,
      learning_goal: data.learning_goal || user.learning_goal,
      language_level: data.language_level || user.language_level,
      user_metadata: {
        ...user.user_metadata,
        full_name: data.name || user.user_metadata?.full_name,
        avatar_url: data.avatar_url || user.user_metadata?.avatar_url,
        bio: data.bio || user.user_metadata?.bio,
        phone: data.phone || user.user_metadata?.phone,
        birth_date: data.birth_date || user.user_metadata?.birth_date,
        gender: data.gender || user.user_metadata?.gender,
        address: data.address || user.user_metadata?.address,
        city: data.city || user.user_metadata?.city,
        country: data.country || user.user_metadata?.country,
        occupation: data.occupation || user.user_metadata?.occupation,
        learning_goal: data.learning_goal || user.user_metadata?.learning_goal,
        language_level: data.language_level || user.user_metadata?.language_level,
      },
    };
    setUser(updatedUser);
  };

  function generateAvatarPlaceholder(name: string): string {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "U")
      .join("");
    const colors = [
      "#6366F1",
      "#0EA5E9",
      "#10B981",
      "#F59E0B",
      "#EC4899",
      "#8B5CF6",
      "#14B8A6",
    ];
    const hash = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    const bg = colors[hash % colors.length];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='128' height='128' rx='16' fill='${bg}' />
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Arial' font-size='56' fill='white' font-weight='600'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(
      unescape(encodeURIComponent(svg))
    )}`;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
