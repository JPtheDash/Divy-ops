# Free Tools Reference

Everything in this curriculum is free — open source, or AWS Free Tier / LocalStack.
Grouped by the phase you first meet it. Install steps are in `SETUP.md`.

## Phase 0 — Foundations
| Tool | Purpose |
|---|---|
| Docker / Colima | Run Linux containers for labs |
| git, gh | Version control + GitHub CLI |
| jq, yq | Parse JSON / YAML on the command line |
| Python 3, Node | Scripting and tooling |
| ssh, dig, ss, nc | Networking basics |

## Phase 1 — AWS Fundamentals
| Tool | Purpose |
|---|---|
| AWS CLI | The way you actually drive AWS |
| **LocalStack** | Free local AWS emulator — most labs run here |
| awslocal | AWS CLI pointed at LocalStack |
| AWS Free Tier | Real account for the few real-AWS labs |

## Phase 2 — Containers
| Tool | Purpose |
|---|---|
| Docker / Colima | Build and run containers |
| hadolint | Dockerfile linter |
| dive | Inspect image layers |
| docker compose | Multi-container local stacks |
| Amazon ECR | Container registry (free-tier storage) |

## Phase 3 — Infrastructure as Code
| Tool | Purpose |
|---|---|
| OpenTofu / Terraform | Provision infra as code |
| tflint, terraform-docs | Lint + document Terraform |
| LocalStack | Apply Terraform for free locally |
| CloudFormation / CDK | AWS-native IaC (know both) |

## Phase 4 — CI/CD
| Tool | Purpose |
|---|---|
| GitHub Actions | CI/CD (free minutes for public + generous private) |
| CodePipeline/Build/Deploy | AWS-native CI/CD |
| OIDC | Keyless AWS auth from pipelines |

## Phase 5 — Kubernetes & EKS
| Tool | Purpose |
|---|---|
| kind / minikube | Free local Kubernetes |
| kubectl, helm, k9s | Operate clusters |
| eksctl | Spin up / tear down EKS quickly |

## Phase 6 — Observability
| Tool | Purpose |
|---|---|
| CloudWatch | AWS-native metrics/logs/alarms |
| Prometheus + Grafana | Metrics + dashboards (run locally, free) |
| Loki | Log aggregation |
| OpenTelemetry | Vendor-neutral tracing |

## Learning & reference (all free)
- AWS Skill Builder (free digital courses) and AWS docs
- AWS Well-Architected Framework — read the pillars
- roadmap.sh DevOps roadmap — visual overview
- KodeKloud / freeCodeCamp DevOps content on YouTube
- LocalStack docs — which services are emulated
- The Terraform and Kubernetes official tutorials
