// app/api/me/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const upstream = await fetch("http://localhost:8000/api/v1/auth/me", {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  
  const body = await upstream.json();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
       "cache-control": "no-store",
    },
  });
}
