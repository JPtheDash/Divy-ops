# Lab 02 — Git & Scripting

**Week 2 · ~8 hours**

## Objective

Master Git as a collaboration and automation backbone, then learn to script the
boring parts away in bash and Python. Automation is the heart of DevOps —
"if I did it twice by hand, it should be a script" is the reflex you're building.

---

## Part A — Git that goes beyond `add / commit / push` (2h)

```bash
cd /tmp && rm -rf gitlab && mkdir gitlab && cd gitlab && git init
git config user.email you@example.com; git config user.name you
echo "# App" > README.md && git add . && git commit -m "init"
```

Branching and merging:

```bash
git checkout -b feature/login
echo "login code" > login.py && git add . && git commit -m "add login"
git checkout main
git merge feature/login          # fast-forward merge
git log --oneline --graph --all  # visualize history
```

Rebase vs merge — understand the difference:

```bash
git checkout -b feature/signup
echo "signup" > signup.py && git add . && git commit -m "add signup"
git checkout main && echo "hotfix" >> README.md && git add . && git commit -m "hotfix"
git checkout feature/signup
git rebase main                  # replay your commits on top of main — linear history
git log --oneline --graph --all
```

Merge preserves history as it happened (branchy); rebase rewrites it to be linear
(cleaner). Teams pick one. Rule of thumb: never rebase commits you've already pushed
and others may have pulled.

Undo tools every DevOps engineer needs:

```bash
git reflog                       # your safety net — every HEAD you've been at
git reset --soft HEAD~1          # undo last commit, keep changes staged
git revert HEAD --no-edit        # create a new commit that undoes a previous one (safe on shared branches)
```

Tags (you'll tag release versions in pipelines):

```bash
git tag -a v1.0.0 -m "first release"
git tag
```

---

## Part B — Bash scripting (2.5h)

A real script, built up properly. Create `/tmp/setup-env.sh`:

```bash
cat > /tmp/setup-env.sh <<'EOF'
#!/usr/bin/env bash
# Idempotent dev-environment setup. Running it twice does no harm.
set -euo pipefail          # exit on error, undefined var, or failed pipe

WORKDIR="${1:-$HOME/workspace}"    # default arg with fallback
LOG="/tmp/setup.log"

log(){ echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }

ensure_dir(){
  if [ -d "$1" ]; then
    log "dir exists: $1"
  else
    mkdir -p "$1" && log "created: $1"
  fi
}

log "Starting setup in $WORKDIR"
ensure_dir "$WORKDIR"
ensure_dir "$WORKDIR/projects"
ensure_dir "$WORKDIR/logs"

for tool in git curl jq; do
  if command -v "$tool" >/dev/null 2>&1; then
    log "OK: $tool present"
  else
    log "MISSING: $tool"
  fi
done

log "Done."
EOF
chmod +x /tmp/setup-env.sh
/tmp/setup-env.sh
/tmp/setup-env.sh          # run again — note it says "exists", doesn't error
```

Study the pieces:
- `set -euo pipefail` — the single most important line in production bash. It turns
  silent failures into loud ones.
- **Idempotency** — the `ensure_dir` function checks before acting. Run it a hundred
  times, same result. This is *the* DevOps mindset: describe the desired state, and
  make reaching it safe to repeat. It's exactly what Terraform does at scale (Phase 3).
- Functions, default arguments (`${1:-default}`), loops, `command -v` for tool checks.

---

## Part C — Python for automation (2.5h)

Bash is great for gluing commands; Python is better once there's real logic, JSON,
or API calls. You'll use `boto3` (the AWS SDK for Python) heavily later.

```bash
cat > /tmp/log_report.py <<'EOF'
#!/usr/bin/env python3
"""Summarize an access log: counts by status class, slowest requests."""
import sys
from collections import Counter

def parse(path):
    rows = []
    with open(path) as f:
        for line in f:
            parts = line.split()
            if len(parts) >= 3:
                status = int(parts[0])
                ms = int(parts[2].rstrip("ms"))
                rows.append((status, parts[1], ms))
    return rows

def main():
    rows = parse(sys.argv[1] if len(sys.argv) > 1 else "/tmp/access.log")
    classes = Counter(f"{r[0]//100}xx" for r in rows)
    print("By status class:", dict(classes))
    slowest = sorted(rows, key=lambda r: r[2], reverse=True)[:3]
    print("Slowest:")
    for status, path, ms in slowest:
        print(f"  {status} {path} {ms}ms")

if __name__ == "__main__":
    main()
EOF

# reuse the log from Lab 01 (recreate if needed)
cat > /tmp/access.log <<'EOF'
200 GET /home 34ms
404 GET /missing 12ms
200 POST /api/login 120ms
500 GET /api/data 890ms
503 GET /api/data 45ms
EOF

python3 /tmp/log_report.py /tmp/access.log
```

Then a taste of what's coming — Python that calls an API (no AWS account needed):

```bash
cat > /tmp/api_demo.py <<'EOF'
#!/usr/bin/env python3
import urllib.request, json
# a free public API — practice the pattern you'll use for cloud APIs
with urllib.request.urlopen("https://api.github.com/repos/hashicorp/terraform") as r:
    data = json.load(r)
print(f"{data['full_name']}: {data['stargazers_count']:,} stars, {data['open_issues_count']} open issues")
EOF
python3 /tmp/api_demo.py
```

That request/parse/act loop is exactly how `boto3` talks to AWS — you'll swap the
URL for AWS API calls in Phase 1.

---

## Prove it

Save to `evidence/`:

1. `lab02-git-graph.txt` — output of `git log --oneline --graph --all` after your rebase
2. `setup-env.sh` — your idempotent script (copy it here)
3. `lab02-report.txt` — output of the Python log report
4. `lab02-answers.md`:
   - What does `set -euo pipefail` do, and why is it the first line of good bash?
   - Define idempotency in your own words and give an example of a non-idempotent command.
   - When would you reach for Python over bash in automation?

```bash
docker cp linux-lab:/tmp/setup-env.sh ./labs/00-foundations/evidence/ 2>/dev/null || cp /tmp/setup-env.sh ./labs/00-foundations/evidence/
```

## Going deeper (optional)
- `.gitignore`, `git stash`, `git cherry-pick`
- A pre-commit hook that runs a linter (preview of Phase 4)
- Rewrite `setup-env.sh` to also install a tool if missing (real idempotent provisioning)
