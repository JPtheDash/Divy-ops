# Lab 03 — S3, RDS & Lambda

**Weeks 6–7 · ~12 hours**

## Objective

Learn the storage, database, and serverless building blocks — and wire them
together into the classic event-driven pattern: an S3 upload triggers a Lambda.
All free on LocalStack.

---

## Part A — S3: object storage (3h)

S3 stores *objects* (files) in *buckets*. It's the workhorse of AWS — artifacts,
backups, static sites, data lakes, logs all live here.

```bash
localstack start -d

# create a bucket, put/get/list objects
awslocal s3 mb s3://devops-lab-data
echo "hello object storage" > /tmp/hello.txt
awslocal s3 cp /tmp/hello.txt s3://devops-lab-data/hello.txt
awslocal s3 ls s3://devops-lab-data/
awslocal s3 cp s3://devops-lab-data/hello.txt /tmp/downloaded.txt
cat /tmp/downloaded.txt

# sync a whole directory (how deploys upload build artifacts)
mkdir -p /tmp/site && echo "<h1>Static site</h1>" > /tmp/site/index.html
awslocal s3 sync /tmp/site s3://devops-lab-data/site/
awslocal s3 ls s3://devops-lab-data/site/
```

Versioning (protects against overwrite/delete):

```bash
awslocal s3api put-bucket-versioning --bucket devops-lab-data \
  --versioning-configuration Status=Enabled
awslocal s3api list-object-versions --bucket devops-lab-data --query 'Versions[].Key'
```

**S3 security — the #1 real-world AWS mistake is public buckets.** The rules:
- "Block Public Access" is ON by default — leave it on unless you're intentionally
  hosting a public static site.
- Grant access with **bucket policies** (resource-based) or IAM policies, least privilege.
- Share single objects temporarily with **presigned URLs**, not by making the bucket public.

```bash
# a presigned URL: time-limited access to one object, no public bucket needed
awslocal s3 presign s3://devops-lab-data/hello.txt --expires-in 3600
```

Storage classes (cost vs access speed): Standard → Standard-IA → Glacier. Lifecycle
rules move old objects to cheaper tiers automatically — an ops cost lever you'll use.

---

## Part B — RDS: managed databases (3h)

RDS runs managed relational databases (Postgres, MySQL, etc.) so you don't operate
the server yourself. Create one on LocalStack:

```bash
awslocal rds create-db-instance \
  --db-instance-identifier devops-lab-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password ChangeMe123 \
  --allocated-storage 20

awslocal rds describe-db-instances \
  --query 'DBInstances[].{id:DBInstanceIdentifier,engine:Engine,status:DBInstanceStatus}'
```

Concepts to know (you'll be asked in interviews):
- **Multi-AZ** — a standby replica in another AZ for automatic failover (availability).
- **Read replicas** — copies that serve read traffic (scaling reads). Different goal
  from Multi-AZ: replicas = performance, Multi-AZ = resilience.
- **Automated backups & snapshots** — point-in-time recovery.
- **Where it lives:** a **private** subnet (Phase 1 Lab 2). The web tier reaches it
  over the VPC; the internet cannot. A database in a public subnet is a resume-generating event.

**Real-AWS cost note:** RDS is *not* always free — `db.t3.micro` has limited Free
Tier hours and storage. Practice on LocalStack. If you ever create a real RDS
instance, delete it the same day (skip the final snapshot to avoid storage charges).

---

## Part C — Lambda: serverless functions (3h)

Lambda runs your code without you managing servers — you pay per invocation
(generous free tier). It's the glue of event-driven architectures.

```bash
# a tiny Python function
mkdir -p /tmp/fn && cat > /tmp/fn/handler.py <<'EOF'
def handler(event, context):
    print("Event received:", event)
    return {"statusCode": 200, "body": "processed"}
EOF
cd /tmp/fn && zip function.zip handler.py

# an execution role (Lambda assumes this to run)
cat > /tmp/lambda-trust.json <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow",
"Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}
EOF
awslocal iam create-role --role-name lambda-role \
  --assume-role-policy-document file:///tmp/lambda-trust.json

# create the function
awslocal lambda create-function \
  --function-name process-upload \
  --runtime python3.12 \
  --handler handler.handler \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --zip-file fileb:///tmp/fn/function.zip

# invoke it directly
awslocal lambda invoke --function-name process-upload \
  --payload '{"test":"manual"}' /tmp/out.json
cat /tmp/out.json
```

Note the **execution role** — same pattern as EC2 in Lab 1: the function gets
temporary credentials via a role, never stored keys. Its permissions policy would
grant exactly what the function needs (e.g. read one S3 bucket, write to one table).

---

## Part D — Wire it together: S3 → Lambda (3h)

The classic serverless pattern: uploading a file automatically triggers processing.

```bash
# a bucket to watch
awslocal s3 mb s3://uploads-bucket

# allow S3 to invoke the function
awslocal lambda add-permission \
  --function-name process-upload \
  --statement-id s3invoke \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::uploads-bucket 2>/dev/null || true

# configure the bucket to notify Lambda on new objects
cat > /tmp/notify.json <<'EOF'
{
  "LambdaFunctionConfigurations": [{
    "LambdaFunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:process-upload",
    "Events": ["s3:ObjectCreated:*"]
  }]
}
EOF
awslocal s3api put-bucket-notification-configuration \
  --bucket uploads-bucket --notification-configuration file:///tmp/notify.json

# trigger it: upload a file
echo "trigger me" > /tmp/trigger.txt
awslocal s3 cp /tmp/trigger.txt s3://uploads-bucket/trigger.txt

# check the Lambda logs to see it fired
sleep 2
awslocal logs describe-log-groups --query 'logGroups[].logGroupName'
awslocal logs tail /aws/lambda/process-upload --format short 2>/dev/null || \
  echo "(check LocalStack logs: localstack logs | grep process-upload)"
```

You just built an event-driven pipeline: **event (upload) → trigger →
compute (Lambda) → output (logs)**. This same shape — something happens, a function
reacts — underlies enormous amounts of real AWS architecture (image processing,
data ingestion, notifications, ETL).

---

## Prove it

Save to `evidence/`:

1. `lab03-s3.txt` — output showing your bucket, a synced site, and a presigned URL
2. `lab03-lambda-invoke.txt` — the direct `lambda invoke` result
3. `lab03-trigger.txt` — evidence the S3 upload triggered the Lambda (log output)
4. `lab03-answers.md`:
   - What's the difference between RDS Multi-AZ and a read replica? Which solves availability, which solves scale?
   - Why should a database live in a private subnet, and how does the app reach it?
   - Name three ways to give access to an S3 object *without* making the bucket public.
   - In the S3→Lambda flow, what are the two permissions that had to be in place for the trigger to work?

## Teardown
LocalStack: `localstack stop` clears everything. If you created any **real** RDS
instance while exploring, delete it now:
```bash
aws --profile devops-lab rds delete-db-instance --db-instance-identifier <id> \
  --skip-final-snapshot --delete-automated-backups
```

## Phase 1 complete when
You can build a VPC + server by CLI (Lab 2), write least-privilege IAM (Lab 1), and
wire an event-driven S3→Lambda flow (this lab). You now understand the AWS
primitives everything else in the course composes from. On to containers.

## Going deeper (optional)
- API Gateway → Lambda (an HTTP endpoint backed by a function)
- DynamoDB: put/get items, and when NoSQL beats RDS
- SQS + SNS: decoupling services with queues and topics
