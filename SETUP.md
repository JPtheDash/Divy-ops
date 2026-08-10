# Toolchain Setup

Written for **macOS**. Everything is free. Where a tool has a paid cloud
component (AWS), the setup keeps you on the Free Tier or on LocalStack.

Do this in one sitting (~60–90 min). Getting the environment ready up front
removes most of the friction from the labs.

---

## 0. Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew --version
```

---

## 1. Core (Phase 0)

```bash
brew install git gh jq yq wget tree watch coreutils
brew install python@3.12 node
```

Configure git:

```bash
git config --global user.name "JP"
git config --global user.email "jyoti.dash@codeandtheory.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
```

---

## 2. AWS CLI + LocalStack (Phase 1)

```bash
brew install awscli
aws --version

# LocalStack: a free AWS emulator that runs in Docker on your laptop
brew install localstack/tap/localstack-cli
pip install awscli-local --break-system-packages   # gives you the `awslocal` command
```

**LocalStack needs Docker** (next section). Once Docker is running:

```bash
localstack start -d          # start LocalStack in the background
localstack status services   # see which AWS services are emulated
awslocal s3 mb s3://test-bucket   # talk to LocalStack exactly like real AWS
awslocal s3 ls
localstack stop
```

`awslocal` is just `aws` pointed at LocalStack. Everything you learn transfers
1:1 to real AWS — you just swap `awslocal` for `aws`.

---

## 3. Docker (Phases 2, 5, and LocalStack)

Use **Colima** (free; avoids Docker Desktop's licensing question):

```bash
brew install colima docker docker-compose
colima start --cpu 4 --memory 8 --disk 60
docker run --rm hello-world
```

Image tooling used later:

```bash
brew install hadolint dive       # Dockerfile linting + layer inspection
```

---

## 4. Infrastructure as Code (Phase 3)

```bash
brew install opentofu      # open-source Terraform (the `tofu` command)
# or: brew install terraform
brew install terraform-docs tflint
```

`opentofu` is a drop-in replacement for Terraform. Labs use `terraform`
commands; every one works with `tofu` — alias it if you like:
`alias terraform=tofu`.

---

## 5. Kubernetes (Phase 5)

```bash
brew install kubectl kind helm k9s eksctl
kind create cluster --name devops
kubectl cluster-info --context kind-devops
kind delete cluster --name devops   # tear down until Phase 5
```

`k9s` is a terminal UI for Kubernetes — it'll save you hours. `eksctl` is the
easiest way to spin up (and tear down) an EKS cluster later.

---

## 6. Observability (Phase 6)

Nothing to install now — you'll run Prometheus + Grafana as containers via
`docker compose` when you reach Phase 6.

---

## 7. A real AWS account (for the few real-AWS labs)

Most labs use LocalStack and need **no account**. For the handful that touch
real AWS:

1. Create an AWS account (needs a card, but the Free Tier covers the labs).
2. **Immediately** secure the root user: enable MFA, then stop using root.
3. Create an IAM admin user for yourself (Phase 1 Lab 1 walks through this).
4. **Set a billing alarm** (Phase 1 Lab 1) — do this before anything else.
5. Configure the CLI:

```bash
aws configure --profile devops-lab
# paste the access key + secret for your IAM user, region e.g. ap-south-1
aws sts get-caller-identity --profile devops-lab   # confirm who you are
```

Alternatives to a card-required account:
- **LocalStack** covers most of the curriculum with zero account.
- **AWS Academy / free credits** if you're affiliated with a program.

---

## 8. Verify everything

```bash
bash resources/verify-setup.sh
```

---

## Troubleshooting

**LocalStack won't start:** confirm Docker is up (`docker ps`). LocalStack runs
as a container, so Colima/Docker must be running first.

**`awslocal` not found:** `pip install awscli-local --break-system-packages`, and
ensure your pip bin dir is on PATH.

**Colima low memory in Phase 5:** Kubernetes is hungry. Bump with
`colima stop && colima start --cpu 4 --memory 8`.

**No admin on your machine / corporate laptop:** the whole curriculum runs inside
a GitHub Codespace (60 free hrs/month) or a single Ubuntu container. Ask and I'll
write you a devcontainer.
