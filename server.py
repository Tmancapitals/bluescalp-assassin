import MetaTrader5 as mt5
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="BlueScalp MT5 Bridge")
BRIDGE_API_KEY = "BSA_SECURE_BRIDGE_2026"

def verify_token(x_bridge_token: Optional[str]):
    if x_bridge_token != BRIDGE_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized bridge access")

class TradeRequest(BaseModel):
    symbol: str
    action: str
    volume: float = 0.01
    sl: Optional[float] = None
    tp: Optional[float] = None
    comment: Optional[str] = "BlueScalp MachineGunner"

@app.on_event("startup")
def startup():
    if not mt5.initialize():
        print(f"MT5 init failed: {mt5.last_error()}")
    else:
        acc = mt5.account_info()
        print(f"Connected to MT5 Account: {acc.login if acc else 'Unknown'}")

@app.get("/status")
def get_status(x_bridge_token: Optional[str] = Header(None)):
    verify_token(x_bridge_token)
    if not mt5.initialize():
        return {"status": "offline", "error": str(mt5.last_error())}
    acc = mt5.account_info()
    if not acc:
        return {"status": "error", "error": "No account logged in"}
    return {
        "status": "connected",
        "login": acc.login,
        "server": acc.server,
        "balance": acc.balance,
        "equity": acc.equity,
        "currency": acc.currency
    }

@app.get("/quote/{symbol}")
def get_quote(symbol: str, x_bridge_token: Optional[str] = Header(None)):
    verify_token(x_bridge_token)
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        return {"error": f"Symbol {symbol} not found"}
    return {"symbol": symbol, "bid": tick.bid, "ask": tick.ask, "last": tick.last, "time": tick.time}

@app.post("/trade")
def execute_trade(req: TradeRequest, x_bridge_token: Optional[str] = Header(None)):
    verify_token(x_bridge_token)
    order_type = mt5.ORDER_TYPE_BUY if req.action.upper() == "BUY" else mt5.ORDER_TYPE_SELL
    tick = mt5.symbol_info_tick(req.symbol)
    if not tick:
        raise HTTPException(status_code=400, detail=f"Cannot fetch price for {req.symbol}")
    price = tick.ask if req.action.upper() == "BUY" else tick.bid
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": req.symbol,
        "volume": float(req.volume),
        "type": order_type,
        "price": price,
        "deviation": 20,
        "magic": 20261021,
        "comment": req.comment,
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    if req.sl: request["sl"] = float(req.sl)
    if req.tp: request["tp"] = float(req.tp)
    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        return {"success": False, "retcode": result.retcode, "comment": result.comment}
    return {"success": True, "order": result.order, "volume": result.volume, "price": result.price}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
