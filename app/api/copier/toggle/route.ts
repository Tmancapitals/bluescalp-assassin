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

    const payload = {
      account_number: String(accountNumber),
      broker_server: String(brokerServer),
      broker_password: String(brokerPassword || ""),
      lot_size: parseFloat(lotSize) || 0.01,
      is_active: Boolean(isActive),
      license_key: String(licenseKey),
    };

    // Check if account already exists
    const { data: existing } = await supabase
      .from("copier_clients")
      .select("id")
      .eq("account_number", String(accountNumber))
      .maybeSingle();

    let result;
    if (existing && existing.id) {
      result = await supabase
        .from("copier_clients")
        .update(payload)
        .eq("account_number", String(accountNumber))
        .select();
    } else {
      result = await supabase
        .from("copier_clients")
        .insert(payload)
        .select();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
