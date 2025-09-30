import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Chỉ xử lý auth callback để không can thiệp vào các route khác
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/callback"],
};
