import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    url.pathname = "/admin/login";
    url.search = "";

    const res = NextResponse.redirect(url, { status: 303 });
    res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
    return res;
}

