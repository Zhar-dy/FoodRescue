import { NextResponse } from "next/server";

// The unused template source preview must never expose project files.
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
