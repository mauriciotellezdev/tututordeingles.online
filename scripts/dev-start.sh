#!/usr/bin/env bash
set -euo pipefail

# Dev starter: frees port 7777, kills leftover caddy, starts Next.js dev on port 7777, then starts Caddy.
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=7777

echo "Freeing port ${PORT} if necessary..."
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN || true)
else
  PIDS=$(ss -ltnp "sport = :${PORT}" 2>/dev/null | awk -F',' '/users:/{print $2}' | awk '{print $2}' | tr '\n' ' ' || true)
fi
if [ -n "$PIDS" ]; then
  echo "Killing PIDs listening on ${PORT}: $PIDS"
  for pid in $PIDS; do
    kill -9 "$pid" || true
  done
fi

# Kill any user-owned caddy processes to free ports 80/443
if command -v pgrep >/dev/null 2>&1; then
  CADDY_PIDS=$(pgrep -u "$USER" -x caddy || true)
  if [ -n "$CADDY_PIDS" ]; then
    echo "Killing existing caddy PIDs: $CADDY_PIDS"
    for pid in $CADDY_PIDS; do
      kill -9 "$pid" || true
    done
  fi
fi

# Start Next dev on the chosen port (background)
echo "Starting Next dev on port ${PORT} (logs -> /tmp/next-dev.log)"
# Use npx to ensure local next binary is used
npx next dev -p ${PORT} > /tmp/next-dev.log 2>&1 &
NEXT_PID=$!
sleep 1

echo "Next dev started with PID ${NEXT_PID}."

# Start Caddy (will run in foreground and hold the terminal). If you want both in background, run dev-start.sh with nohup.
echo "Starting Caddy (this will remain in foreground)."
# Ensure start-caddy.sh is executable
chmod +x "$REPO_ROOT/scripts/start-caddy.sh" || true
exec "$REPO_ROOT/scripts/start-caddy.sh"
