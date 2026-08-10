# Lab 01 — IAM, the CLI & LocalStack

**Week 4 · ~8 hours**

## Objective

Understand how AWS is structured, learn IAM (the thing that controls *who can do
what* — and the thing people get wrong most), get fluent with the AWS CLI, and set
up LocalStack so you can practice everything for free. Plus: lock down billing so
you never get surprised.

---

## Part A — How AWS is organized (30 min, read)

- **Account** — the top-level container and billing boundary.
- **Region** — a geographic location (e.g. `ap-south-1` Mumbai, `us-east-1`
  N. Virginia). Resources live in a region. Pick one close to you and stick to it.
- **Availability Zone (AZ)** — isolated datacenters within a region (e.g.
  `ap-south-1a`, `-1b`). You spread across AZs for resilience.
- **Service** — EC2, S3, Lambda, etc. Some are regional, a few are global (IAM, Route 53).

Mental model: you deploy *resources* (an EC2 instance, an S3 bucket) into a
*region*, often across multiple *AZs*, and *IAM* decides who's allowed to.

---

## Part B — Start LocalStack (30 min)

```bash
# Docker/Colima must be running first
colima status || colima start
localstack start -d
localstack status services | head -30   # dozens of AWS services, emulated locally
```

Configure a throwaway profile for LocalStack (credentials are fake — LocalStack
doesn't check them):

```bash
aws configure set aws_access_key_id test --profile localstack
aws configure set aws_secret_access_key test --profile localstack
aws configure set region us-east-1 --profile localstack

# `awslocal` wraps this automatically. Test it:
awslocal sts get-caller-identity
awslocal s3 mb s3://my-first-bucket
awslocal s3 ls
```

You now have a full AWS API on your laptop, free. Everything below uses `awslocal`
unless it says "REAL AWS".

---

## Part C — IAM: users, groups, roles, policies (2.5h)

IAM is the heart of AWS security. Four concepts:

- **User** — a person or app with long-term credentials. Minimize these.
- **Group** — a bucket of users sharing permissions (e.g. "Developers").
- **Role** — an identity that's *assumed* temporarily, giving short-lived
  credentials. **This is the preferred way** — EC2 instances, Lambda functions, and
  CI pipelines all use roles, not stored keys.
- **Policy** — a JSON document listing allowed/denied actions on resources.

Create the pieces on LocalStack:

```bash
# a group and a user
awslocal iam create-group --group-name developers
awslocal iam create-user --user-name alice
awslocal iam add-user-to-group --user-name alice --group-name developers
awslocal iam get-group --group-name developers
```

Write a **least-privilege policy** — read-only access to one specific bucket:

```bash
cat > /tmp/s3-readonly.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOneBucket",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::my-first-bucket",
        "arn:aws:s3:::my-first-bucket/*"
      ]
    }
  ]
}
EOF

awslocal iam create-policy --policy-name S3ReadOne \
  --policy-document file:///tmp/s3-readonly.json
```

Study the structure — you'll write dozens of these:
- **Effect**: Allow or Deny (explicit Deny always wins)
- **Action**: the API calls, e.g. `s3:GetObject`. `*` means all (avoid it).
- **Resource**: the ARN(s) it applies to. Note the two entries: the bucket itself
  (for `ListBucket`) and objects inside it (`/*`, for `GetObject`).

**The least-privilege principle:** grant the minimum actions on the minimum
resources. `"Action": "*"` on `"Resource": "*"` is how breaches happen. When you
find yourself typing a wildcard, ask if you can be more specific.

Now roles — the pattern you'll use everywhere. A role has a **trust policy** (who
can assume it) plus **permission policies** (what they can then do):

```bash
cat > /tmp/trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF
awslocal iam create-role --role-name ec2-app-role \
  --assume-role-policy-document file:///tmp/trust.json
awslocal iam list-roles --query 'Roles[].RoleName'
```

That trust policy says "EC2 instances may assume this role." When you attach it to
an instance, the app on it gets temporary credentials automatically — no keys to
store or leak. This is the single most important AWS security habit.

---

## Part D — CLI fluency (90 min)

The CLI is how DevOps people actually use AWS (the console is for looking, not doing).

```bash
# output formats
awslocal s3api list-buckets --output table
awslocal s3api list-buckets --output json
awslocal s3api list-buckets --output text

# --query uses JMESPath to filter/reshape (learn this — it's everywhere)
awslocal iam list-users --query 'Users[].UserName'
awslocal iam list-users --query 'Users[?UserName==`alice`].Arn' --output text

# pipe to jq for anything --query can't do
awslocal iam list-roles | jq '.Roles[] | {name: .RoleName, created: .CreateDate}'
```

Practice: create three buckets, then list only the ones whose name contains "log":

```bash
awslocal s3 mb s3://app-logs-dev
awslocal s3 mb s3://app-data-dev
awslocal s3 mb s3://app-logs-prod
awslocal s3api list-buckets --query "Buckets[?contains(Name, 'log')].Name" --output text
```

---

## Part E — Billing protection (REAL AWS, 45 min)

**Do this once, on your real account, before any real-AWS lab.** It's the seatbelt.

In the AWS Console:
1. Sign in, go to **Billing → Budgets → Create budget**.
2. Create a **Zero-spend budget** (alerts you the moment anything costs money) or a
   monthly budget of e.g. $5 with alerts at 50/80/100%.
3. Go to **Billing → Billing preferences** and enable "Receive Free Tier usage
   alerts" with your email.
4. Enable a **CloudWatch billing alarm** (in `us-east-1`): CloudWatch → Alarms →
   Create → metric `EstimatedCharges` → threshold e.g. $5 → notify your email.

Also secure the account now:
- Enable **MFA on the root user** and then stop using root.
- Create an IAM admin user for daily use; configure the CLI with it:

```bash
aws configure --profile devops-lab      # real credentials, real region
aws sts get-caller-identity --profile devops-lab
```

From here on: `awslocal` for free practice, `aws --profile devops-lab` for the few
real-AWS labs.

---

## Prove it

Save to `evidence/`:

1. `lab01-policy.json` — your least-privilege S3 policy
2. `lab01-cli.txt` — the JMESPath query output showing only the "log" buckets
3. `lab01-billing.png` — screenshot of your budget/billing alarm configured on real AWS
4. `lab01-answers.md`:
   - Explain the difference between an IAM user and an IAM role. When do you use each?
   - Why is attaching a role to an EC2 instance safer than storing access keys on it?
   - In the S3 policy, why are there two ARNs (with and without `/*`)?
   - What does "explicit deny always wins" mean for policy evaluation?

## Teardown
LocalStack: `localstack stop` (everything vanishes — it's all in memory).
No real AWS resources were created in this lab except the (free) billing config.

## Going deeper (optional)
- IAM policy simulator (console) — test whether a policy allows an action
- Permission boundaries and SCPs (org-level guardrails)
- Read the AWS "IAM best practices" page end to end
