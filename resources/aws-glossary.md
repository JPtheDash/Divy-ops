# AWS + DevOps Glossary

Fast reference. Skim now; it clicks as you hit each term in the labs.

## AWS structure
- **Region** — a geographic area (e.g. ap-south-1 Mumbai). Resources live in one.
- **Availability Zone (AZ)** — isolated datacenter within a region. Spread across AZs for resilience.
- **ARN** — Amazon Resource Name, the unique ID of any resource (`arn:aws:s3:::my-bucket`).
- **Free Tier** — 12-month and always-free allowances for new accounts. Micro instances, limited hours.

## Identity (IAM)
- **User** — long-term identity for a person/app. Minimize these.
- **Role** — an identity you *assume* temporarily for short-lived credentials. Preferred everywhere.
- **Policy** — JSON granting/denying actions on resources.
- **Least privilege** — grant the minimum access needed. Avoid `"*"`.
- **Trust policy** — attached to a role; says *who* may assume it.
- **STS** — Security Token Service; issues the temporary credentials when a role is assumed.

## Compute
- **EC2** — virtual servers. Instance types (t3.micro = free-tier), AMIs (images), user data (boot script).
- **Lambda** — run code with no servers; pay per invocation. Event-driven.
- **ECS** — run containers on AWS (Fargate = serverless containers, EC2 launch type = your instances).
- **EKS** — managed Kubernetes on AWS. Control plane costs money.
- **Fargate** — serverless compute for containers (no nodes to manage).

## Networking
- **VPC** — your private virtual network in AWS. You choose the CIDR.
- **Subnet** — a slice of the VPC in one AZ. Public (has internet route) or private.
- **CIDR** — `10.0.0.0/16` notation; bigger prefix = smaller network.
- **Internet Gateway (IGW)** — the door between your VPC and the internet.
- **NAT Gateway** — lets private subnets reach *out* to the internet. Costs money hourly + per GB.
- **Route table** — rules that make a subnet public (route to IGW) or private.
- **Security Group (SG)** — stateful per-instance firewall. Return traffic auto-allowed.
- **NACL** — stateless per-subnet firewall. Must allow both directions.
- **ALB / NLB** — Application (L7/HTTP) and Network (L4/TCP) load balancers.
- **Route 53** — AWS DNS.

## Storage & data
- **S3** — object storage (files in buckets). Artifacts, backups, static sites, logs.
- **EBS** — block storage (a disk) attached to one EC2 instance.
- **EFS** — shared network filesystem, mountable by many instances.
- **RDS** — managed relational DB (Postgres/MySQL/etc.).
- **Multi-AZ** — standby replica for failover (availability).
- **Read replica** — extra copies serving reads (scale).
- **DynamoDB** — serverless NoSQL key-value/document DB.
- **Presigned URL** — time-limited access to one S3 object without a public bucket.

## Messaging & events
- **SQS** — queue; decouples producers and consumers.
- **SNS** — pub/sub topics; fan-out notifications.
- **EventBridge** — event bus routing events between services.

## IaC & delivery
- **IaC** — Infrastructure as Code (Terraform, CloudFormation, CDK).
- **Terraform state** — Terraform's record of what it manages. Sensitive; store remotely (S3 + DynamoDB lock).
- **CloudFormation** — AWS-native IaC (templates → stacks).
- **CDK** — define infra in real programming languages; compiles to CloudFormation.
- **CI/CD** — Continuous Integration / Continuous Delivery/Deployment.
- **CodePipeline / CodeBuild / CodeDeploy** — AWS-native CI/CD services.
- **ECR** — Elastic Container Registry; stores Docker images.
- **OIDC federation** — lets CI (e.g. GitHub Actions) assume an AWS role with no stored keys.
- **Blue/green** — deploy a parallel new version, switch traffic, keep old for instant rollback.
- **Canary** — release to a small % of traffic first.

## Observability & operations
- **CloudWatch** — AWS metrics, logs, alarms, dashboards.
- **Logs Insights** — query language for CloudWatch logs.
- **X-Ray** — distributed tracing.
- **Metrics / Logs / Traces** — the three pillars of observability.
- **SLI / SLO / Error budget** — a measured indicator, a target for it, and the allowed room to miss.
- **MTTR** — Mean Time To Recover.
- **Runbook** — step-by-step guide for handling a known operational situation.
- **Postmortem** — blameless write-up after an incident.
- **Autoscaling** — add/remove capacity based on load.
- **Idempotent** — running it again produces the same result. The core DevOps virtue.
