# DevOps + AWS: Zero to Expert

A 24-week, hands-on curriculum that takes you from zero to job-ready in DevOps on
AWS. Every lab is designed to run for **free** — inside the AWS Free Tier or
emulated locally with LocalStack — with teardown steps so you never get a surprise bill.

**Target pace:** 10–15 hrs/week → ~6 months to genuine job-ready competence.

**Who it's for:** anyone comfortable with basic programming and the command line
who wants to become a DevOps / cloud / platform engineer. No prior cloud or
infrastructure experience assumed.

---

## What DevOps actually is

At its core, DevOps is **automation + reliability thinking**: describing systems as
code so they're repeatable, shipping changes safely through pipelines, and running
them so they stay up. This path builds that skill set in the order it compounds —
foundations first, then cloud, then how to automate and operate it all.

The five things you'll be able to do by the end:

1. **Provision infrastructure as code** — define servers, networks, and databases in
   Terraform so an entire environment can be created or destroyed with one command.
2. **Containerize and ship applications** — package apps with Docker and run them on AWS.
3. **Build CI/CD pipelines** — every code push builds, tests, and deploys automatically.
4. **Operate at scale** — load balancing, autoscaling, and self-healing on Kubernetes.
5. **Observe and respond** — dashboards, alerts, and incident runbooks so you know
   when something breaks and why.

---

## How to use this repo

1. Read `ROADMAP.md` — the full 24-week plan, 8 phases.
2. Run `SETUP.md` — install the toolchain once, up front.
3. Work the `labs/` in order. Each lab has objectives, steps, a **"prove it"**
   section, and — crucially — a **teardown** section so nothing keeps costing money.
4. Track yourself in `PROGRESS.md`.

**The best way to read this repo is the web app** — see below.

---

## The learning app

There's a premium-style learning interface in `webapp/`. To launch it:

```bash
cd webapp && ./start.command
```

Or double-click `webapp/start.command`. It opens in your browser with sidebar
navigation, progress tracking, copy-able commands, and interactive widgets.

### Interactive lessons (learn by doing)

The app includes **interactive, do-it-here lessons** with a mock terminal — you
type real commands (`bash`, `git`, and `aws`/`awslocal`) into a simulated
environment that behaves like the real thing, plus quizzes and checkpoints that
won't let you advance until you've got it. No Docker or AWS account needed.

Open `webapp/interactive.html` (or the "★ Interactive lessons" section in the
sidebar). Lessons: Linux permissions, Linux CLI, Git, Networking/CIDR, AWS IAM,
S3, VPC, and Lambda. Each has a "Launch live env" button for the real thing when
you're ready.

Running it elsewhere — sharing via GitHub Pages, or learning from an **Android
tablet / iPad** via GitHub Codespaces — is covered in **`RUNNING.md`**. The app is
responsive, so it works on phones and tablets too.

---

## Repo layout

```
devops/
├── README.md          ← you are here
├── ROADMAP.md         ← the 24-week curriculum
├── SETUP.md           ← one-time toolchain install
├── PROGRESS.md        ← your checklist
├── labs/
│   ├── 00-foundations/       Weeks 1–3   Linux, Git, scripting, networking
│   ├── 01-aws-fundamentals/  Weeks 4–7   IAM, CLI, EC2, VPC, S3, RDS, Lambda
│   ├── 02-containers/        Weeks 8–10  Docker, ECR, ECS
│   ├── 03-iac-terraform/     Weeks 11–14 Terraform + CloudFormation
│   ├── 04-cicd/              Weeks 15–18 GitHub Actions + CodePipeline
│   ├── 05-kubernetes-eks/    Weeks 19–21 Kubernetes + EKS
│   ├── 06-observability/     Weeks 22–23 CloudWatch, Prometheus, SRE
│   └── 07-capstone/          Week 24     Full deploy, end to end
└── webapp/            ← the local learning app
```

---

## The two cost rules (read before touching AWS)

1. **Prefer LocalStack.** Most labs run against LocalStack — a free AWS emulator
   on your laptop. No account, no card, no risk. You'll only use real AWS when a
   lab explicitly says so.
2. **Always tear down.** Every real-AWS lab ends with a teardown section. Run it.
   Set a billing alarm on day one (Phase 1 Lab 1 shows you how). The Free Tier is
   generous but not infinite — an idle NAT Gateway or forgotten RDS instance is
   the classic "why is my bill $40" story.

---

## Start here

```bash
open ROADMAP.md      # the plan
open SETUP.md        # install tools
cd webapp && ./start.command   # or just launch the app and go
```
