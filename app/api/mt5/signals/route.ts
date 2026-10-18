import { NextRequest, NextResponse } from "next/server";
import { generateLiveSMCSignals } from "@/lib/smc-signals";

export async function GET(req: NextRequest) {
  try {
    const licenseKey = req.headers.get("x-license-key");
    if (!licenseKey) {
      return NextResponse.json({ error: "Missing x-license-key header" }, { status: 401 });
    }

    const liveSignals = generateLiveSMCSignals();
    return NextResponse.json(liveSignals, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate signals" }, { status: 500 });
  }
}
