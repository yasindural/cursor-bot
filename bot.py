from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS

BOT_VERSION = "PNL_TRAIL_V2"
BASE_DIR = Path(__file__).parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)
CONFIG_FILE = BASE_DIR / "bot_config.json"
USERS_FILE = BASE_DIR / "users.json"

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "https://cursor-futures-bot-panel.onrender.com"]}},
    supports_credentials=True,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOGS_DIR / "bot.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def _load_json(path: Path, default: Any) -> Any:
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as fh:
                return json.load(fh)
        except Exception as exc:
            logger.warning("Failed to load %s: %s", path.name, exc)
    else:
        try:
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(default, fh, indent=2, ensure_ascii=False)
        except Exception as exc:
            logger.error("Failed to initialize %s: %s", path.name, exc)
    return default


def load_config() -> Dict[str, Any]:
    default = {
        "BOT_MARGIN_USDT": 5.0,
        "BOT_LEVERAGE": 20,
        "BOT_DAILY_MAX_LOSS": -100.0,
        "BOT_INITIAL_SL_ROE": -20.0,
    }
    return _load_json(CONFIG_FILE, default)


def load_users() -> List[Dict[str, Any]]:
    default = [
        {
            "username": "admin",
            "role": "admin",
        }
    ]
    return _load_json(USERS_FILE, default)


@app.route("/api/status", methods=["GET"])
def api_status() -> Any:
    return jsonify({"bot_version": BOT_VERSION, "health": "running"})


@app.route("/api/open-positions", methods=["GET"])
def api_open_positions() -> Any:
    return jsonify({"positions": []})


@app.route("/api/pnl/summary", methods=["GET"])
def api_pnl_summary() -> Any:
    return jsonify(
        {
            "status": "ok",
            "daily_realized_pnl": 0,
            "total_realized_pnl": 0,
            "overall_roi": 0,
        }
    )


@app.route("/api/position/close", methods=["POST"])
def api_position_close() -> Any:
    _ = request.get_json(silent=True) or {}
    return jsonify({"status": "ok"})


@app.route("/api/logs", methods=["GET"])
def api_logs() -> Any:
    return jsonify({"logs": []})


@app.route("/api/health", methods=["GET"])
def api_health() -> Any:
    return jsonify({"status": "ok", "health": "running", "bot_version": BOT_VERSION})


def _run_smoke_suite() -> Tuple[Dict[str, Any], List[Dict[str, Any]], Dict[str, Any]]:
    tests: Dict[str, Any] = {}
    failures: List[Dict[str, Any]] = []
    counters = {"total": 0, "passed": 0, "failed": 0}

    def run_test(name: str, func, suggestion: str) -> None:
        counters["total"] += 1
        start = time.perf_counter()
        status = "OK"
        error_message = ""
        details = None

        try:
            result = func()
            if isinstance(result, dict):
                details = result
        except Exception as exc:
            status = "FAIL"
            error_message = str(exc)

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        entry = {"status": status, "duration_ms": duration_ms}
        if details:
            entry["details"] = details
        if status == "FAIL":
            counters["failed"] += 1
            entry["error"] = error_message
            failures.append({"test": name, "error": error_message, "suggestion": suggestion})
        else:
            counters["passed"] += 1
        tests[name] = entry

    run_test("config_loaded", lambda: {"keys": list(load_config().keys())}, "bot_config.json dosyasını doğrula.")
    run_test("users_loaded", lambda: {"count": len(load_users())}, "users.json dosyasını doğrula.")

    def _log_write() -> Dict[str, Any]:
        log_file = LOGS_DIR / "smoke.log"
        with open(log_file, "a", encoding="utf-8") as fh:
            fh.write(f"{datetime.utcnow().isoformat()}Z smoke-check\n")
        return {"log_file": str(log_file)}

    run_test("log_dir_writeable", _log_write, "logs klasörünün yazılabilir olduğundan emin ol.")

    pass_rate = (counters["passed"] / counters["total"] * 100) if counters["total"] else 0.0
    summary = {
        "total": counters["total"],
        "passed": counters["passed"],
        "failed": counters["failed"],
        "passRate": f"{pass_rate:.1f}%",
        "overallStatus": "ALL_PASS" if counters["failed"] == 0 else "SOME_FAIL",
    }
    return tests, failures, summary


@app.route("/api/smoke-test", methods=["GET"])
def api_smoke_test() -> Any:
    tests, failures, summary = _run_smoke_suite()
    payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "tests": tests,
        "summary": summary,
        "failures": failures,
    }
    status_code = 200 if summary["failed"] == 0 else 503
    return jsonify(payload), status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)