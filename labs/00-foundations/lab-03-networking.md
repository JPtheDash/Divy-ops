# Lab 03 — Networking for the Cloud

**Week 3 · ~8 hours**

## Objective

Learn the networking you need to design AWS VPCs and debug connectivity — the
single most common thing that breaks in cloud infrastructure. Especially CIDR and
subnetting, because in Phase 1 you'll carve up a network by hand.

## Setup

```bash
docker run --rm -it --name net-lab ubuntu:22.04 bash
apt-get update && apt-get install -y iproute2 dnsutils iputils-ping curl netcat-openbsd python3
```

---

## Part A — IP addressing & CIDR (2h) — the important one

An IP like `10.0.5.23` is 32 bits. CIDR notation `10.0.0.0/16` means "the first 16
bits are the network, the rest is host space."

- `/16` → 16 network bits, 16 host bits → 65,536 addresses (`10.0.0.0`–`10.0.255.255`)
- `/24` → 24 network bits, 8 host bits → 256 addresses
- `/28` → 4 host bits → 16 addresses

The rule: **bigger number = smaller network.** Each `+1` to the prefix halves the size.

Practice the math you'll do when designing a VPC. A VPC of `10.0.0.0/16` split
into four `/18` subnets:

| Subnet | CIDR | Range | Use |
|---|---|---|---|
| Public A | 10.0.0.0/18 | 10.0.0.0–10.0.63.255 | Public (web) AZ-a |
| Public B | 10.0.64.0/18 | 10.0.64.0–10.0.127.255 | Public (web) AZ-b |
| Private A | 10.0.128.0/18 | 10.0.128.0–10.0.191.255 | Private (db) AZ-a |
| Private B | 10.0.192.0/18 | 10.0.192.0–10.0.255.255 | Private (db) AZ-b |

Check yourself with a tool:

```bash
python3 - <<'PY'
import ipaddress
vpc = ipaddress.ip_network("10.0.0.0/16")
print("VPC:", vpc, "hosts:", vpc.num_addresses)
for i, sub in enumerate(vpc.subnets(new_prefix=18)):
    print(f"  subnet {i}: {sub}  ({sub.num_addresses} addrs)  range {sub[0]}–{sub[-1]}")
PY
```

**Why this matters:** in AWS you allocate a VPC CIDR, then subnets inside it, one
per availability zone, split into public (internet-facing) and private (databases).
Get the math wrong and subnets overlap or run out of addresses. This lab is here so
Phase 1 Lab 2 isn't a mystery.

---

## Part B — Ports, TCP, and testing connectivity (90 min)

```bash
# what's listening?
ss -tlnp 2>/dev/null || netstat -tln

# start a tiny server on port 8000, then connect to it
python3 -m http.server 8000 &
sleep 1
curl -s http://localhost:8000/ | head -5
nc -zv localhost 8000          # is the port open? (connectivity test)
nc -zv localhost 9999          # closed port — see the difference
kill %1
```

Ports you'll memorize: 22 SSH, 80 HTTP, 443 HTTPS, 3306 MySQL, 5432 Postgres,
6379 Redis. Security groups in AWS are essentially "which ports are open, from where."

---

## Part C — DNS end to end (90 min)

```bash
dig +short example.com          # the IP
dig example.com                 # full answer, note the TTL
dig +trace example.com | tail -20   # walk root → TLD → authoritative
dig example.com NS              # who's authoritative for this domain
dig example.com MX              # mail servers

cat /etc/resolv.conf            # which DNS resolver this box uses
cat /etc/hosts                  # local overrides (beat DNS)
```

DNS is behind more "it's not working" incidents than anything else. In AWS, Route 53
is DNS; understanding records (A, CNAME, ALIAS) and TTLs will save you repeatedly.

---

## Part D — HTTP, TLS, and load balancing concepts (2h)

```bash
# inspect a full HTTP exchange
curl -v https://example.com 2>&1 | head -40

# just headers; note status, server, caching, security headers
curl -sI https://example.com

# see the TLS certificate chain
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

Concepts to read and be able to explain (you'll configure all of these in AWS):
- **Load balancer** — spreads traffic across multiple servers; the AWS ALB does
  this at layer 7 (HTTP), the NLB at layer 4 (TCP).
- **Health checks** — the LB stops sending traffic to instances that fail a check.
  This is how AWS achieves self-healing.
- **Public vs private** — web servers in public subnets, databases in private ones
  reachable only from inside the VPC.
- **Security group vs NACL** — SG is a stateful per-instance firewall (return
  traffic auto-allowed); NACL is a stateless per-subnet firewall.

---

## Prove it

Save to `evidence/`:

1. `lab03-subnets.txt` — output of the Python subnet-splitting script
2. `lab03-dns.txt` — `dig +trace` output for a domain
3. `lab03-answers.md`:
   - How many usable addresses in a `/24`? In a `/28`? Show your reasoning.
   - You have VPC `10.0.0.0/16`. Design 6 subnets (3 AZs × public/private). List their CIDRs with no overlaps.
   - Explain the difference between a security group and a NACL, and give one scenario where the stateful-vs-stateless distinction matters.
   - Where do you put a database — public or private subnet — and how does the web tier reach it?

## Phase 0 complete when
You can subnet a VPC on paper, SSH with keys and a config file, write an idempotent
bash script, and trace a request through DNS + TLS. That's the foundation Phase 1
builds directly on top of.

## Going deeper (optional)
- `traceroute` / `mtr` — see the path packets take
- Read about IPv6 in AWS VPCs
- Set up an actual reverse proxy with nginx in front of your `http.server`
