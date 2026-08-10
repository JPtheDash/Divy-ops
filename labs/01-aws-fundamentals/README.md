# Phase 1 — AWS Fundamentals (Weeks 4–7)

Three labs. Most of this runs on **LocalStack** (free, local). Where a lab uses
real AWS, it's marked and ends with **teardown**.

| Lab | Weeks | Time | Topic |
|---|---|---|---|
| [lab-01](lab-01-iam-cli-localstack.md) | 4 | ~8h | IAM, the CLI, LocalStack, billing alarms |
| [lab-02](lab-02-ec2-vpc.md) | 5 | ~10h | EC2 & VPC from scratch |
| [lab-03](lab-03-s3-rds-lambda.md) | 6–7 | ~12h | S3, RDS & Lambda |

```bash
mkdir -p labs/01-aws-fundamentals/evidence
```

## The golden rules for this phase
1. **`awslocal` = free.** When a lab uses `awslocal`, it's hitting LocalStack on
   your laptop. Zero cost, zero account needed.
2. **`aws` = real.** When a lab uses `aws` against a real account, follow the
   teardown at the end. No exceptions.
3. **Set the billing alarm in Lab 1 before doing any real-AWS work.**
