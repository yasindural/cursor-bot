from flask import Flask, request, jsonify
from flask_cors import CORS
from decimal import Decimal
import threading, time, os, requests, hmac, hashlib
from urllib.parse import urlencode

# === Flask Uygulaması ===
app = Flask(__name__)
CORS(app)

BINANCE_API_KEY = os.getenv("BINANCE_API_KEY")
BINANCE_API_SECRET = os.getenv("BINANCE_API_SECRET")
BASE_URL = "https://fapi.binance.com"

session = requests.Session()
session.headers.update({"X-MBX-APIKEY": BINANCE_API_KEY})

config = {
    "SL_PERCENT": -20,
    "TP_PERCENT": 30
}

open_positions = {}  # eklendi

# === Binance Signature ===
def _sign(params):
    query = urlencode(params)
    signature = hmac.new(BINANCE_API_SECRET.encode(), query.encode(), hashlib.sha256).hexdigest()
    params["signature"] = signature
    return params

# === Market Order Gönder ===
def place_market_order(symbol, side, quantity):
    params = {
        "symbol": symbol,
        "side": side,
        "type": "MARKET",
        "quantity": quantity,
        "timestamp": int(time.time() * 1000)
    }
    signed = _sign(params)
    r = session.post(f"{BASE_URL}/fapi/v1/order", params=signed)
    print("[ORDER]", r.status_code, r.text)
    return r.json()

@app.route("/")
def home():
    return jsonify({"status": "Backend live 🚀", "config": config})

@app.route("/api/config", methods=["GET", "POST"])
def update_config():
    global config
    if request.method == "POST":
        data = request.get_json(force=True) or {}
        for key in config.keys():
            if key in data:
                config[key] = float(data[key])
        return jsonify({"status": "ok", "config": config})
    return jsonify(config)

@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json(force=True, silent=True) or {}
    ticker = str(data.get("ticker", "")).upper()
    direction = str(data.get("dir", "")).upper()
    entry = Decimal(str(data.get("entry", "0")))
    if not ticker or direction not in ("LONG", "SHORT"):
        return jsonify({"error": "invalid payload", "data": data}), 400

    side = "BUY" if direction == "LONG" else "SELL"
    qty = 0.001  # Test miktar
    print(f"[ALARM] {ticker} {direction} entry={entry}")
    res = place_market_order(ticker, side, qty)
    open_positions[ticker] = {"symbol": ticker, "direction": direction, "entry": float(entry), "result": res}
    return jsonify({"status": "order_sent", "symbol": ticker, "side": side, "result": res})

# === Take Profit (%10 ROI) Takip Sistemi ===
def watch_for_take_profit(symbol, position_side, leverage, entry_price):
    time.sleep(3)
    while True:
        try:
            pos = get_position_risk(symbol, position_side)
            amt = Decimal(pos.get("positionAmt", "0"))
            if amt == 0:
                print(f"[TP] {symbol}:{position_side} kapandı")
                return
            mark_price = _decimal(pos.get("markPrice", get_price(symbol)))
            direction = 1 if position_side.upper() == "LONG" else -1
            pnl = (mark_price - entry_price) * direction * abs(amt)
            margin = (entry_price * abs(amt)) / leverage
            roi = (pnl / margin) * 100 if margin > 0 else Decimal("0")
            if roi >= 10:
                print(f"[TP HIT] {symbol}:{position_side} ROI={roi:.2f}% — Pozisyon kapatılıyor")
                _close_position_market(symbol, position_side, abs(amt))
                return
        except Exception as e:
            print(f"[TP ERROR] {symbol}:{position_side} {e}")
        time.sleep(3)

# === Status ve Open Positions Endpointleri ===
@app.route("/api/status", methods=["GET"])
def api_status():
    uptime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(os.path.getmtime(__file__)))
    last_signal = open_positions[list(open_positions.keys())[-1]] if open_positions else {}
    return jsonify({
        "status": "Backend live 🚀",
        "open_positions_count": len(open_positions),
        "last_signal": last_signal,
        "uptime": uptime,
        "config": config
    })

@app.route("/api/open-positions", methods=["GET"])
def api_open_positions():
    return jsonify({
        "count": len(open_positions),
        "positions": open_positions
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
