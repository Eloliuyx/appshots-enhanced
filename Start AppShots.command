#!/bin/zsh

set -e

cd -- "$(dirname -- "$0")"

if curl --silent --fail http://127.0.0.1:5173/ >/dev/null 2>&1; then
  open http://127.0.0.1:5173/
  exit 0
fi

if [[ ! -d node_modules ]]; then
  npm install --no-package-lock --legacy-peer-deps
fi

npm run dev -- --host 127.0.0.1 --strictPort &
appshots_server_pid=$!

cleanup() {
  kill "$appshots_server_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

for attempt in {1..80}; do
  if curl --silent --fail http://127.0.0.1:5173/ >/dev/null 2>&1; then
    open http://127.0.0.1:5173/
    wait "$appshots_server_pid"
    exit $?
  fi
  sleep 0.25
done

echo "AppShots did not start. Leave this window open and check the error above."
wait "$appshots_server_pid"
