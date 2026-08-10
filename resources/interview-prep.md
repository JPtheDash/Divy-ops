# Interview Prep (use from Phase 3 onward, finalize in Phase 7)

DevOps interviews test fundamentals, judgment, and evidence you've built real
things. Your labs and capstone are the evidence. This is the fundamentals + judgment.

## Questions you must answer cold

### Linux / networking / fundamentals
- Walk me through what happens when you type a URL and press enter (DNS → TCP → TLS → HTTP).
- What's the difference between a process and a service? How do you check a service's logs?
- Explain CIDR. Split `10.0.0.0/16` into subnets across 3 AZs.
- SIGTERM vs SIGKILL — why does it matter for containers?
- What is idempotency and why does DevOps care?

### AWS
- IAM user vs role — when do you use each? Why are roles safer?
- What makes a subnet public vs private?
- Security group vs NACL.
- Why did my bill spike? (NAT Gateway, idle RDS, unattached EBS, data transfer — name the usual suspects.)
- RDS Multi-AZ vs read replica.
- How do you give temporary access to one S3 object without making the bucket public?

### Containers / K8s
- What actually *is* a container? (namespaces, cgroups)
- Why multi-stage builds? How do you get a small image?
- Pod vs deployment vs service in Kubernetes.
- What do readiness and liveness probes do?
- How does rolling update + rollback work?

### IaC / CI-CD
- Terraform state — what is it, why is it sensitive, how do you store it for a team?
- `plan` vs `apply`; how do you review infra changes safely?
- Design a CI/CD pipeline for a containerized app. (You'll have built this.)
- How do you deploy from CI to AWS without storing long-lived credentials? (OIDC.)
- Blue/green vs canary vs rolling — tradeoffs.

### Judgment (these decide the hire)
- A deploy failed in production at 2am. Walk me through what you do.
  *(Assess blast radius → mitigate/rollback first, diagnose second → communicate →
  postmortem. Restore service before root-causing.)*
- How do you keep AWS costs under control?
  *(Tagging, budgets/alarms, right-sizing, spot/savings plans, killing idle
  resources, auto-scaling down, cost dashboards.)*
- Your pipeline takes 40 minutes and devs are frustrated. What do you do?
  *(Parallelize, cache dependencies/layers, run only affected tests, fail fast.)*
- How do you decide what to alert on?
  *(Alert on symptoms users feel (SLOs), not every metric. Actionable alerts only,
  or you get alert fatigue and miss the real one.)*

### Scenario / whiteboard
- Design a highly-available web app on AWS. (VPC across AZs, ALB, autoscaling group
  or ECS, RDS Multi-AZ, S3 for static, CloudFront, monitoring.)
- Your app is slow. How do you find out why? (Metrics → logs → traces; narrow the layer.)

## How to talk about your labs (STAR)
- **Situation:** "I built a containerized app deployed to AWS via a pipeline…"
- **Task:** "…that needed zero-downtime deploys and had to tear down to $0."
- **Action:** "Terraform for infra with remote state, GitHub Actions with OIDC to
  deploy, health-checked rolling updates, CloudWatch alarms…"
- **Result:** "One command up/down, automated deploys, monitored, and no idle cost."

## Red flags to avoid saying
- "I did it in the console." (Not reproducible — shows no IaC instinct.)
- "I gave it admin so it would work." (No least-privilege thinking.)
- "I'd just add more servers." (No cost/observability judgment.)

## Portfolio checklist (Phase 7)
- [ ] Public repo, excellent README, architecture diagram
- [ ] One-command `up` and `down`; proof the bill returns to ~$0
- [ ] Terraform for all infra (no click-ops)
- [ ] A CI/CD pipeline anyone can read
- [ ] Dashboards + alerts + a runbook
- [ ] A short "how this scales and what it costs" writeup

## Certifications (learning paths free; exams paid) — priority order
- **AWS Certified Cloud Practitioner** — entry, good for fundamentals + HR filter.
- **Terraform Associate** — quick, respected, directly useful.
- **AWS SysOps Administrator – Associate** — operations focus.
- **AWS DevOps Engineer – Professional** — the target cert; do it after real experience.
- **CKA/CKAD** — if you go Kubernetes-heavy.
Your capstone repo beats any cert in an interview. Certs open the door; the repo gets the offer.
