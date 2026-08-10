#!/usr/bin/env bash
# Double-click (or run) to launch the DevOps + AWS learning app.
cd "$(dirname "$0")"
echo "Rebuilding content bundle..."
node build-content.js
PORT=8778
echo "Starting DevOps + AWS Path at http://localhost:$PORT"
echo "Leave this window open while you study. Press Ctrl+C to stop."
( sleep 1 && open "http://localhost:$PORT/" ) &
python3 -m http.server "$PORT"
