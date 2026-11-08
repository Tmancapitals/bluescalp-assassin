import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      accountNumber,
      brokerServer,
      brokerPassword,
      lotSize = "0.01",
      isActive = false,
      licenseKey = "BSA-CLIENT",
    } = body;

    if (!accountNumber || !brokerServer) {
      return NextResponse.json(
        { error: "accountNumber and brokerServer are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("copier_clients")
      .upsert(
        {
          account_number: String(accountNumber),
          broker_server: String(brokerServer),
          broker_password: String(brokerPassword || ""),
          lot_size: parseFloat(lotSize) || 0.01,
          is_active: Boolean(isActive),
          license_key: String(licenseKey),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_number" }
      )
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
