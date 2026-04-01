import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes (except login page and API routes).
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const token = request.cookies.get("admin_token")?.value;
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/login";
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};

