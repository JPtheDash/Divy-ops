# Progress Tracker

Check a box only when you've produced the evidence (in each lab's `evidence/`
folder), not when you've read the lab.

## Setup
- [ ] Toolchain installed (`SETUP.md`)
- [ ] `bash resources/verify-setup.sh` passes
- [ ] Billing alarm set (if using real AWS)

---

## Phase 0 — Foundations (Weeks 1–3)
- [ ] Lab 01 — Linux & the command line
- [ ] Lab 02 — Git & scripting (bash + Python)
- [ ] Lab 03 — Networking for the cloud
- [ ] **Gate:** idempotent setup script; can subnet a /16; SSH via key + config

## Phase 1 — AWS Fundamentals (Weeks 4–7)
- [ ] Lab 01 — IAM, CLI & LocalStack (+ billing alarm)
- [ ] Lab 02 — EC2 & VPC from scratch
- [ ] Lab 03 — S3, RDS & Lambda
- [ ] **Gate:** VPC + web server built entirely by CLI; least-privilege S3 policy; S3→Lambda trigger

## Phase 2 — Containers (Weeks 8–10)  *(labs added when you reach it)*
- [ ] Docker fundamentals
- [ ] Images done right (small, non-root, health checks)
- [ ] Containers on AWS (ECR, ECS)
- [ ] **Gate:** app containerized <100MB, pushed to a registry, runs with health checks

## Phase 3 — Infrastructure as Code (Weeks 11–14)
- [ ] Terraform fundamentals
- [ ] Real Terraform (modules, envs, LocalStack + free-tier apply)
- [ ] Terraform at scale (remote state, drift)
- [ ] CloudFormation + CDK overview
- [ ] **Gate:** whole environment up/down from one command with remote state

## Phase 4 — CI/CD (Weeks 15–18)
- [ ] CI foundations (GitHub Actions)
- [ ] Continuous delivery to AWS (OIDC, deploy strategies)
- [ ] AWS-native CI/CD (CodePipeline/Build/Deploy)
- [ ] Pipeline quality & safety
- [ ] **Gate:** push → build → test → deploy to AWS, zero manual steps, with rollback

## Phase 5 — Kubernetes & EKS (Weeks 19–21)
- [ ] K8s fundamentals (kind)
- [ ] Operating workloads (HPA, probes, Helm)
- [ ] EKS (IRSA, LB controller)
- [ ] **Gate:** app on a cluster with autoscaling, rolling updates, health probes

## Phase 6 — Observability & Operations (Weeks 22–23)
- [ ] Observability (CloudWatch, Prometheus, Grafana)
- [ ] Operations & reliability (SLOs, incidents, postmortems)
- [ ] **Gate:** dashboard + alert firing on a simulated failure, runbook, postmortem

## Phase 7 — Capstone (Week 24)
- [ ] Full system: containerized app, Terraform infra, CI/CD, LB + autoscaling, monitoring
- [ ] One-command up/down; bill returns to ~$0 after down
- [ ] Portfolio README + architecture diagram + walkthrough
- [ ] Interview prep complete

---

## Habits
- [ ] Daily: check AWS billing dashboard
- [ ] Weekly: automate one manual thing
- [ ] Monthly: tear down and rebuild from code

## Notes to self
_(what clicked, what didn't, questions to revisit)_
