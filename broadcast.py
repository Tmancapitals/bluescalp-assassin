import time
import MetaTrader5 as mt5
from supabase import create_client

SUPABASE_URL = "https://npscoqtxebqcgunlxpwm.supabase.co"
SUPABASE_KEY = "sb_publishable_-4GBYEsoy5CKv8Z33RWUYQ_bhSC1DMe"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def init_mt5():
    if not mt5.initialize():
        print(f"MT5 failed: {mt5.last_error()}")
        return False
    acc = mt5.account_info()
    if acc:
        print(f"Connected: {acc.login} ({acc.server})")
        return True
    return False

def sync_trades():
    if not init_mt5():
        return
    print("BlueScalp broadcaster running...")
    known = set()
    while True:
        try:
            pos = mt5.positions_get()
            current = set()
            if pos:
                for p in pos:
                    current.add(p.ticket)
                    ttype = "BUY" if p.type == mt5.ORDER_TYPE_BUY else "SELL"
                    d = {
                        "ticket": p.ticket,
                        "symbol": p.symbol,
                        "type": ttype,
                        "lot_size": float(p.volume),
                        "open_price": float(p.price_open),
                        "sl": float(p.sl),
                        "tp": float(p.tp),
                        "profit": float(p.profit),
                        "status": "OPEN",
                    }
                    supabase.table("signals").upsert(d, on_conflict="ticket").execute()
                    if p.ticket not in known:
                        print(f"[NEW] {ttype} {p.symbol} @ {p.price_open}")
            for c in (known - current):
                supabase.table("signals").update({"status": "CLOSED"}).eq("ticket", c).execute()
                print(f"[CLOSED] {c}")
            known = current
        except Exception as e:
            print("Error:", e)
        time.sleep(2)

if __name__ == "__main__":
    sync_trades()
