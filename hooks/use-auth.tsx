"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "email" | "google";
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
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

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
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
      provider:
        supabaseUser.app_metadata?.provider === "google" ? "google" : "email",
      createdAt: new Date(supabaseUser.created_at || Date.now()),
    };
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
    } catch (error: any) {
      throw new Error(error.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        full_name: data.name,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const updatedUser = { ...user, ...data };
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
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
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
