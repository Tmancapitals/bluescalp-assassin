import { NextRequest, NextResponse } from "next/server";
import { getLiveSMCSignals } from "@/lib/smc-signals";

export async function GET(req: NextRequest) {
  const licenseKey = req.headers.get("x-license-key");
  if (!licenseKey) {
    return NextResponse.json({ error: "Missing x-license-key header" }, { status: 401 });
  }

  try {
    const signals = await getLiveSMCSignals();
    return NextResponse.json(signals, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=30"
      }
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate live signals" }, { status: 500 });
  }
}
