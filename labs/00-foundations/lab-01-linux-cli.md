# Lab 01 — Linux & the Command Line

**Week 1 · ~8 hours**

## Objective

Become genuinely comfortable in a Linux shell — the environment you'll operate
every server, container, and pipeline in. By the end you can navigate, manage
processes and services, use SSH properly, and chain text tools together.

## Setup

Work inside a throwaway Ubuntu container so you get a real Linux userland and
nothing touches your Mac.

```bash
docker run --rm -it --name linux-lab ubuntu:22.04 bash
# inside:
apt-get update && apt-get install -y sudo vim curl wget openssh-client iproute2 procps jq
```

Keep this shell open for the lab.

---

## Part A — Filesystem & navigation (45 min)

```bash
pwd; ls -la /; cd /etc; ls
cat /etc/os-release          # what OS am I on?
tree -L 1 / 2>/dev/null || ls -l /
```

Learn the map: `/etc` config, `/var/log` logs, `/home` users, `/usr/bin` programs,
`/tmp` scratch. You'll reach for these constantly on servers.

```bash
cd /tmp && mkdir -p project/{src,logs,config} && cd project
touch src/app.py config/settings.yaml logs/app.log
find . -type f                # list everything
find . -name '*.log'          # find by pattern
du -sh .                      # how big is this?
```

---

## Part B — Permissions, users, SSH (90 min)

Permissions in one line: `rwx` for owner / group / other; `r=4 w=2 x=1`.

```bash
ls -l src/app.py              # e.g. -rw-r--r--
chmod 600 config/settings.yaml && ls -l config/settings.yaml   # owner-only (secrets)
chmod +x src/app.py && ls -l src/app.py                        # make executable
```

Users and sudo:

```bash
useradd -m -s /bin/bash deploy
id deploy
su - deploy -c 'whoami && echo "running as deploy"'
```

**SSH keys** — this is how you'll log into every EC2 instance. Generate a keypair:

```bash
ssh-keygen -t ed25519 -C "devops-lab" -f ~/.ssh/lab_key -N ""
cat ~/.ssh/lab_key.pub        # the PUBLIC key — goes ON the server
ls -l ~/.ssh/lab_key          # the PRIVATE key — stays with you, mode 600
```

The model to internalize: your **public** key goes into the server's
`~/.ssh/authorized_keys`; your **private** key never leaves your machine. That's
exactly how AWS EC2 key pairs work. Set up an SSH config entry (you'll use these):

```bash
mkdir -p ~/.ssh && cat >> ~/.ssh/config <<'EOF'
Host webserver
    HostName 203.0.113.10
    User ubuntu
    IdentityFile ~/.ssh/lab_key
EOF
cat ~/.ssh/config
# now `ssh webserver` would use all those settings (host is a placeholder here)
```

---

## Part C — Processes & services (75 min)

```bash
sleep 300 &                   # background job
jobs; ps aux | head
top -bn1 | head -15           # snapshot of running processes
kill %1                       # stop the sleep

# signals: TERM (graceful, 15) vs KILL (forced, 9)
sleep 300 & PID=$!
kill -TERM $PID               # ask nicely
```

**Why signals matter for DevOps:** containers and orchestrators stop your app by
sending `SIGTERM`, then `SIGKILL` after a grace period. Apps that ignore `SIGTERM`
get hard-killed and lose in-flight work. You'll design for this in Phase 2.

systemd (services) — on a container it's limited, so just learn the commands
you'll use on real servers:

```
systemctl status nginx        # is it running?
systemctl start/stop/restart nginx
systemctl enable nginx        # start on boot
journalctl -u nginx --since "10 min ago"   # its logs
```

---

## Part D — Text processing & pipes (90 min)

This is the DevOps daily bread — slicing logs, extracting fields, transforming data.

```bash
# make a sample log
cat > /tmp/access.log <<'EOF'
200 GET /home 34ms
404 GET /missing 12ms
200 POST /api/login 120ms
500 GET /api/data 890ms
200 GET /home 28ms
503 GET /api/data 45ms
EOF

# grep: find lines
grep " 500 \| 503 " /tmp/access.log      # server errors
grep -c "200" /tmp/access.log            # count successes

# awk: columns
awk '{print $2, $3}' /tmp/access.log     # method + path
awk '$1 >= 500 {print}' /tmp/access.log  # error responses

# sort | uniq: frequencies
awk '{print $1}' /tmp/access.log | sort | uniq -c | sort -rn   # status code counts

# sed: substitute
sed 's/GET/READ/g' /tmp/access.log | head -3

# jq: JSON (you'll use this constantly with AWS CLI output)
echo '{"instances":[{"id":"i-123","state":"running"},{"id":"i-456","state":"stopped"}]}' \
  | jq '.instances[] | select(.state=="running") | .id'
```

The pipe philosophy: small tools, each doing one thing, composed with `|`. AWS
CLI returns JSON — `aws ... | jq ...` will be muscle memory by Phase 1.

---

## Part E — Environment & PATH (30 min)

```bash
echo $PATH                     # where the shell looks for commands
which ls; which python3
export MY_VAR="hello"; echo $MY_VAR
env | grep MY_VAR

# a variable only lives in this shell unless exported / put in a profile
echo 'export DEPLOY_ENV=dev' >> ~/.bashrc
```

Environment variables are how you configure apps and pass secrets in CI/CD and
containers. Note: env vars are visible to the process and often to logs — never
the place for real production secrets (Phase 4 covers proper secret handling).

---

## Prove it

Save to `evidence/`:

1. `lab01-status-counts.txt` — output of the `status code counts` awk pipeline
2. `lab01-ssh.txt` — your `~/.ssh/config` entry and the public key (public key is safe to share; never share the private one)
3. `lab01-answers.md`:
   - Explain the difference between `SIGTERM` and `SIGKILL` and why it matters for a containerized app.
   - In SSH key auth, which key goes on the server and which stays with you? What breaks if you swap them?
   - Write a one-line pipeline that prints the 3 slowest requests from `/tmp/access.log`. (Hint: strip `ms`, sort numerically.)

## Going deeper (optional)
- `tmux` — persistent terminal sessions (essential when SSH'd into servers)
- `rsync` over SSH — how deploys and backups move files
- Write your first bash script that tails a log and counts errors
