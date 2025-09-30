"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Users,
  Gamepad2,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", label: "Trang chủ", icon: BookOpen },
  { href: "/oxford", label: "3000 từ Oxford", icon: BookOpen },
  { href: "/topics", label: "Học theo chủ đề", icon: Users },
  { href: "/custom", label: "Tự custom", icon: Settings },
  { href: "/games", label: "Game từ vựng", icon: Gamepad2 },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-slate-100">
                VocabApp
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
                      : "text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.avatar || "/placeholder-user.jpg"}
                      />
                      <AvatarFallback>
                        {(user.name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100 max-w-[120px] truncate">
                        {user.name || user.email}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400 max-w-[120px] truncate">
                        {user.email}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg"
                >
                  <DropdownMenuLabel className="text-gray-900 dark:text-slate-100">
                    Tài khoản
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                    >
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                    >
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <User className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-slate-300"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-blue-600 dark:bg-blue-500 text-white"
                        : "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                {user ? (
                  <div className="px-3 py-3 flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={user.avatar || "/placeholder-user.jpg"}
                      />
                      <AvatarFallback>
                        {(user.name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight truncate text-gray-900 dark:text-slate-100">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button size="sm" variant="outline">
                            Hồ sơ
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => signOut()}
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button className="mx-3 bg-blue-600 hover:bg-blue-700 text-white">
                      <User className="w-4 h-4 mr-2" />
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
