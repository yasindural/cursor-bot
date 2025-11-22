from flask import Flask, request, jsonify
from flask_cors import CORS
from decimal import Decimal
import threading, time, os, requests

# === Uygulama Başlatma ===
app = Flask(__name__)
CORS(app)

# === Dinamik Ayarlar (Panelde değiştirilebilir) ===
config = {
    "SL_PERCENT": -20,
    "TP_PERCENT": 30,
    "FAST_EMA": 9,
    "SLOW_EMA": 21,
    "RSI_LEN": 14,
    "ADX_LEN": 14,
    "MACD_FAST": 12,
    "MACD_SLOW": 26,
    "MACD_SIGNAL": 9,
}

# === Binance API Bilgileri ===
BINANCE_API_KEY = os.getenv("BINANCE_API_KEY", "")
BINANCE_API_SECRET = os.getenv("BINANCE_API_SECRET", "")
BASE_URL = "https://fapi.binance.com"

session = requests.Session()
if BINANCE_API_KEY:
    session.headers.update({"X-MBX-APIKEY": BINANCE_API_KEY})

# === Basit Pozisyon Takip Sistemi ===
open_positions = {}
lock = threading.Lock()


@app.route("/")
def home():
    return jsonify({"status": "Backend live 🚀", "config": config})


# === Ayar Güncelleme ===
@app.route("/api/config", methods=["GET", "POST"])
def update_config():
    global config
    if request.method == "POST":
        data = request.get_json(force=True) or {}
        for key in config.keys():
            if key in data:
                try:
                    config[key] = float(data[key])
                except:
                    config[key] = data[key]
        return jsonify({"status": "ok", "config": config})
    return jsonify(config)


# === TradingView Webhook ===
@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json(force=True, silent=True) or {}
    ticker = str(data.get("ticker", "")).upper()
    direction = str(data.get("dir", "")).upper()
    entry = Decimal(str(data.get("entry", "0")))
    if not ticker or direction not in ("LONG", "SHORT"):
        return jsonify({"error": "invalid payload", "data": data}), 400

    with lock:
        open_positions[ticker] = {
            "symbol": ticker,
            "direction": direction,
            "entry": float(entry),
            "time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "sl_percent": config["SL_PERCENT"],
            "tp_percent": config["TP_PERCENT"]
        }

    print(f"[SIGNAL] {ticker} {direction} {entry} SL={config['SL_PERCENT']} TP={config['TP_PERCENT']}")
    return jsonify({"status": "ok", "symbol": ticker, "direction": direction, "entry": float(entry)})


# === Basit Pozisyon Görüntüleme ===
@app.route("/api/open-positions")
def positions():
    with lock:
        return jsonify(open_positions)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
