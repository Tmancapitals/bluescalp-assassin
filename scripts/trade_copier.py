import time
import json
import requests
import os
import sys

try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None

API_URL = "https://bluescalp-assassin.vercel.app/api/copier/clients?secret=BLUESCALP-V1-MASTER"
POLL_INTERVAL = 3
COPIED_FILE = r"C:\BlueScalp\copied_tickets.json"

copied_map = {}

def load_copied_map():
    global copied_map
    if os.path.exists(COPIED_FILE):
        try:
            with open(COPIED_FILE, "r") as f:
                copied_map = json.load(f)
        except Exception:
            copied_map = {}

def save_copied_map():
    try:
        with open(COPIED_FILE, "w") as f:
            json.dump(copied_map, f, indent=2)
    except Exception as e:
        print(f"[!] Error saving copied map: {e}")

def fetch_active_clients():
    try:
        res = requests.get(API_URL, timeout=4)
        if res.status_code == 200:
            data = res.json()
            return data.get("clients", [])
    except Exception as e:
        print(f"[!] API fetch error: {e}")
    return []

def resolve_symbol(target_symbol):
    if not mt5:
        return target_symbol
    symbols = mt5.symbols_get()
    if not symbols:
        return target_symbol
    names = [s.name for s in symbols]
    if target_symbol in names:
        return target_symbol
    base = target_symbol.replace(".m", "").replace("_m", "").replace("#", "").upper()
    for name in names:
        if name.upper().startswith(base):
            return name
    return target_symbol

def run():
    print("=" * 55)
    print("   BLUESCALP ASSASSIN - LIVE CLOUD TRADE COPIER")
    print("=" * 55)
    
    if not mt5:
        print("[X] MetaTrader5 package is not available.")
        return

    if not mt5.initialize():
        print(f"[X] MT5 initialize failed: {mt5.last_error()}")
        return

    master_info = mt5.account_info()
    if not master_info:
        print("[X] Could not read master account info. Is MT5 logged in?")
        return

    master_login = master_info.login
    master_server = master_info.server
    print(f"[+] Master Terminal Account: {master_login} ({master_server})")

    load_copied_map()
    print(f"[+] Loaded {len(copied_map)} existing ticket mapping(s).")
    print(f"[+] Monitoring App Gateway: {API_URL[:45]}...")

    last_active_accs = None

    while True:
        try:
            # 1. Fetch active clients from App API
            clients = fetch_active_clients()
            current_active_accs = [str(c.get("account_number")) for c in clients if c.get("is_active")]

            if last_active_accs is None or set(current_active_accs) != set(last_active_accs):
                if current_active_accs:
                    print(f"[*] [APP SYNC] Bot ACTIVE for {len(current_active_accs)} client(s): {current_active_accs}")
                else:
                    print("[*] [APP SYNC] Bot PAUSED in app. No active clients. Waiting for Trade button...")
                last_active_accs = current_active_accs

            # Ensure we are on master account to read positions
            current_info = mt5.account_info()
            if not current_info or current_info.login != master_login:
                mt5.login(master_login)

            master_positions = mt5.positions_get()
            master_tickets = {str(p.ticket): p for p in (master_positions or [])}

            # 2. Check for closed master trades that need closing on clients
            to_remove = []
            for m_ticket_str, client_orders in list(copied_map.items()):
                if m_ticket_str not in master_tickets:
                    print(f"[*] Master trade #{m_ticket_str} closed. Syncing close to clients...")
                    for c_acc, c_data in list(client_orders.items()):
                        c_ticket = c_data.get("ticket") if isinstance(c_data, dict) else c_data
                        c_server = c_data.get("server") if isinstance(c_data, dict) else None
                        c_pwd = c_data.get("password") if isinstance(c_data, dict) else None

                        if not c_pwd or not c_server:
                            for cl in clients:
                                if str(cl.get("account_number")) == str(c_acc):
                                    c_server = cl.get("broker_server")
                                    c_pwd = cl.get("broker_password")
                                    break

                        if c_acc and c_pwd and c_server:
                            mt5.login(login=int(c_acc), password=c_pwd, server=c_server)
                            c_pos = mt5.positions_get(ticket=c_ticket)
                            if c_pos and len(c_pos) > 0:
                                pos = c_pos[0]
                                close_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
                                tick = mt5.symbol_info_tick(pos.symbol)
                                price = tick.bid if close_type == mt5.ORDER_TYPE_SELL else tick.ask
                                req = {
                                    "action": mt5.TRADE_ACTION_DEAL,
                                    "position": c_ticket,
                                    "symbol": pos.symbol,
                                    "volume": pos.volume,
                                    "type": close_type,
                                    "price": price,
                                    "deviation": 20,
                                    "magic": 999111,
                                    "comment": "BSA Copier Close",
                                }
                                res = mt5.order_send(req)
                                if res and res.retcode == mt5.TRADE_RETCODE_DONE:
                                    print(f"    [OK] Closed client {c_acc} position #{c_ticket}")
                                else:
                                    err = res.retcode if res else mt5.last_error()
                                    print(f"    [X] Failed to close client {c_acc} position #{c_ticket}: {err}")
                    to_remove.append(m_ticket_str)

            if to_remove:
                for t in to_remove:
                    copied_map.pop(t, None)
                save_copied_map()
                mt5.login(master_login)

            # 3. Check for new master positions to copy
            if master_positions and current_active_accs:
                for p in master_positions:
                    t_str = str(p.ticket)
                    if t_str not in copied_map:
                        copied_map[t_str] = {}
                        pos_type_str = "BUY" if p.type == mt5.ORDER_TYPE_BUY else "SELL"
                        print(f"\n[!] New master position detected: Ticket #{p.ticket} | {p.symbol} | {pos_type_str} | Lot {p.volume}")

                        for cl in clients:
                            if not cl.get("is_active"):
                                continue

                            c_acc = str(cl.get("account_number"))
                            c_server = cl.get("broker_server")
                            c_pwd = cl.get("broker_password")
                            c_lot = float(cl.get("lot_size", 0.01))

                            if str(c_acc) == str(master_login):
                                print(f"    [*] Skipping master account {c_acc} (same as master)")
                                continue

                            print(f"    [*] Logging in to client {c_acc} ({c_server})...")
                            if not mt5.login(login=int(c_acc), password=c_pwd, server=c_server):
                                print(f"    [X] Login failed for client {c_acc}: {mt5.last_error()}")
                                continue

                            client_sym = resolve_symbol(p.symbol)
                            mt5.symbol_select(client_sym, True)
                            tick = mt5.symbol_info_tick(client_sym)
                            if not tick:
                                print(f"    [X] Could not get tick for symbol {client_sym} on client {c_acc}")
                                continue

                            order_type = p.type
                            price = tick.ask if order_type == mt5.ORDER_TYPE_BUY else tick.bid

                            order_req = {
                                "action": mt5.TRADE_ACTION_DEAL,
                                "symbol": client_sym,
                                "volume": c_lot,
                                "type": order_type,
                                "price": price,
                                "sl": p.sl if p.sl > 0 else 0.0,
                                "tp": p.tp if p.tp > 0 else 0.0,
                                "deviation": 20,
                                "magic": 999111,
                                "comment": "BLUESCALP ASSASSIN V1.0",
                                "type_time": mt5.ORDER_TIME_GTC,
                                "type_filling": mt5.ORDER_FILLING_IOC,
                            }

                            res = mt5.order_send(order_req)
                            if res and res.retcode == mt5.TRADE_RETCODE_DONE:
                                print(f"    [OK] Successfully copied to client {c_acc}! Client Ticket: #{res.order}")
                                copied_map[t_str][c_acc] = {
                                    "ticket": res.order,
                                    "server": c_server,
                                    "password": c_pwd,
                                }
                                save_copied_map()
                            else:
                                err_code = res.retcode if res else mt5.last_error()
                                print(f"    [X] Trade failed on {c_acc} Code: {err_code}")

                        mt5.login(master_login)

        except Exception as e:
            print(f"[!] Copier loop error: {e}")

        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    run()
