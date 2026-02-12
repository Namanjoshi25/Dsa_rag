import { NextResponse, NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/settings"];
const AUTH_ROUTES = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");

  if (AUTH_ROUTES.includes(pathname)) {
    if (sessionCookie) {
      try {
        const meRes = await fetch(new URL("/api/auth/me", request.url), {
          cache: "no-store",
          headers: { cookie: request.headers.get("cookie") || "" },
        });
        if (meRes.ok) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (err) {
        console.warn("⚠️ Error validating session:", err);
      }
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    try {
      const meRes = await fetch(new URL("/api/auth/me", request.url), {
        cache: "no-store",
        headers: { cookie: request.headers.get("cookie") || "" },
      });
      if (!meRes.ok) {
        const res = NextResponse.redirect(new URL("/signin", request.url));
        if (meRes.status === 401) res.cookies.delete("session");
        return res;
      }
    } catch (err) {
      console.warn("⚠️ Error validating session:", err);
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/signin",
    "/signup",
    "/login",
  ],
};
