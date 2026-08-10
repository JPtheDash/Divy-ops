# DevOps + AWS: Zero to Expert

A 24-week, hands-on curriculum built for a **test engineer** moving into DevOps
on AWS. Every lab is designed to run for **free** — inside the AWS Free Tier or
emulated locally with LocalStack — with teardown steps so you never get a surprise bill.

**Target pace:** 10–15 hrs/week → ~6 months to genuine job-ready competence.

---

## Why your QA background is an advantage

DevOps is, at its core, **automation + reliability thinking** — and you already
own half of that from testing.

| What you do today | What it becomes in DevOps |
|---|---|
| Writing repeatable test cases | Writing repeatable infrastructure (IaC) |
| CI test runs | CI/CD pipelines that build, test, and deploy |
| Reproducible test environments | Immutable, reproducible infra with Terraform |
| Flaky test triage | Debugging flaky deployments and infra drift |
| Test coverage & quality gates | Deployment gates, health checks, rollbacks |
| Logging bugs with repro steps | Observability: metrics, logs, traces, alerts |
| "Does it work under load?" | Scaling, load balancing, capacity planning |

The gap you're closing is **cloud infrastructure + operating systems at scale**,
not the discipline of doing things repeatably. You already think that way.

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
