# DevOps + AWS Roadmap — 24 Weeks, 8 Phases

**Assumed start:** test engineer. Comfortable with software and CI concepts,
limited depth in Linux internals, cloud, and infrastructure.

**Assumed pace:** 12 hrs/week, ~40% reading/watching, 60% hands-on. When short
on time, cut the reading, never the labs.

**Definition of "expert" used here:** you can design and operate an automated,
observable, self-healing deployment on AWS — provisioned as code, shipped through
a pipeline, and monitored — and explain the cost, reliability, and security
tradeoffs of every choice.

**Cost model:** LocalStack (free, local) for most labs; real AWS Free Tier only
where a lab says so, always with teardown.

---

## Phase map

| Phase | Weeks | Theme | Capstone deliverable |
|---|---|---|---|
| 0 | 1–3 | Foundations: Linux, Git, scripting, networking | Automated setup script + network diagram |
| 1 | 4–7 | AWS fundamentals: IAM, CLI, compute, storage, network | A VPC with a running web server, all by CLI |
| 2 | 8–10 | Containers: Docker, ECR, ECS | Containerized app pushed to a registry |
| 3 | 11–14 | Infrastructure as Code: Terraform | Whole environment reproducible from code |
| 4 | 15–18 | CI/CD pipelines | Git push → tested → deployed to AWS, automatically |
| 5 | 19–21 | Kubernetes & EKS | App running on a cluster with autoscaling |
| 6 | 22–23 | Observability & operations | Dashboards, alerts, and an incident runbook |
| 7 | 24 | Capstone | The whole thing, wired together |

---

# PHASE 0 — Foundations (Weeks 1–3)

You cannot operate cloud infrastructure without solid Linux, Git, and networking.
This phase is unglamorous and skipping it is why people plateau in month 4.

### Week 1 — Linux & the command line
- Filesystem, permissions, users/groups, `sudo`
- Processes, signals, `ps`, `top`, `systemctl`, `journalctl`
- Package managers, environment variables, PATH
- SSH: keys, config, agent, tunnels (you'll live in SSH on EC2)
- Text tools: `grep`, `sed`, `awk`, `jq`, pipes, redirection

### Week 2 — Git & scripting
- Git model, branching, merge vs rebase, remotes, tags
- Bash scripting: variables, conditionals, loops, functions, `set -euo pipefail`
- Python for automation: reading files, calling APIs, the `boto3` preview
- Idempotency — why "run it twice, same result" is the core DevOps virtue

### Week 3 — Networking for the cloud
- IP addressing, CIDR notation, subnets (you'll design these in VPCs)
- TCP/UDP, ports, the TCP handshake
- DNS end to end; `dig`, `nslookup`
- HTTP/HTTPS, TLS, load balancing concepts
- Firewalls vs security groups; public vs private networks

**Labs:** `labs/00-foundations/`

**Phase 0 gate:**
- [ ] Write a bash script that sets up a dev environment idempotently
- [ ] Explain CIDR: given `10.0.0.0/16`, how many hosts, and how to split into 4 subnets
- [ ] SSH into a machine using a key, with a `~/.ssh/config` entry
- [ ] Trace a request from browser to server including DNS and TLS

---

# PHASE 1 — AWS Fundamentals (Weeks 4–7)

Four weeks because everything later sits on this. You'll do most of it against
LocalStack for free, touching real AWS only to see the console and set billing alarms.

### Week 4 — Accounts, IAM & the CLI
- How AWS is organized: accounts, regions, availability zones
- **IAM deeply:** users, groups, roles, policies, the principle of least privilege
- Why you never use root, and why roles beat long-lived access keys
- AWS CLI setup, profiles, `--query` (JMESPath), output formats
- **LocalStack:** run AWS APIs locally for free
- **Billing alarms & budgets** — set these before anything else

### Week 5 — Compute & networking (EC2 + VPC)
- EC2: instances, AMIs, instance types, user data, key pairs
- **VPC from scratch:** CIDR, subnets (public/private), route tables, internet
  gateway, NAT gateway (and why it costs money)
- Security groups vs NACLs
- Elastic IPs, ENIs
- Launch a web server and reach it over the internet

### Week 6 — Storage & databases
- S3: buckets, objects, storage classes, versioning, lifecycle, static hosting
- S3 security: block public access, bucket policies, presigned URLs
- EBS vs EFS vs instance store
- RDS: managed databases, Multi-AZ, read replicas, backups
- DynamoDB basics (serverless NoSQL)

### Week 7 — Serverless & glue
- Lambda: functions, triggers, execution role, cold starts
- API Gateway → Lambda
- SQS, SNS, EventBridge — how services talk to each other
- CloudWatch Logs (preview of Phase 6)
- Putting it together: an S3 upload that triggers a Lambda

**Labs:** `labs/01-aws-fundamentals/`

**Phase 1 gate:**
- [ ] Build a VPC with public+private subnets and a running web server, entirely by CLI
- [ ] Write an IAM policy granting least-privilege access to one S3 bucket
- [ ] Explain the cost of a NAT Gateway and one way to avoid it
- [ ] Trigger a Lambda from an S3 upload and see it in the logs

---

# PHASE 2 — Containers (Weeks 8–10)

### Week 8 — Docker fundamentals
- Images, layers, the OCI spec, registries, tags vs digests
- Dockerfiles: multi-stage builds, caching, `.dockerignore`
- `docker run`, volumes, networks, `docker compose`
- Container lifecycle, logs, exec

### Week 9 — Images done right
- Small images: alpine, distroless, multi-stage
- Non-root users, health checks, graceful shutdown (SIGTERM)
- Tagging strategy, semantic versioning of images
- Pushing to **Amazon ECR** (and the free-tier limits)

### Week 10 — Running containers on AWS
- ECS concepts: clusters, task definitions, services, Fargate vs EC2 launch type
- Load balancing containers with an ALB
- Environment config & secrets (SSM Parameter Store, Secrets Manager)
- (LocalStack + `docker compose` locally; real ECS is a small, tear-down-after exercise)

**Labs:** `labs/02-containers/`

**Phase 2 gate:** containerize a real app, get it under 100MB, push to a registry,
run it with health checks and graceful shutdown.

---

# PHASE 3 — Infrastructure as Code (Weeks 11–14)

The heart of modern DevOps and where your "repeatable" instinct pays off most.

### Week 11 — Terraform fundamentals
- HCL, providers, resources, data sources
- State — what it is, why it's sensitive, remote state in S3 + DynamoDB locking
- `plan` vs `apply`, the dependency graph
- Variables, outputs, locals

### Week 12 — Real Terraform
- Modules: writing and reusing them
- Workspaces and environments (dev/stage/prod)
- Provisioning your Phase 1 VPC + EC2, but now as code
- Terraform against LocalStack (free), then a real free-tier apply + destroy

### Week 13 — Terraform at scale
- Remote backends, state locking, drift detection
- `import` for existing resources
- `terraform fmt`, `validate`, and pre-commit hooks
- Secrets in Terraform (and how to keep them out of state)

### Week 14 — CloudFormation (know both)
- CloudFormation templates, stacks, change sets
- When teams use CFN vs Terraform
- The AWS CDK in one sitting (infra in real code)

**Labs:** `labs/03-iac-terraform/`

**Phase 3 gate:** stand up and tear down an entire environment (network + compute +
storage) from a single `terraform apply` / `destroy`, with remote state.

---

# PHASE 4 — CI/CD Pipelines (Weeks 15–18)

Your home turf. A pipeline is a test suite that also ships software.

### Week 15 — CI foundations
- GitHub Actions deeply: workflows, jobs, matrix, caching, artifacts, secrets
- Build → test → lint on every push and PR
- Reusable workflows, environments, approvals

### Week 16 — Continuous delivery to AWS
- OIDC from GitHub Actions → an AWS role (no long-lived keys)
- Deploying to S3/CloudFront, to ECS, to Lambda
- Blue/green and rolling deployments; rollbacks

### Week 17 — AWS-native CI/CD
- CodePipeline, CodeBuild, CodeDeploy, CodeArtifact
- When to use AWS-native vs GitHub Actions
- buildspec.yml, artifacts between stages

### Week 18 — Pipeline quality & safety
- Deployment gates, smoke tests, canary
- Managing environments and promotion
- Pipeline as code; keeping pipelines DRY
- Basic pipeline security (least-privilege tokens, pinned actions)

**Labs:** `labs/04-cicd/`

**Phase 4 gate:** `git push` triggers a pipeline that builds, tests, and deploys a
containerized app to AWS with zero manual steps and a working rollback.

---

# PHASE 5 — Kubernetes & EKS (Weeks 19–21)

### Week 19 — Kubernetes fundamentals
- Architecture: API server, etcd, scheduler, kubelet
- Pods, deployments, services, ingress, configmaps, secrets
- `kubectl` fluency; local cluster with `kind` (free)

### Week 20 — Operating workloads
- Rolling updates, health/readiness probes, resource requests/limits
- Horizontal Pod Autoscaler
- Namespaces, RBAC basics
- Helm charts

### Week 21 — EKS
- EKS architecture, node groups, Fargate profiles
- IAM Roles for Service Accounts (IRSA)
- Load balancing with the AWS Load Balancer Controller
- Cost awareness (EKS control plane is not free — short, tear-down lab)

**Labs:** `labs/05-kubernetes-eks/`

**Phase 5 gate:** deploy an app to a cluster with autoscaling, rolling updates, and
health probes; do most of it on free local `kind`, then a brief real EKS run.

---

# PHASE 6 — Observability & Operations (Weeks 22–23)

### Week 22 — Observability
- The three pillars: metrics, logs, traces
- CloudWatch: metrics, logs, alarms, dashboards, Logs Insights
- Prometheus + Grafana (free, run locally)
- Structured logging; what to log and what never to log
- Distributed tracing concepts (X-Ray / OpenTelemetry)

### Week 23 — Operations & reliability (SRE)
- SLIs, SLOs, error budgets
- Alerting that doesn't cause fatigue; on-call basics
- Incident response: detect, mitigate, resolve, postmortem
- Blameless postmortems (reuse your bug-writeup skills)
- Autoscaling, self-healing, and chaos-testing basics
- Cost monitoring as an ops discipline

**Labs:** `labs/06-observability/`

**Phase 6 gate:** a dashboard + alert that fires on a real simulated failure, plus a
written runbook and a postmortem for an incident you cause on purpose.

---

# PHASE 7 — Capstone (Week 24)

Build **one** system that exercises everything:

> A containerized web application, its infrastructure defined entirely in
> Terraform, deployed to AWS through an automated CI/CD pipeline on every push,
> running behind a load balancer with autoscaling, and monitored with dashboards
> and alerts — that you can create and destroy with one command.

Deliverables:
- Public GitHub repo with an excellent README and an architecture diagram
- One-command `up` and `down` (and proof your AWS bill returns to ~$0 after `down`)
- A short "how this scales and what it costs" writeup
- A recorded 8-minute walkthrough

### Professional readiness
- Interview prep: `resources/interview-prep.md`
- Certifications worth targeting (learning paths are free; exams are paid):
  AWS Cloud Practitioner (entry), AWS SysOps Administrator, then AWS DevOps
  Engineer – Professional. Terraform Associate is quick and respected.
- Your capstone repo is worth more than any cert in interviews.

---

## Ongoing habits (start week 1, never stop)
- **Daily:** check your AWS billing dashboard (build the habit early; it's a real ops skill).
- **Weekly:** automate one thing you did manually. That reflex *is* DevOps.
- **Monthly:** tear everything down and rebuild it from code. If you can't, your IaC is incomplete.

## Common failure modes
1. **Forgetting to tear down.** The #1 way beginners lose money. Automate `destroy`.
2. **Click-ops.** Doing it in the console once teaches you; doing it in the console
   forever means it isn't reproducible. Graduate everything to code.
3. **Skipping Linux/networking.** You will hit a wall in Phase 3 and it will be here.
4. **Reading instead of building.** The labs are the curriculum.
