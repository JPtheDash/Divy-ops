# Lab 02 — EC2 & VPC from Scratch

**Week 5 · ~10 hours**

## Objective

Build a network (VPC) by hand and run a web server (EC2) inside it, reachable from
the internet — the "hello world" of cloud infrastructure. You'll do the whole build
on **LocalStack for free**, then optionally repeat the EC2 part on **real AWS
Free Tier** to see a genuinely reachable server, with full teardown.

This is the Phase 1 gate lab. Take your time.

---

## Part A — Understand the target architecture (20 min)

You're building this:

```
Internet
   │
[Internet Gateway]
   │
┌──────────────────── VPC 10.0.0.0/16 ────────────────────┐
│  ┌── Public subnet 10.0.1.0/24 ──┐                       │
│  │   [EC2 web server]  ← SG allows 22, 80 from you       │
│  └───────────────────────────────┘                       │
│  ┌── Private subnet 10.0.2.0/24 ─┐                       │
│  │   (databases go here — Lab 3) │                       │
│  └───────────────────────────────┘                       │
└──────────────────────────────────────────────────────────┘
```

Recall the CIDR math from Phase 0 Lab 03 — this is where it pays off.

---

## Part B — Build the VPC on LocalStack (3h, free)

```bash
localstack start -d

# 1. the VPC
VPC_ID=$(awslocal ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --query 'Vpc.VpcId' --output text)
echo "VPC: $VPC_ID"

# 2. public + private subnets
PUB_SUBNET=$(awslocal ec2 create-subnet --vpc-id "$VPC_ID" \
  --cidr-block 10.0.1.0/24 --query 'Subnet.SubnetId' --output text)
PRIV_SUBNET=$(awslocal ec2 create-subnet --vpc-id "$VPC_ID" \
  --cidr-block 10.0.2.0/24 --query 'Subnet.SubnetId' --output text)
echo "Public: $PUB_SUBNET  Private: $PRIV_SUBNET"

# 3. internet gateway, attached to the VPC
IGW=$(awslocal ec2 create-internet-gateway \
  --query 'InternetGateway.InternetGatewayId' --output text)
awslocal ec2 attach-internet-gateway --vpc-id "$VPC_ID" --internet-gateway-id "$IGW"

# 4. route table: send internet-bound traffic (0.0.0.0/0) to the IGW
RTB=$(awslocal ec2 create-route-table --vpc-id "$VPC_ID" \
  --query 'RouteTable.RouteTableId' --output text)
awslocal ec2 create-route --route-table-id "$RTB" \
  --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW"
awslocal ec2 associate-route-table --route-table-id "$RTB" --subnet-id "$PUB_SUBNET"
```

What you just built, in plain terms: a private network (VPC), split into a public
room (subnet with a route to the internet gateway) and a private room (no internet
route). The **route table** is what makes a subnet "public" — it has a road
(`0.0.0.0/0`) to the internet gateway. The private subnet doesn't.

---

## Part C — Security group + EC2 instance (2.5h, free on LocalStack)

```bash
# security group: a stateful firewall for the instance
SG=$(awslocal ec2 create-security-group --group-name web-sg \
  --description "web server sg" --vpc-id "$VPC_ID" \
  --query 'GroupId' --output text)

# allow SSH (22) and HTTP (80). On real AWS, restrict 22 to YOUR ip, not 0.0.0.0/0.
awslocal ec2 authorize-security-group-ingress --group-id "$SG" \
  --protocol tcp --port 22 --cidr 0.0.0.0/0
awslocal ec2 authorize-security-group-ingress --group-id "$SG" \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# a key pair (on real AWS this downloads a .pem you SSH with)
awslocal ec2 create-key-pair --key-name lab-key \
  --query 'KeyMaterial' --output text > /tmp/lab-key.pem 2>/dev/null || true

# launch an instance (LocalStack simulates this; AMI id is a placeholder)
INSTANCE=$(awslocal ec2 run-instances --image-id ami-12345678 \
  --instance-type t2.micro --key-name lab-key \
  --security-group-ids "$SG" --subnet-id "$PUB_SUBNET" \
  --query 'Instances[0].InstanceId' --output text)
echo "Instance: $INSTANCE"

awslocal ec2 describe-instances --instance-ids "$INSTANCE" \
  --query 'Reservations[0].Instances[0].{id:InstanceId,type:InstanceType,state:State.Name,subnet:SubnetId}'
```

**Security group vs NACL** (know this cold — it's a classic interview question):
the SG is *stateful* (if you allow inbound 80, the response goes out automatically)
and attaches to instances; a NACL is *stateless* (you must allow both directions)
and attaches to subnets. SGs are your everyday tool.

**The `t2.micro` / `t3.micro` note:** these are Free Tier eligible instance types.
On real AWS, sticking to micro instances keeps you free for the first 12 months.

---

## Part D — Repeat on REAL AWS (optional but recommended, 2h) 💵→$0

LocalStack simulates the API but doesn't give you a *reachable* server. To feel the
real thing, do this once on real Free Tier, then tear it down.

The idea (full commands in `evidence/real-ec2-steps.md` — write them as you go):
1. `aws --profile devops-lab ec2 run-instances` with a real Amazon Linux AMI, a
   `t2.micro` or `t3.micro`, your real key pair, in a real default-VPC public subnet.
2. Attach a security group allowing 22 from **your IP only** and 80 from anywhere.
3. Use **user data** to install a web server on boot:

```bash
#!/bin/bash
dnf install -y httpd
echo "<h1>Hello from $(hostname) via user data</h1>" > /var/www/html/index.html
systemctl enable --now httpd
```

4. Grab the public IP, open `http://<ip>` in your browser — a server you built,
   live on the internet.
5. SSH in with your key: `ssh -i key.pem ec2-user@<ip>`.

### Teardown (RUN THIS — do not skip) 💵→$0

```bash
aws --profile devops-lab ec2 terminate-instances --instance-ids <id>
# once terminated, release any Elastic IP, delete the SG if you made a custom one.
aws --profile devops-lab ec2 describe-instances \
  --query 'Reservations[].Instances[].State.Name'   # confirm "terminated"
```

A stopped instance still bills for its EBS volume; a **terminated** one doesn't.
Confirm termination. Then check your billing dashboard tomorrow — it should be $0.

---

## Prove it

Save to `evidence/`:

1. `lab02-vpc-build.sh` — your full LocalStack VPC+EC2 build script (all the commands above)
2. `lab02-describe.txt` — the `describe-instances` output showing your instance
3. `lab02-real-ec2.png` — (if you did Part D) browser screenshot of your live server's page
4. `lab02-answers.md`:
   - What single thing makes a subnet "public" rather than "private"?
   - Security group vs NACL: state the two differences and when the stateless nature of a NACL bites you.
   - Why does a NAT Gateway cost money and a route to an Internet Gateway doesn't? (Research this — it's the classic surprise bill.)
   - Why terminate rather than stop an instance you're done with?

## Phase 1 gate check
You've built a VPC with public/private subnets and launched a web server entirely
from the CLI. If Part D worked, you reached it over the internet and then made your
bill go back to zero. That's the core competency of cloud infrastructure.

## Going deeper (optional)
- Add a NAT Gateway so the private subnet can reach the internet outbound (and watch
  the cost implication — tear it down fast).
- VPC peering / endpoints
- Elastic Load Balancer in front of two instances across two AZs
