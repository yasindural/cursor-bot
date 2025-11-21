#!/usr/bin/env bash
# Smoke Test Runner Shell Script

set -euo pipefail

# Help mode
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Usage:"
    echo "  cd apps"
    echo "  ./run-smoke-test.sh"
    echo ""
    echo "Optional:"
    echo "  SMOKE_TEST_URL=\"https://your-domain.com/api/smoke-test\" ./run-smoke-test.sh"
    echo ""
    echo "Environment variables:"
    echo "  SMOKE_TEST_URL - Override default smoke test endpoint"
    exit 0
fi

# Script directory → /apps
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Running smoke tests via Node CLI"

if [[ -n "${SMOKE_TEST_URL:-}" ]]; then
    echo "Target: $SMOKE_TEST_URL"
fi

node smokeRunner.js

# Usage:
#   cd apps
#   ./run-smoke-test.sh
# Optional:
#   SMOKE_TEST_URL="https://your-domain.com/api/smoke-test" ./run-smoke-test.sh

