#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs

rm -rf .cache || true
rm -rf tmp/context || true

: > logs/session.log
echo "$(date -Iseconds) RESET_CONTEXT by $(whoami)" >> logs/audit.log

echo "Context window reset completed."
