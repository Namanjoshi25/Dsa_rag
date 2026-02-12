// Proxies /api/auth/me → backend /api/v1/auth/me so middleware and client can hit same origin.
// Uses BACKEND_URL in Docker (e.g. http://backend:8000); locally defaults to http://localhost:8000.
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: Request) {
  const upstream = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  const body = await upstream.json();
  return new NextResponse(JSON.stringify(body), {
    status: upstream.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
