import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      symbol = "XAUUSD",
      type = "BUY",
      entry = "2650.00",
      sl = "2642.00",
      tp1 = "2658.00",
      tp2 = "2668.00",
      notes = "Liquidity sweep confirmed. Machine Gunner execution active.",
    } = body;

    const actionEmoji = type.toUpperCase() === "BUY" ? "🟢" : "🔴";

    const text = `
🎯 <b>BLUESCALP ASSASSIN V1.0 SIGNAL</b>
<i>Powered by Tman Capitals</i>
━━━━━━━━━━━━━━━━━━━━
${actionEmoji} <b>ACTION:</b> ${type.toUpperCase()} ${symbol}
📊 <b>ENTRY:</b> <code>${entry}</code>
🛡️ <b>STOP LOSS:</b> <code>${sl}</code>
🎯 <b>TP 1:</b> <code>${tp1}</code>
🎯 <b>TP 2:</b> <code>${tp2}</code>
━━━━━━━━━━━━━━━━━━━━
💡 <b>CONFLUENCE:</b> ${notes}
⏱️ <b>SESSION:</b> SAST / London & NY
📱 <i>Executed from BlueScalp Robot App</i>
`.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 400 });
    }

    return NextResponse.json({ success: true, message_id: data.result.message_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to broadcast" }, { status: 500 });
  }
}
