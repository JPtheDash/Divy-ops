#!/usr/bin/env bash
# Cross-platform launcher (Linux, macOS, WSL, Codespaces).
# Windows users: run `python -m http.server 8778` in this folder, then open the URL.
cd "$(dirname "$0")"

# rebuild content bundle if node is available (optional — content.js is committed)
if command -v node >/dev/null 2>&1; then
  echo "Rebuilding content bundle..."
  node build-content.js
fi

PORT="${PORT:-8778}"
URL="http://localhost:$PORT/"
echo "Serving the DevOps + AWS learning app at $URL"
echo "Leave this running. Press Ctrl+C to stop."

# try to open a browser (best-effort; harmless if it fails, e.g. in Codespaces)
( sleep 1
  if command -v open >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  fi ) >/dev/null 2>&1 &

# python3 or python
if command -v python3 >/dev/null 2>&1; then python3 -m http.server "$PORT"
else python -m http.server "$PORT"; fi
