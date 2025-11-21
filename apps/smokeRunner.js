#!/usr/bin/env node

const DEFAULT_URL = "http://localhost:5000/api/smoke-test";
const SMOKE_URL = process.env.SMOKE_TEST_URL || DEFAULT_URL;
const TIMEOUT_MS = 10000;

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(msg, color = "reset") {
  console.log(colors[color] + msg + colors.reset);
}

async function run() {
  log(`\n🧪 Smoke test starting`, "cyan");
  log(`📡 Target: ${SMOKE_URL}`, "cyan");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SMOKE_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      log(`❌ HTTP ${res.status} ${res.statusText}`, "red");
      const text = await res.text();
      log(text.slice(0, 300), "yellow");
      process.exit(1);
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      log("❌ Failed to parse JSON", "red");
      log(e.message, "yellow");
      process.exit(1);
    }

    const summary = data.summary;
    if (!summary) {
      log("⚠️ No summary in response, printing raw JSON:", "yellow");
      console.log(JSON.stringify(data, null, 2).slice(0, 800));
      process.exit(0);
    }

    log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
    log("📊 SMOKE TEST RESULTS", "bold");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
    log(`Total Tests:    ${summary.total}`, "cyan");
    log(`✅ Passed:      ${summary.passed}`, "green");
    log(`❌ Failed:      ${summary.failed}`, summary.failed > 0 ? "red" : "cyan");
    log(`Pass Rate:      ${summary.passRate}`, summary.failed === 0 ? "green" : "yellow");
    log(
      `Overall:        ${summary.overallStatus}`,
      summary.overallStatus === "ALL_PASS" ? "green" : "red"
    );
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

    if (Array.isArray(data.failures) && data.failures.length > 0) {
      log("🔍 Failures:", "red");
      data.failures.forEach((f, i) => {
        log(`${i + 1}. ${f.test || "unknown"} - ${f.error || "no error message"}`, "yellow");
      });
    }

    if (summary.failed > 0) {
      log(`💥 FAILED (${summary.failed} test)`, "red");
      process.exit(1);
    } else {
      log("✨ ALL TESTS PASSED", "green");
      process.exit(0);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      log(`❌ Timeout after ${TIMEOUT_MS / 1000}s`, "red");
    } else {
      log("❌ Request failed", "red");
      log(err.message, "yellow");
    }
    process.exit(1);
  }
}

run();