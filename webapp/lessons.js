/* ============================================================
   LESSONS — interactive course content.
   Each lesson: { id, name, phase, env, liveUrl, steps[], exam[] }
   env: 'shell' | 'aws' | 'docker' | 'terraform' | 'k8s' | null
   exam: array of {q, options[], answer, explain} (70% to pass)
   ============================================================ */
const LIVE = 'https://codespaces.new/JPtheDash/Divy-ops';
function ex(q,options,answer,explain){ return {q,options,answer,explain}; }

const LESSONS = {

/* ---------- PHASE 0 ---------- */
'linux-permissions': { name:'Linux permissions', env:'shell', liveUrl:LIVE, steps:[
  {type:'concept',title:'You have a real shell (a mock one)',body:`<p>This is a <strong>simulated Linux terminal</strong> — behaves like the real thing, nothing to install. Type <code>help</code> anytime.</p>`},
  {type:'terminal',instruction:'Run <code>pwd</code> to print your current directory.',goalText:'Run pwd',hint:'Type: pwd',check:(e,l)=>l.trim()==='pwd'},
  {type:'concept',title:'Files & directories',body:`<p><code>mkdir</code> makes a directory, <code>touch</code> makes a file, <code>ls</code> lists them.</p>`},
  {type:'terminal',instruction:'Create a directory called <code>project</code>.',goalText:'Directory "project" exists',hint:'mkdir project',check:e=>e.isDir('project')},
  {type:'terminal',instruction:'Enter it (<code>cd project</code>) then create <code>app.py</code>.',goalText:'app.py exists inside project',hint:'cd project  then  touch app.py',check:e=>e.cwdStr().endsWith('/project')&&e.isFile('app.py')},
  {type:'concept',title:'Reading ls -l',body:`<p><code>-rw-r--r--</code> = type, then <code>rwx</code> for <strong>owner</strong>, <strong>group</strong>, <strong>others</strong>.</p>`},
  {type:'terminal',instruction:'Run <code>ls -l</code>.',goalText:'Run ls -l',hint:'ls -l',check:(e,l)=>/^ls\s+-l/.test(l.trim())},
  {type:'quiz',q:'<code>-rw-r--r--</code> — what can <strong>others</strong> do?',options:['Read and write','Only read','Nothing','Everything'],answer:1,explain:'Last triplet <code>r--</code> = read only.'},
  {type:'concept',title:'chmod & octal',body:`<p><strong>read=4, write=2, execute=1</strong>. So <code>rw-</code>=6, <code>r--</code>=4. <code>-rw-r--r--</code> = <code>644</code>. Secrets are usually <code>600</code>.</p>`},
  {type:'terminal',instruction:'Lock app.py to owner-only: <code>chmod 600 app.py</code>.',goalText:'app.py is mode 600',hint:'chmod 600 app.py',check:e=>e.mode('app.py')===0o600},
  {type:'terminal',instruction:'Now set it to <code>640</code>.',goalText:'app.py is mode 640',hint:'chmod 640 app.py',check:e=>e.mode('app.py')===0o640},
  {type:'checkpoint',instruction:'Run <code>ls -l</code> and paste the app.py line.',placeholder:'-rw-r----- 1 you you 0 Jan 1 10:00 app.py',ok:'Exactly right.',no:'Paste the app.py line (starts with -rw-r-----).',validate:t=>/-rw-r-----/.test(t.replace(/\s+/g,' '))&&/app\.py/.test(t)},
], exam:[
  ex('What does <code>chmod 755 file</code> grant?',['Owner rwx; group & others r-x','Everyone full','Owner read only','Nobody anything'],0,'7=rwx, 5=r-x.'),
  ex('Octal value of <code>rw-</code>?',['5','6','7','4'],1,'4+2=6.'),
  ex('First character <code>d</code> in <code>ls -l</code> means…',['Deleted','Directory','Disk','Default'],1,'d = directory.'),
  ex('Which mode is right for a private secret file?',['777','644','600','755'],2,'600 = owner read/write only.'),
  ex('<code>chmod 640</code> — what can the group do?',['Read and write','Read only','Nothing','Execute'],1,'4 = read only for group.'),
  ex('What command changes permissions?',['chown','chmod','chgrp','chroot'],1,'chmod changes mode.'),
  ex('Execute bit on a <em>directory</em> means…',['Run it as a program','Enter/traverse it','Delete it','Encrypt it'],1,'x on a dir = traverse.'),
  ex('Who can read <code>-rw-------</code>?',['Everyone','Only the owner','The group','Nobody'],1,'600 = owner only.'),
]},

'linux-cli': { name:'Linux CLI essentials', env:'shell', liveUrl:LIVE, steps:[
  {type:'concept',title:'Living in the shell',body:`<p>Navigate, create, inspect, and redirect output — the everyday moves.</p>`},
  {type:'terminal',instruction:'Find out who you are with <code>whoami</code>.',goalText:'Run whoami',hint:'whoami',check:(e,l)=>l.trim()==='whoami'},
  {type:'terminal',instruction:'Make a workspace and enter it: <code>mkdir workspace</code> then <code>cd workspace</code>.',goalText:'Inside workspace',hint:'mkdir workspace ; cd workspace',check:e=>e.cwdStr().endsWith('/workspace')},
  {type:'concept',title:'Redirection',body:`<p><code>echo "text" > file</code> writes text into a file (creating/overwriting).</p>`},
  {type:'terminal',instruction:'Create a config: <code>echo "env=dev" > config.txt</code>.',goalText:'config.txt exists',hint:'echo "env=dev" > config.txt',check:e=>e.isFile('config.txt')},
  {type:'terminal',instruction:'Read it back: <code>cat config.txt</code>.',goalText:'Run cat config.txt',hint:'cat config.txt',check:(e,l)=>/^cat\s+config\.txt/.test(l.trim())},
  {type:'quiz',q:'<code>echo "hi" > f.txt</code> when f.txt exists?',options:['Appends','Overwrites the file','Errors','Nothing'],answer:1,explain:'Single > overwrites; >> appends.'},
], exam:[
  ex('Which prints the current directory?',['ls','pwd','cd','cat'],1,'pwd.'),
  ex('Append to a file without overwriting?',['>','>>','<','|'],1,'>> appends.'),
  ex('Show a file’s contents?',['cat','touch','mkdir','rm'],0,'cat.'),
  ex('Create an empty file?',['mkdir','touch','echo','cd'],1,'touch.'),
  ex('Move into a directory?',['cd','ls','mv','go'],0,'cd.'),
  ex('The <code>|</code> symbol does what?',['Redirects to a file','Pipes one command’s output into another','Comments','Nothing'],1,'Pipe.'),
  ex('Delete a file?',['rm','del','drop','clear'],0,'rm.'),
  ex('<code>ls -l</code> vs <code>ls</code>?',['No difference','-l shows long/detailed listing','-l lists less','-l is invalid'],1,'-l = long format.'),
]},

'git-basics': { name:'Git basics', env:'shell', liveUrl:LIVE, steps:[
  {type:'concept',title:'Git tracks your work',body:`<p>Git records snapshots so you can branch, review, and roll back.</p>`},
  {type:'terminal',instruction:'Initialize a repo: <code>git init</code>.',goalText:'Repo initialized',hint:'git init',check:e=>e.git.inited},
  {type:'terminal',instruction:'Create and stage a file: <code>touch README.md</code> then <code>git add README.md</code>.',goalText:'A file is staged',hint:'touch README.md ; git add README.md',check:e=>e.git.staged.length>0},
  {type:'concept',title:'Commits',body:`<p><code>git add</code> stages; <code>git commit -m</code> records a snapshot.</p>`},
  {type:'terminal',instruction:'Commit: <code>git commit -m "first commit"</code>.',goalText:'At least one commit',hint:'git commit -m "first commit"',check:e=>e.git.commits.length>0},
  {type:'terminal',instruction:'See history: <code>git log --oneline</code>.',goalText:'Run git log',hint:'git log --oneline',check:(e,l)=>/^git\s+log/.test(l.trim())},
  {type:'concept',title:'Branches',body:`<p><code>git checkout -b name</code> creates and switches to a branch.</p>`},
  {type:'terminal',instruction:'Create a branch: <code>git checkout -b feature/login</code>.',goalText:'On a new branch',hint:'git checkout -b feature/login',check:e=>e.git.branch!=='main'},
], exam:[
  ex('<code>git add</code> does what?',['Uploads to GitHub','Stages changes for commit','Deletes a file','Creates a branch'],1,'Stages.'),
  ex('Record a snapshot with a message?',['git save','git commit -m','git push','git stage'],1,'git commit -m.'),
  ex('Upload commits to a remote?',['git push','git pull','git add','git log'],0,'git push.'),
  ex('Create and switch to a branch?',['git branch -x','git checkout -b name','git switch --make','git new'],1,'checkout -b.'),
  ex('You pushed a secret. Enough to just delete the commit?',['Yes','No — rotate the secret; clones/history may keep it'],1,'Rotate first.'),
  ex('See commit history compactly?',['git history','git log --oneline','git show all','git list'],1,'log --oneline.'),
  ex('What does a commit represent?',['A live server','A saved snapshot of the project','A branch','A remote'],1,'Snapshot.'),
  ex('Merge vs rebase — rebase produces…',['A merge bubble','A linear history','A deleted branch','No change'],1,'Linear history.'),
]},

'networking-cidr': { name:'Networking & CIDR', env:null, liveUrl:LIVE, steps:[
  {type:'concept',title:'Why networking matters',body:`<p>CIDR is how IP ranges are sliced into networks — the base for AWS VPCs.</p>`},
  {type:'concept',title:'CIDR in one minute',body:`<p><code>10.0.0.0/16</code> = first 16 bits are network. Bigger prefix = smaller network. /16=65,536, /24=256, /28=16 addresses.</p>`},
  {type:'quiz',q:'How many addresses in a <code>/24</code>?',options:['16','256','1024','65536'],answer:1,explain:'2^8 = 256.'},
  {type:'cidr',instruction:'Set the calculator to <code>10.0.0.0/16</code> split into 4.',base:'10.0.0.0/16',task:{prompt:'CIDR of the <strong>first</strong> subnet?',answer:'10.0.0.0/18',placeholder:'e.g. 10.0.0.0/18'}},
  {type:'quiz',q:'Where does a database go?',options:['Public subnet','Private subnet'],answer:1,explain:'Private — not internet-reachable.'},
  {type:'concept',title:'Security groups vs NACLs',body:`<p>SG = stateful, per-instance. NACL = stateless, per-subnet.</p>`},
], exam:[
  ex('Addresses in a <code>/28</code>?',['8','16','32','64'],1,'2^4 = 16.'),
  ex('Bigger prefix number means…',['Bigger network','Smaller network','Same size','Invalid'],1,'Smaller.'),
  ex('What makes a subnet public?',['Its name','Route table route to an internet gateway','More addresses','Region'],1,'Route to IGW.'),
  ex('Security group is…',['Stateless, per-subnet','Stateful, per-instance','A DNS record','A load balancer'],1,'Stateful per-instance.'),
  ex('You allow inbound 80 on an SG. Return traffic?',['Needs an outbound rule','Auto-allowed (stateful)'],1,'Auto-allowed.'),
  ex('A NAT gateway lets private subnets…',['Receive internet traffic','Reach out to the internet','Store files','Run containers'],1,'Egress to internet.'),
  ex('Which is a valid VPC CIDR?',['10.0.0.0/16','256.0.0.0/8','10.0.0.0/33','abc/16'],0,'10.0.0.0/16.'),
  ex('Databases belong in a…',['Public subnet','Private subnet','NAT gateway','Route table'],1,'Private subnet.'),
]},

/* ---------- PHASE 1 (AWS) ---------- */
'aws-iam-cli': { name:'AWS IAM & the CLI', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'A mock AWS CLI',body:`<p>This simulates <code>awslocal</code>. Swap for <code>aws</code> and it works on a real account.</p>`},
  {type:'terminal',instruction:'Confirm identity: <code>awslocal sts get-caller-identity</code>.',goalText:'Run sts get-caller-identity',hint:'awslocal sts get-caller-identity',check:(e,l)=>/sts\s+get-caller-identity/.test(l)},
  {type:'concept',title:'IAM',body:`<p>Users, groups, <strong>roles</strong> (assumed, preferred), and policies (JSON rules).</p>`},
  {type:'terminal',instruction:'Create user alice: <code>awslocal iam create-user --user-name alice</code>.',goalText:'User "alice" exists',hint:'awslocal iam create-user --user-name alice',check:e=>e.hasUser('alice')},
  {type:'terminal',instruction:'Create a policy: <code>awslocal iam create-policy --policy-name S3ReadOne --policy-document file:///tmp/p.json</code>.',goalText:'Policy "S3ReadOne" exists',hint:'awslocal iam create-policy --policy-name S3ReadOne --policy-document file:///tmp/p.json',check:e=>e.hasPolicy('S3ReadOne')},
  {type:'terminal',instruction:'Create a role: <code>awslocal iam create-role --role-name ec2-app-role --assume-role-policy-document file:///tmp/trust.json</code>.',goalText:'Role exists',hint:'awslocal iam create-role --role-name ec2-app-role --assume-role-policy-document file:///tmp/trust.json',check:e=>e.hasRole('ec2-app-role')},
], exam:[
  ex('Prefer a role over stored keys because…',['Roles are free','Short-lived creds, nothing long-term to leak','Keys don’t work','No reason'],1,'Temporary creds.'),
  ex('<code>"Action":"*","Resource":"*"</code> is…',['Least privilege','Full access — avoid it','Invalid','Read only'],1,'Grants everything.'),
  ex('An IAM user is best for…',['Temporary access','A person or app with long-term creds','A subnet','A bucket'],1,'Long-term identity.'),
  ex('A trust policy defines…',['What actions are allowed','Who can assume the role','The region','The bucket name'],1,'Who can assume.'),
  ex('Least privilege means…',['Grant everything just in case','Grant the minimum needed','No access at all','Admin for all'],1,'Minimum needed.'),
  ex('Which issues temporary credentials?',['S3','STS','EC2','RDS'],1,'STS.'),
  ex('Never use the ___ user for daily work.',['IAM','root','admin','service'],1,'root.'),
  ex('Policies are written in…',['YAML','JSON','XML','TOML'],1,'JSON.'),
]},

'aws-s3': { name:'AWS S3 hands-on', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'S3 = object storage',body:`<p>Objects in buckets — artifacts, backups, static sites, logs.</p>`},
  {type:'terminal',instruction:'Create a bucket: <code>awslocal s3 mb s3://devops-lab-data</code>.',goalText:'Bucket created',hint:'awslocal s3 mb s3://devops-lab-data',check:e=>e.hasBucket('devops-lab-data')},
  {type:'terminal',instruction:'Upload: <code>awslocal s3 cp hello.txt s3://devops-lab-data/hello.txt</code>.',goalText:'Bucket has an object',hint:'awslocal s3 cp hello.txt s3://devops-lab-data/hello.txt',check:e=>e.bucketHasObjects('devops-lab-data')},
  {type:'terminal',instruction:'List it: <code>awslocal s3 ls s3://devops-lab-data/</code>.',goalText:'Run s3 ls',hint:'awslocal s3 ls s3://devops-lab-data/',check:(e,l)=>/s3\s+ls/.test(l)},
  {type:'quiz',q:'Safest way to share ONE object temporarily?',options:['Make the bucket public','A presigned URL','Email the keys','Disable encryption'],answer:1,explain:'Presigned URL.'},
  {type:'terminal',instruction:'Presign: <code>awslocal s3 presign s3://devops-lab-data/hello.txt</code>.',goalText:'Run s3 presign',hint:'awslocal s3 presign s3://devops-lab-data/hello.txt',check:(e,l)=>/s3\s+presign/.test(l)},
], exam:[
  ex('The #1 real-world S3 mistake is…',['Too many buckets','Accidentally public buckets','Small files','Wrong region'],1,'Public buckets.'),
  ex('S3 stores…',['Blocks','Objects in buckets','Rows','Containers'],1,'Objects.'),
  ex('Share one object without public access?',['Presigned URL','Bucket ACL public','NAT gateway','Security group'],0,'Presigned URL.'),
  ex('Move old data to cheaper storage automatically with…',['Versioning','Lifecycle rules','Presign','Replication'],1,'Lifecycle rules.'),
  ex('Versioning protects against…',['Cost','Accidental overwrite/delete','Latency','Region loss'],1,'Overwrite/delete.'),
  ex('"Block Public Access" should usually be…',['Off','On','Ignored','Deleted'],1,'On.'),
  ex('Upload a file to S3 with…',['s3 mb','s3 cp','s3 rm','s3 presign'],1,'s3 cp.'),
  ex('S3 is good for all EXCEPT…',['Backups','Static site hosting','A relational database','Log storage'],2,'Not a relational DB.'),
]},

'aws-vpc': { name:'AWS VPC & networking', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'Build a network by hand',body:`<p>Create a VPC, subnets, and an internet gateway in the mock CLI.</p>`},
  {type:'cidr',instruction:'Plan the addressing. Split <code>10.0.0.0/16</code> into 4.',base:'10.0.0.0/16',task:{prompt:'CIDR of the <strong>second</strong> subnet?',answer:'10.0.64.0/18',placeholder:'e.g. 10.0.64.0/18'}},
  {type:'terminal',instruction:'Create the VPC: <code>awslocal ec2 create-vpc --cidr-block 10.0.0.0/16</code>.',goalText:'A VPC exists',hint:'awslocal ec2 create-vpc --cidr-block 10.0.0.0/16',check:e=>e.vpcCount()>0},
  {type:'terminal',instruction:'Add a subnet: <code>awslocal ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24</code>.',goalText:'A subnet exists',hint:'awslocal ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24',check:e=>e.subnetCount()>0},
  {type:'terminal',instruction:'Create an internet gateway: <code>awslocal ec2 create-internet-gateway</code>.',goalText:'Run create-internet-gateway',hint:'awslocal ec2 create-internet-gateway',check:(e,l)=>/create-internet-gateway/.test(l)},
  {type:'terminal',instruction:'Launch a server: <code>awslocal ec2 run-instances --image-id ami-123 --instance-type t2.micro</code>.',goalText:'Run run-instances',hint:'awslocal ec2 run-instances --image-id ami-123 --instance-type t2.micro',check:(e,l)=>/run-instances/.test(l)},
], exam:[
  ex('What makes a subnet public?',['Its name','Route table route to the IGW','Size','Region'],1,'Route to IGW.'),
  ex('Free-Tier instance type?',['m5.large','t2.micro','c5.xlarge','r5.large'],1,'t2.micro.'),
  ex('A VPC is…',['A database','Your private network in AWS','A container','A user'],1,'Private network.'),
  ex('Subnets live in…',['One region only','A single AZ each','All AZs at once','The internet'],1,'One AZ each.'),
  ex('A NAT gateway is used for…',['Inbound web traffic','Private subnet outbound internet','DNS','Storage'],1,'Private egress.'),
  ex('A stopped instance still bills for…',['Nothing','Its EBS volume','CPU','RAM'],1,'EBS volume.'),
  ex('To stop all charges, you should ___ an instance.',['pause','terminate','hibernate','rename'],1,'terminate.'),
  ex('Security group vs NACL: the SG is…',['Stateless subnet firewall','Stateful instance firewall','A DNS record','A gateway'],1,'Stateful instance firewall.'),
]},

'aws-lambda': { name:'AWS Lambda & events', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'Serverless functions',body:`<p>Lambda runs code with no servers — pay per invocation.</p>`},
  {type:'terminal',instruction:'Create a function: <code>awslocal lambda create-function --function-name process-upload --runtime python3.12 --handler h --role arn:aws:iam::000000000000:role/lambda-role --zip-file fileb:///tmp/fn.zip</code>.',goalText:'A function exists',hint:'awslocal lambda create-function --function-name process-upload --runtime python3.12 --handler h --role arn:aws:iam::000000000000:role/lambda-role --zip-file fileb:///tmp/fn.zip',check:e=>e.fnCount()>0},
  {type:'terminal',instruction:'Invoke it: <code>awslocal lambda invoke --function-name process-upload --payload {} /tmp/out.json</code>.',goalText:'Run lambda invoke',hint:'awslocal lambda invoke --function-name process-upload --payload {} /tmp/out.json',check:(e,l)=>/lambda\s+invoke/.test(l)},
  {type:'concept',title:'Event-driven glue',body:`<p>S3 upload → triggers Lambda → processes file. Event → trigger → compute → output.</p>`},
], exam:[
  ex('How does Lambda get permissions?',['Keys in code','An execution role','Admin by default','It can’t'],1,'Execution role.'),
  ex('You pay for Lambda…',['Per hour always on','Per invocation/duration','Per GB stored','A flat monthly fee'],1,'Per invocation.'),
  ex('S3→Lambda trigger needs…',['Nothing','Invoke permission + bucket notification','A NAT gateway','A VPC only'],1,'Permission + notification.'),
  ex('Lambda is best for…',['Long 10-hour jobs','Short event-driven tasks','Persistent databases','GPU training clusters'],1,'Short event tasks.'),
  ex('A "cold start" is…',['A billing term','Delay initializing an idle function','A crash','A region'],1,'Init latency.'),
  ex('Which can trigger a Lambda?',['S3 upload','API Gateway','EventBridge','All of these'],3,'All can.'),
  ex('Serverless means…',['No servers exist','You don’t manage the servers','It’s free','No code'],1,'You don’t manage servers.'),
  ex('Lambda + API Gateway gives you…',['A database','An HTTP endpoint backed by a function','A container registry','A VPC'],1,'HTTP endpoint.'),
]},

/* ---------- PHASE 2 · CONTAINERS ---------- */
'docker-basics': { name:'Docker basics', env:'docker', liveUrl:LIVE, steps:[
  {type:'concept',title:'Containers, quickly',body:`<p>A container packages your app with its dependencies so it runs the same everywhere. You <strong>build</strong> an image, then <strong>run</strong> containers from it.</p>`},
  {type:'terminal',instruction:'Build an image tagged <code>web</code>: <code>docker build -t web .</code>',goalText:'Image "web" built',hint:'docker build -t web .',check:e=>e.hasImage('web')},
  {type:'terminal',instruction:'List images: <code>docker images</code>.',goalText:'Run docker images',hint:'docker images',check:(e,l)=>/docker\s+images/.test(l)},
  {type:'terminal',instruction:'Run it detached with a port: <code>docker run -d -p 3000:3000 --name app web</code>.',goalText:'A container from "web" is running',hint:'docker run -d -p 3000:3000 --name app web',check:e=>e.running('web')||e.running('app')},
  {type:'terminal',instruction:'See running containers: <code>docker ps</code>.',goalText:'Run docker ps',hint:'docker ps',check:(e,l)=>/docker\s+ps/.test(l)},
  {type:'terminal',instruction:'Stop it: <code>docker stop app</code>.',goalText:'Run docker stop',hint:'docker stop app',check:(e,l)=>/docker\s+stop/.test(l)},
], exam:[
  ex('An image is…',['A running process','A packaged template you run containers from','A network','A volume'],1,'Template.'),
  ex('Build an image from a Dockerfile with…',['docker run','docker build','docker ps','docker pull'],1,'docker build.'),
  ex('<code>-d</code> in docker run means…',['Delete','Detached (background)','Debug','Disk'],1,'Detached.'),
  ex('<code>-p 3000:3000</code> maps…',['CPU','Host port : container port','Two disks','Two images'],1,'Port mapping.'),
  ex('List running containers with…',['docker images','docker ps','docker ls','docker top'],1,'docker ps.'),
  ex('A container vs a VM: a container…',['Includes a full OS kernel','Shares the host kernel, lighter','Is slower','Needs a hypervisor'],1,'Shares kernel.'),
  ex('Tag an image with…',['-t','-n','-i','-x'],0,'-t name.'),
  ex('Which pulls an image from a registry?',['docker get','docker pull','docker fetch','docker load'],1,'docker pull.'),
]},

'docker-images': { name:'Docker images done right', env:'docker', liveUrl:LIVE, steps:[
  {type:'concept',title:'Smaller & safer images',body:`<p>Use minimal bases (alpine, distroless), <strong>multi-stage builds</strong>, a non-root <code>USER</code>, and a <code>.dockerignore</code>. Smaller image = smaller attack surface and faster deploys.</p>`},
  {type:'terminal',instruction:'Build a versioned image: <code>docker build -t web:1.0 .</code>',goalText:'Image "web:1.0" built',hint:'docker build -t web:1.0 .',check:e=>e.hasImage('web')},
  {type:'terminal',instruction:'Lint the Dockerfile: <code>hadolint</code>.',goalText:'Run hadolint',hint:'hadolint',check:(e,l)=>/hadolint/.test(l)},
  {type:'quiz',q:'Why run containers as a <strong>non-root</strong> user?',options:['Faster','Limits damage if the app is compromised','Smaller image','Required by Docker'],answer:1,explain:'Least privilege at runtime.'},
  {type:'concept',title:'Tags & digests',body:`<p>Tags like <code>:1.0</code> are mutable; digests (<code>@sha256:…</code>) pin an exact image. Pin digests in production for reproducibility.</p>`},
], exam:[
  ex('Multi-stage builds help by…',['Adding more layers','Keeping build tools out of the final image','Running as root','Slowing builds'],1,'Smaller final image.'),
  ex('Smallest typical base?',['ubuntu','alpine/distroless','windows','centos'],1,'alpine/distroless.'),
  ex('A <code>.dockerignore</code> file…',['Ignores containers','Excludes files from the build context','Deletes images','Sets ports'],1,'Excludes files.'),
  ex('Pin an exact image with a…',['tag','digest (@sha256)','name','port'],1,'Digest.'),
  ex('Running as non-root is an example of…',['Speed tuning','Least privilege','Caching','Load balancing'],1,'Least privilege.'),
  ex('A smaller image means…',['Bigger attack surface','Smaller attack surface + faster pulls','Slower deploys','More CVEs'],1,'Smaller/faster.'),
  ex('Which lints a Dockerfile?',['trivy','hadolint','syft','cosign'],1,'hadolint.'),
  ex('Tags are ___ ; digests are ___.',['immutable / mutable','mutable / immutable','both mutable','both immutable'],1,'mutable / immutable.'),
]},

/* ---------- PHASE 3 · IaC ---------- */
'terraform-basics': { name:'Terraform basics', env:'terraform', liveUrl:LIVE, steps:[
  {type:'concept',title:'Infrastructure as code',body:`<p>Terraform describes infra in files, then creates it. The loop: <code>init</code> → <code>plan</code> → <code>apply</code> → <code>destroy</code>.</p>`},
  {type:'terminal',instruction:'Initialize: <code>terraform init</code>.',goalText:'Initialized',hint:'terraform init',check:e=>e.inited()},
  {type:'terminal',instruction:'Preview changes: <code>terraform plan</code>.',goalText:'Run terraform plan',hint:'terraform plan',check:(e,l)=>/terraform\s+plan/.test(l)},
  {type:'terminal',instruction:'Create the infra: <code>terraform apply -auto-approve</code>.',goalText:'Resources applied',hint:'terraform apply -auto-approve',check:e=>e.applied()},
  {type:'terminal',instruction:'List what exists: <code>terraform state list</code>.',goalText:'Run terraform state list',hint:'terraform state list',check:(e,l)=>/state\s+list/.test(l)},
  {type:'terminal',instruction:'Tear it all down: <code>terraform destroy -auto-approve</code>.',goalText:'Run terraform destroy',hint:'terraform destroy -auto-approve',check:(e,l)=>/terraform\s+destroy/.test(l)},
], exam:[
  ex('Correct Terraform order?',['apply → init → plan','init → plan → apply','plan → destroy → init','apply → plan → init'],1,'init → plan → apply.'),
  ex('<code>terraform plan</code> does what?',['Creates infra','Shows what WOULD change','Deletes infra','Nothing'],1,'Preview.'),
  ex('Terraform state is…',['Just logs','A record of managed resources — sensitive','A backup','A container'],1,'Sensitive record.'),
  ex('Tear everything down with…',['terraform stop','terraform destroy','terraform rm','terraform end'],1,'destroy.'),
  ex('Store team state safely in…',['A local file in git','Remote backend (e.g. S3 + lock)','Email','A container'],1,'Remote backend.'),
  ex('IaC’s main benefit?',['Click-ops','Repeatable, reviewable infrastructure','Faster CPUs','Cheaper RAM'],1,'Repeatable.'),
  ex('OpenTofu is…',['A container tool','An open-source Terraform-compatible fork','A cloud','A linter'],1,'OSS fork.'),
  ex('<code>apply</code> without <code>-auto-approve</code> will…',['Fail','Ask for confirmation','Destroy','Skip'],1,'Prompt to confirm.'),
]},

'terraform-state': { name:'Terraform state & modules', env:'terraform', liveUrl:LIVE, steps:[
  {type:'concept',title:'State & remote backends',body:`<p>Terraform tracks reality in a <strong>state file</strong>. For teams, store it in a <strong>remote backend</strong> (S3 + DynamoDB lock) so nobody clobbers each other and secrets aren’t in git.</p>`},
  {type:'terminal',instruction:'Initialize and apply: run <code>terraform init</code>, then <code>terraform apply -auto-approve</code>.',goalText:'Resources applied',hint:'terraform init ; terraform apply -auto-approve',check:e=>e.applied()},
  {type:'terminal',instruction:'Inspect state: <code>terraform state list</code>.',goalText:'Run terraform state list',hint:'terraform state list',check:(e,l)=>/state\s+list/.test(l)},
  {type:'concept',title:'Modules',body:`<p>A <strong>module</strong> is reusable Terraform (e.g. a "vpc" module) you call with different inputs across dev/stage/prod. DRY infrastructure.</p>`},
  {type:'quiz',q:'Why is the state file sensitive?',options:['It’s huge','It can contain resource attributes incl. secrets','It’s encrypted','It’s a log'],answer:1,explain:'Never commit it publicly.'},
], exam:[
  ex('A remote backend gives you…',['Slower applies','Shared state + locking','No state','More cost only'],1,'Shared + locking.'),
  ex('State locking prevents…',['Slow plans','Two people applying at once','Drift','Secrets'],1,'Concurrent applies.'),
  ex('A Terraform module is…',['A provider','Reusable, parameterized config','A state file','A backend'],1,'Reusable config.'),
  ex('Drift means…',['A new region','Real infra diverged from code','A module','A lock'],1,'Reality ≠ code.'),
  ex('Keep secrets out of state by…',['Committing them','Using secret managers / not hardcoding','Emailing them','Ignoring it'],1,'Secret managers.'),
  ex('Common remote backend on AWS?',['S3 + DynamoDB','EC2 + RDS','Lambda','ECR'],0,'S3 + DynamoDB.'),
  ex('Modules help you follow the ___ principle.',['WET','DRY','LIFO','FIFO'],1,'DRY.'),
  ex('You should ___ commit terraform.tfstate to a public repo.',['always','never','sometimes','only Fridays'],1,'never.'),
]},

/* ---------- PHASE 4 · CI/CD ---------- */
'cicd-pipeline': { name:'CI/CD pipelines', env:null, liveUrl:LIVE, steps:[
  {type:'concept',title:'What a pipeline is',body:`<p>A pipeline runs on every push: <strong>build → test → deploy</strong>, automatically. Think of it as a test suite that also ships software.</p>`},
  {type:'concept',title:'GitHub Actions shape',body:`<p>A workflow is YAML in <code>.github/workflows/</code>: an <code>on:</code> trigger, one or more <code>jobs:</code>, each with <code>runs-on:</code> and <code>steps:</code>.</p>`},
  {type:'checkpoint',instruction:'Write a trigger that runs the workflow on pushes AND pull requests. Paste your <code>on:</code> block.',placeholder:'on:\n  push:\n  pull_request:',ok:'That triggers on both push and PR.',no:'Include on:, and both push and pull_request.',validate:t=>/on\s*:/.test(t)&&/push/.test(t)&&/pull_request/.test(t)},
  {type:'quiz',q:'To deploy to AWS from Actions WITHOUT long-lived keys, use…',options:['Hardcoded secrets','OIDC federation to assume a role','A public bucket','Root credentials'],answer:1,explain:'OIDC = short-lived, keyless.'},
  {type:'checkpoint',instruction:'Write a minimal job that runs on Ubuntu and has steps. Paste it.',placeholder:'jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4',ok:'That’s a valid job skeleton.',no:'Include runs-on and steps.',validate:t=>/runs-on/.test(t)&&/steps/.test(t)},
  {type:'quiz',q:'Third-party Actions should be pinned by…',options:['Latest tag','Commit SHA','Branch name','Nothing'],answer:1,explain:'SHA pinning prevents supply-chain tampering.'},
], exam:[
  ex('A CI pipeline mainly…',['Writes code for you','Automatically builds/tests/deploys on changes','Stores files','Replaces git'],1,'Automates build/test/deploy.'),
  ex('GitHub Actions workflows live in…',['/ci','.github/workflows/','/pipeline','root'],1,'.github/workflows/.'),
  ex('Deploy to AWS keylessly with…',['OIDC role assumption','Committed access keys','A public bucket','FTP'],0,'OIDC.'),
  ex('Least-privilege pipeline tokens matter because…',['Speed','A leaked token’s blast radius is limited','Cost','Style'],1,'Limit blast radius.'),
  ex('Pin third-party actions by…',['tag','commit SHA','star count','nothing'],1,'SHA.'),
  ex('Blue/green deployment lets you…',['Delete prod','Switch traffic to a new version, roll back fast','Skip tests','Avoid CI'],1,'Fast rollback.'),
  ex('A gate that everyone bypasses is…',['Great','Worse than none (false assurance)','Required','Free'],1,'False assurance.'),
  ex('Caching dependencies in CI…',['Slows builds','Speeds builds','Breaks tests','Adds secrets'],1,'Speeds builds.'),
]},

/* ---------- PHASE 5 · KUBERNETES ---------- */
'kubernetes-basics': { name:'Kubernetes basics', env:'k8s', liveUrl:LIVE, steps:[
  {type:'concept',title:'Kubernetes in a nutshell',body:`<p>K8s runs containers across a cluster. A <strong>deployment</strong> manages <strong>pods</strong> (your containers); a <strong>service</strong> gives them a stable network endpoint.</p>`},
  {type:'terminal',instruction:'Create a deployment: <code>kubectl create deployment web --image=nginx</code>.',goalText:'Deployment "web" exists',hint:'kubectl create deployment web --image=nginx',check:e=>e.hasDeployment('web')},
  {type:'terminal',instruction:'See the pods: <code>kubectl get pods</code>.',goalText:'Run kubectl get pods',hint:'kubectl get pods',check:(e,l)=>/get\s+pods/.test(l)},
  {type:'terminal',instruction:'Scale to 3 replicas: <code>kubectl scale deployment web --replicas=3</code>.',goalText:'web has 3 replicas',hint:'kubectl scale deployment web --replicas=3',check:e=>e.replicas('web')>=3},
  {type:'terminal',instruction:'Expose it as a service: <code>kubectl expose deployment web --port=80</code>.',goalText:'Service "web" exists',hint:'kubectl expose deployment web --port=80',check:e=>e.hasService('web')},
], exam:[
  ex('The smallest deployable unit in K8s is a…',['Container','Pod','Node','Service'],1,'Pod.'),
  ex('A Deployment…',['Stores data','Manages pods & rollouts','Is a firewall','Is a node'],1,'Manages pods.'),
  ex('A Service provides…',['Storage','A stable network endpoint','Logging','A registry'],1,'Stable endpoint.'),
  ex('Scale a deployment with…',['kubectl grow','kubectl scale --replicas','kubectl add','kubectl big'],1,'scale --replicas.'),
  ex('A readiness probe tells K8s…',['CPU usage','When a pod can receive traffic','The image size','The region'],1,'Ready for traffic.'),
  ex('Rolling updates give you…',['Downtime','Zero-downtime gradual rollout','Data loss','Nothing'],1,'Gradual rollout.'),
  ex('The Horizontal Pod Autoscaler adjusts…',['Node size','Number of pod replicas by load','Disk','Region'],1,'Replica count.'),
  ex('<code>kubectl get pods</code> lists…',['Images','Running pods','Services only','Nodes only'],1,'Pods.'),
]},

'eks': { name:'Amazon EKS', env:'k8s', liveUrl:LIVE, steps:[
  {type:'concept',title:'Managed Kubernetes',body:`<p>EKS runs the Kubernetes control plane for you; you bring worker nodes (EC2 or Fargate). You still use plain <code>kubectl</code>.</p>`},
  {type:'terminal',instruction:'Check the cluster nodes: <code>kubectl get nodes</code>.',goalText:'Run kubectl get nodes',hint:'kubectl get nodes',check:(e,l)=>/get\s+nodes/.test(l)},
  {type:'concept',title:'IRSA',body:`<p><strong>IAM Roles for Service Accounts</strong> let a pod assume an AWS IAM role — least-privilege AWS access without node-wide keys.</p>`},
  {type:'quiz',q:'In EKS, who manages the control plane?',options:['You','AWS','Nobody','The pods'],answer:1,explain:'AWS manages it (for a fee).'},
], exam:[
  ex('EKS manages the…',['Worker nodes','Kubernetes control plane','Your app code','The registry'],1,'Control plane.'),
  ex('EKS worker options include…',['EC2 or Fargate','Only Lambda','Only S3','Only RDS'],0,'EC2 or Fargate.'),
  ex('IRSA gives a pod…',['Node-wide keys','An IAM role with least privilege','Root','Public access'],1,'Scoped IAM role.'),
  ex('The EKS control plane is…',['Free','A paid managed service','Optional','A container'],1,'Paid managed.'),
  ex('You interact with EKS using…',['kubectl','ssh only','the console only','ftp'],0,'kubectl.'),
  ex('Fargate for EKS means…',['You manage nodes','Serverless nodes (no node management)','No pods','No cost'],1,'Serverless nodes.'),
  ex('A good reason to use managed K8s?',['More ops toil','Less control-plane operational burden','Higher risk','No scaling'],1,'Less toil.'),
  ex('Tear down a test EKS cluster because…',['It’s fun','The control plane bills hourly','It’s required','Nodes multiply'],1,'It costs money.'),
]},

/* ---------- PHASE 6 · OBSERVABILITY ---------- */
'observability': { name:'Observability & SRE', env:null, liveUrl:LIVE, steps:[
  {type:'concept',title:'The three pillars',body:`<p><strong>Metrics</strong> (numbers over time), <strong>logs</strong> (events), and <strong>traces</strong> (a request across services). Together they tell you what broke and why.</p>`},
  {type:'quiz',q:'Which shows a single request’s path across services?',options:['Metrics','Logs','Traces','Alarms'],answer:2,explain:'Distributed tracing.'},
  {type:'concept',title:'SLIs, SLOs, error budgets',body:`<p>An <strong>SLI</strong> is a measured indicator (e.g. % successful requests). An <strong>SLO</strong> is your target (e.g. 99.9%). The gap you’re allowed to miss is the <strong>error budget</strong>.</p>`},
  {type:'quiz',q:'You should alert on…',options:['Every metric','Symptoms users feel (SLO breaches)','Nothing','CPU only'],answer:1,explain:'Actionable, symptom-based alerts avoid fatigue.'},
  {type:'concept',title:'Incidents',body:`<p>Detect → mitigate (restore service first) → resolve → blameless postmortem. Fix the system, not the person.</p>`},
], exam:[
  ex('The three pillars of observability are…',['CPU, RAM, disk','Metrics, logs, traces','Dev, stage, prod','Build, test, deploy'],1,'Metrics/logs/traces.'),
  ex('An SLO is…',['A measured value','A target for reliability','A log line','A server'],1,'A target.'),
  ex('AWS-native metrics/logs/alarms service?',['S3','CloudWatch','IAM','ECR'],1,'CloudWatch.'),
  ex('Alert fatigue comes from…',['Too few alerts','Too many non-actionable alerts','No metrics','Traces'],1,'Noisy alerts.'),
  ex('During an incident you first…',['Write the postmortem','Restore service (mitigate)','Blame someone','Close the ticket'],1,'Mitigate first.'),
  ex('A blameless postmortem focuses on…',['Punishing people','Fixing systems & process','Hiding the incident','Nothing'],1,'Systems/process.'),
  ex('An error budget is…',['Money','Allowed unreliability before you slow releases','A metric name','A trace'],1,'Allowed unreliability.'),
  ex('Free local metrics + dashboards stack?',['Prometheus + Grafana','Word + Excel','S3 + RDS','EC2 + ELB'],0,'Prometheus + Grafana.'),
]},

/* ---------- PHASE 7 · CAPSTONE ---------- */
'capstone-review': { name:'Capstone review', env:null, liveUrl:LIVE, steps:[
  {type:'concept',title:'Put it all together',body:`<p>The capstone: a containerized app, infrastructure in Terraform, shipped by a CI/CD pipeline, running on Kubernetes behind a load balancer with autoscaling, and monitored with dashboards and alerts — created and destroyed with one command.</p>`},
  {type:'concept',title:'The senior mindset',body:`<p>Anyone can make it work. The signal that you’re senior: you can explain <em>how it could still break</em>, what it costs, and how you’d roll back. Always tear down to \$0 when done.</p>`},
], exam:[
  ex('One-command up/down proves your infra is…',['Manual','Reproducible as code','Insecure','Expensive'],1,'Reproducible.'),
  ex('Deploy keylessly from CI using…',['OIDC','Committed keys','Root','FTP'],0,'OIDC.'),
  ex('Least privilege applies to…',['Only IAM','IAM, containers, K8s RBAC, pipelines — everywhere','Only S3','Nothing'],1,'Everywhere.'),
  ex('Databases belong in a ___ subnet.',['public','private','NAT','gateway'],1,'private.'),
  ex('A container image should be…',['Huge & root','Minimal & non-root','Unversioned','Public only'],1,'Minimal, non-root.'),
  ex('Terraform state for a team goes in…',['Git (public)','A remote backend with locking','Email','A container'],1,'Remote backend.'),
  ex('You alert on…',['Every metric','User-facing symptoms (SLOs)','Nothing','Only CPU'],1,'SLO symptoms.'),
  ex('During an incident, first…',['Postmortem','Mitigate/restore service','Assign blame','Refactor'],1,'Mitigate.'),
  ex('The biggest beginner cost mistake is…',['Too many commits','Forgetting to tear resources down','Small instances','Using free tier'],1,'Not tearing down.'),
  ex('Best interview evidence is…',['A certificate alone','A working end-to-end project you built','A long resume','Memorized trivia'],1,'A real project.'),
]},

};

const LESSON_ORDER = [
  {phase:'Phase 0 · Foundations', ids:['linux-permissions','linux-cli','git-basics','networking-cidr']},
  {phase:'Phase 1 · AWS Fundamentals', ids:['aws-iam-cli','aws-s3','aws-vpc','aws-lambda']},
  {phase:'Phase 2 · Containers', ids:['docker-basics','docker-images']},
  {phase:'Phase 3 · Infrastructure as Code', ids:['terraform-basics','terraform-state']},
  {phase:'Phase 4 · CI/CD', ids:['cicd-pipeline']},
  {phase:'Phase 5 · Kubernetes', ids:['kubernetes-basics','eks']},
  {phase:'Phase 6 · Observability & SRE', ids:['observability']},
  {phase:'Phase 7 · Capstone', ids:['capstone-review']},
];

if (typeof module!=='undefined') module.exports={LESSONS,LESSON_ORDER};
