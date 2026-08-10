/* ============================================================
   LESSONS — interactive course content.
   Each lesson: { id, name, phase, env, liveUrl, steps[] }
   env: 'shell' (bash+git) | 'aws' | null (concept/quiz/cidr only)
   ============================================================ */
const LIVE = 'https://codespaces.new/JPtheDash/devops-aws-path';

const LESSONS = {

/* ---------- PHASE 0 ---------- */
'linux-permissions': { name:'Linux permissions', phase:'Phase 0 · Foundations', env:'shell', liveUrl:LIVE, steps:[
  {type:'concept',title:'You have a real shell (a mock one)',body:`<p>This is a <strong>simulated Linux terminal</strong> — it behaves like the real thing, nothing to install. You'll type real commands and see real output.</p><div class="callout">Terminal steps won't let you continue until you've run the right command. Type <code>help</code> anytime.</div>`},
  {type:'terminal',instruction:'Run <code>pwd</code> to print your current directory.',goalText:'Run pwd',hint:'Type: pwd',check:(e,l)=>l.trim()==='pwd'},
  {type:'concept',title:'Files & directories',body:`<p><code>mkdir</code> makes a directory, <code>touch</code> makes a file, <code>ls</code> lists them. Let's build a project.</p>`},
  {type:'terminal',instruction:'Create a directory called <code>project</code>.',goalText:'Directory "project" exists',hint:'mkdir project',check:e=>e.isDir('project')},
  {type:'terminal',instruction:'Enter it (<code>cd project</code>) then create <code>app.py</code> with <code>touch</code>.',goalText:'app.py exists inside project',hint:'cd project  then  touch app.py',check:e=>e.cwdStr().endsWith('/project')&&e.isFile('app.py')},
  {type:'concept',title:'Reading ls -l',body:`<p><code>ls -l</code> shows permissions in the first column. <code>-rw-r--r--</code> = type, then <code>rwx</code> for <strong>owner</strong>, <strong>group</strong>, <strong>others</strong>.</p>`},
  {type:'terminal',instruction:'Run <code>ls -l</code> and look at app.py.',goalText:'Run ls -l',hint:'ls -l',check:(e,l)=>/^ls\s+-l/.test(l.trim())},
  {type:'quiz',q:'<code>-rw-r--r--</code> — what can <strong>others</strong> (last triplet) do?',options:['Read and write','Only read','Nothing','Everything'],answer:1,explain:'The last triplet <code>r--</code> is read-only. Owner has <code>rw-</code>, group and others get <code>r--</code>.'},
  {type:'concept',title:'chmod & octal',body:`<p>Octal: <strong>read=4, write=2, execute=1</strong>. So <code>rw-</code>=6, <code>r--</code>=4, <code>rwx</code>=7. Thus <code>-rw-r--r--</code> = <code>644</code>.</p><div class="callout">Secrets are usually <code>600</code> — owner only.</div>`},
  {type:'terminal',instruction:'Lock app.py to owner-only: <code>chmod 600 app.py</code>.',goalText:'app.py is mode 600',hint:'chmod 600 app.py',check:e=>e.mode('app.py')===0o600},
  {type:'quiz',q:'What does <code>chmod 755</code> grant?',options:['Owner rwx; group & others r-x','Everyone full access','Owner read only','Nobody anything'],answer:0,explain:'7=rwx owner, 5=r-x (4+1) for group and others. Classic for scripts and directories.'},
  {type:'terminal',instruction:'Set it to <code>640</code>: <code>chmod 640 app.py</code>.',goalText:'app.py is mode 640',hint:'chmod 640 app.py',check:e=>e.mode('app.py')===0o640},
  {type:'checkpoint',instruction:'Run <code>ls -l</code> again and paste the app.py line below.',placeholder:'-rw-r----- 1 you you 0 Jan 1 10:00 app.py',ok:'Those permissions are exactly right.',no:'Run ls -l and paste the full app.py line (starts with -rw-r-----).',validate:t=>/-rw-r-----/.test(t.replace(/\s+/g,' '))&&/app\.py/.test(t)},
  {type:'concept',title:'That\'s real Linux',body:`<p>You navigated a filesystem, read <code>ls -l</code>, and set permissions with octal <code>chmod</code> — used on every server and container. Hit <strong>Launch live env</strong> to try it for real.</p>`}
]},

'linux-cli': { name:'Linux CLI essentials', phase:'Phase 0 · Foundations', env:'shell', liveUrl:LIVE, steps:[
  {type:'concept',title:'Living in the shell',body:`<p>DevOps happens in the terminal. This lesson drills the everyday moves: navigate, create, inspect, and redirect output.</p>`},
  {type:'terminal',instruction:'Find out who you are with <code>whoami</code>.',goalText:'Run whoami',hint:'whoami',check:(e,l)=>l.trim()==='whoami'},
  {type:'terminal',instruction:'Make a workspace: <code>mkdir workspace</code>, then <code>cd workspace</code>.',goalText:'You are inside workspace',hint:'mkdir workspace ; cd workspace',check:e=>e.cwdStr().endsWith('/workspace')},
  {type:'concept',title:'Redirection: writing to files',body:`<p><code>echo "text" > file</code> writes text into a file (creating/overwriting it). This is how scripts and configs get generated.</p>`},
  {type:'terminal',instruction:'Create a config file: <code>echo "env=dev" > config.txt</code>.',goalText:'config.txt exists',hint:'echo "env=dev" > config.txt',check:e=>e.isFile('config.txt')},
  {type:'terminal',instruction:'Read it back with <code>cat config.txt</code>.',goalText:'Run cat config.txt',hint:'cat config.txt',check:(e,l)=>/^cat\s+config\.txt/.test(l.trim())},
  {type:'quiz',q:'What does <code>echo "hi" > notes.txt</code> do if notes.txt already exists?',options:['Appends "hi" to the end','Overwrites the whole file with "hi"','Errors out','Nothing'],answer:1,explain:'A single <code>></code> overwrites. Use <code>>></code> to append instead.'},
  {type:'terminal',instruction:'List everything in long form: <code>ls -l</code>.',goalText:'Run ls -l',hint:'ls -l',check:(e,l)=>/^ls\s+-l/.test(l.trim())},
  {type:'concept',title:'You\'ve got the basics',body:`<p>Navigation, file creation, redirection, inspection — the moves you'll repeat thousands of times. Next up: version control with Git.</p>`}
]},

'git-basics': { name:'Git basics', phase:'Phase 0 · Foundations', env:'shell', liveUrl:LIVE, steps:[
  {type:'concept',title:'Git tracks your work',body:`<p>Git records snapshots of your project so you can branch, review, and roll back. Every DevOps workflow runs on it. Let's make a repo.</p>`},
  {type:'terminal',instruction:'Initialize a repository: <code>git init</code>.',goalText:'Repo initialized',hint:'git init',check:e=>e.git.inited},
  {type:'terminal',instruction:'Create a file (<code>touch README.md</code>) and stage it (<code>git add README.md</code>).',goalText:'A file is staged',hint:'touch README.md ; git add README.md',check:e=>e.git.staged.length>0},
  {type:'concept',title:'Commits',body:`<p>A commit is a saved snapshot with a message. Staging (<code>git add</code>) picks what goes in; <code>git commit -m</code> records it.</p>`},
  {type:'terminal',instruction:'Make your first commit: <code>git commit -m "first commit"</code>.',goalText:'At least one commit exists',hint:'git commit -m "first commit"',check:e=>e.git.commits.length>0},
  {type:'terminal',instruction:'See history: <code>git log --oneline</code>.',goalText:'Run git log',hint:'git log --oneline',check:(e,l)=>/^git\s+log/.test(l.trim())},
  {type:'quiz',q:'What does <code>git add</code> do?',options:['Uploads to GitHub','Stages changes for the next commit','Deletes a file','Creates a branch'],answer:1,explain:'<code>git add</code> stages changes. <code>git commit</code> records them; <code>git push</code> uploads to a remote.'},
  {type:'concept',title:'Branches',body:`<p>Branches let you work on a feature without disturbing <code>main</code>. <code>git checkout -b name</code> creates and switches to one.</p>`},
  {type:'terminal',instruction:'Create a feature branch: <code>git checkout -b feature/login</code>.',goalText:'On a new branch',hint:'git checkout -b feature/login',check:e=>e.git.branch!=='main'},
  {type:'quiz',q:'You committed a secret by accident and pushed it. Is deleting the commit enough?',options:['Yes, it\'s gone','No — rotate the secret; history and clones may still have it'],answer:1,explain:'Once pushed, assume it\'s compromised. Rotate the credential first; scrubbing history is only cleanup.'},
  {type:'concept',title:'Git fluency unlocked',body:`<p>Init, stage, commit, log, branch — the core loop. On a real machine you'd add <code>git push</code> to a remote like GitHub. Hit <strong>Launch live env</strong> to try it for real.</p>`}
]},

'networking-cidr': { name:'Networking & CIDR', phase:'Phase 0 · Foundations', env:null, liveUrl:LIVE, steps:[
  {type:'concept',title:'Why networking matters',body:`<p>Before AWS VPCs make sense, you need CIDR — how IP address ranges are sliced into networks. This is the #1 thing that trips people up, so we'll make it concrete.</p>`},
  {type:'concept',title:'CIDR in one minute',body:`<p><code>10.0.0.0/16</code> means "the first 16 bits are the network, the rest is host space." Bigger prefix number = smaller network. A <code>/16</code> has 65,536 addresses; a <code>/24</code> has 256; a <code>/28</code> has 16.</p><div class="callout">Rule: each +1 to the prefix <em>halves</em> the network size.</div>`},
  {type:'quiz',q:'How many addresses are in a <code>/24</code>?',options:['16','256','1024','65536'],answer:1,explain:'/24 leaves 8 host bits → 2^8 = 256 addresses.'},
  {type:'cidr',instruction:'Use the calculator to split a VPC. Set it to <code>10.0.0.0/16</code> split into 4 subnets.',base:'10.0.0.0/16',task:{prompt:'What is the CIDR of the <strong>first</strong> subnet when 10.0.0.0/16 is split into 4?',answer:'10.0.0.0/18',placeholder:'e.g. 10.0.0.0/18'}},
  {type:'quiz',q:'In AWS, where do you put a database?',options:['A public subnet (with an internet route)','A private subnet (no direct internet route)'],answer:1,explain:'Databases go in private subnets — reachable from inside the VPC, not the internet. Web servers go in public subnets.'},
  {type:'concept',title:'Security groups vs NACLs',body:`<p>A <strong>security group</strong> is a stateful firewall on an instance (allow inbound 80 → responses flow back automatically). A <strong>NACL</strong> is stateless and sits on a subnet (you must allow both directions). SGs are your everyday tool.</p>`},
  {type:'quiz',q:'You allow inbound port 80 on a security group. Do you also need an outbound rule for the response?',options:['Yes, always','No — security groups are stateful'],answer:1,explain:'SGs are stateful: return traffic for an allowed inbound connection is automatically permitted. NACLs are not.'},
  {type:'concept',title:'Ready for VPCs',body:`<p>You can now read CIDR, subnet a network, and reason about public vs private and SG vs NACL — everything you need for the AWS VPC lesson.</p>`}
]},

/* ---------- PHASE 1 (AWS) ---------- */
'aws-iam-cli': { name:'AWS IAM & the CLI', phase:'Phase 1 · AWS', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'A mock AWS CLI',body:`<p>This terminal simulates <code>awslocal</code> (the AWS CLI pointed at a free local emulator). Commands and output match real AWS — swap <code>awslocal</code> for <code>aws</code> and it works on a real account.</p>`},
  {type:'terminal',instruction:'Confirm who you are: <code>awslocal sts get-caller-identity</code>.',goalText:'Run sts get-caller-identity',hint:'awslocal sts get-caller-identity',check:(e,l)=>/sts\s+get-caller-identity/.test(l)},
  {type:'concept',title:'IAM: identities & permissions',body:`<p>IAM controls <em>who can do what</em>. <strong>Users</strong> are people/apps, <strong>groups</strong> bundle permissions, <strong>roles</strong> are assumed temporarily (preferred), and <strong>policies</strong> are JSON rules.</p>`},
  {type:'terminal',instruction:'Create a user named alice: <code>awslocal iam create-user --user-name alice</code>.',goalText:'User "alice" exists',hint:'awslocal iam create-user --user-name alice',check:e=>e.hasUser('alice')},
  {type:'terminal',instruction:'Create a least-privilege policy: <code>awslocal iam create-policy --policy-name S3ReadOne --policy-document file:///tmp/p.json</code>.',goalText:'Policy "S3ReadOne" exists',hint:'awslocal iam create-policy --policy-name S3ReadOne --policy-document file:///tmp/p.json',check:e=>e.hasPolicy('S3ReadOne')},
  {type:'quiz',q:'Why prefer an IAM <strong>role</strong> on an EC2 instance over stored access keys?',options:['Roles are free','Roles give short-lived credentials with nothing long-term to leak','Keys don\'t work on EC2','No difference'],answer:1,explain:'Roles issue temporary credentials automatically — no long-lived secret to steal from the instance.'},
  {type:'terminal',instruction:'Create a role EC2 can assume: <code>awslocal iam create-role --role-name ec2-app-role --assume-role-policy-document file:///tmp/trust.json</code>.',goalText:'Role "ec2-app-role" exists',hint:'awslocal iam create-role --role-name ec2-app-role --assume-role-policy-document file:///tmp/trust.json',check:e=>e.hasRole('ec2-app-role')},
  {type:'quiz',q:'A policy has <code>"Action": "*"</code> on <code>"Resource": "*"</code>. What\'s wrong?',options:['Nothing','It grants everything — the opposite of least privilege','It\'s too restrictive','Invalid JSON'],answer:1,explain:'Wildcards on both action and resource grant full access. Scope to the specific actions and ARNs you actually need.'},
  {type:'concept',title:'IAM foundations set',body:`<p>You created users, least-privilege policies, and assumable roles — the security backbone of everything on AWS.</p>`}
]},

'aws-s3': { name:'AWS S3 hands-on', phase:'Phase 1 · AWS', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'S3 = object storage',body:`<p>S3 stores files ("objects") in "buckets" — artifacts, backups, static sites, logs. Let's create one and put a file in it.</p>`},
  {type:'terminal',instruction:'Create a bucket: <code>awslocal s3 mb s3://devops-lab-data</code>.',goalText:'Bucket created',hint:'awslocal s3 mb s3://devops-lab-data',check:e=>e.hasBucket('devops-lab-data')},
  {type:'terminal',instruction:'Upload a file: <code>awslocal s3 cp hello.txt s3://devops-lab-data/hello.txt</code>.',goalText:'Bucket has an object',hint:'awslocal s3 cp hello.txt s3://devops-lab-data/hello.txt',check:e=>e.bucketHasObjects('devops-lab-data')},
  {type:'terminal',instruction:'List the bucket contents: <code>awslocal s3 ls s3://devops-lab-data/</code>.',goalText:'Run s3 ls',hint:'awslocal s3 ls s3://devops-lab-data/',check:(e,l)=>/s3\s+ls/.test(l)},
  {type:'quiz',q:'What\'s the safest way to share ONE object temporarily?',options:['Make the bucket public','A presigned URL','Email the AWS keys','Disable encryption'],answer:1,explain:'A presigned URL grants time-limited access to a single object without making the bucket public.'},
  {type:'terminal',instruction:'Generate a presigned URL: <code>awslocal s3 presign s3://devops-lab-data/hello.txt</code>.',goalText:'Run s3 presign',hint:'awslocal s3 presign s3://devops-lab-data/hello.txt',check:(e,l)=>/s3\s+presign/.test(l)},
  {type:'quiz',q:'The #1 real-world S3 mistake is…',options:['Too many buckets','Accidentally public buckets exposing data','Files too small','Wrong region'],answer:1,explain:'Public buckets leak data constantly. Keep "Block Public Access" on unless you truly mean to host a public site.'},
  {type:'concept',title:'S3 basics done',body:`<p>Create, upload, list, and share safely with presigned URLs — plus the golden rule: don\'t make buckets public.</p>`}
]},

'aws-vpc': { name:'AWS VPC & networking', phase:'Phase 1 · AWS', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'Build a network by hand',body:`<p>A VPC is your private network in AWS. You'll create one, carve out subnets, and add an internet gateway — all in the mock CLI.</p>`},
  {type:'cidr',instruction:'First, plan the addressing. Split <code>10.0.0.0/16</code> into 4 subnets.',base:'10.0.0.0/16',task:{prompt:'What CIDR will the <strong>second</strong> subnet get?',answer:'10.0.64.0/18',placeholder:'e.g. 10.0.64.0/18'}},
  {type:'terminal',instruction:'Create the VPC: <code>awslocal ec2 create-vpc --cidr-block 10.0.0.0/16</code>.',goalText:'A VPC exists',hint:'awslocal ec2 create-vpc --cidr-block 10.0.0.0/16',check:e=>e.vpcCount()>0},
  {type:'terminal',instruction:'Add a subnet: <code>awslocal ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24</code>.',goalText:'A subnet exists',hint:'awslocal ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24',check:e=>e.subnetCount()>0},
  {type:'terminal',instruction:'Create an internet gateway: <code>awslocal ec2 create-internet-gateway</code>.',goalText:'Run create-internet-gateway',hint:'awslocal ec2 create-internet-gateway',check:(e,l)=>/create-internet-gateway/.test(l)},
  {type:'quiz',q:'What actually makes a subnet "public"?',options:['Its name','A route table with a route to the internet gateway','It has more addresses','Being in us-east-1'],answer:1,explain:'A subnet is public because its route table sends 0.0.0.0/0 to the internet gateway. No such route = private.'},
  {type:'terminal',instruction:'Launch a server: <code>awslocal ec2 run-instances --image-id ami-123 --instance-type t2.micro</code>.',goalText:'Run run-instances',hint:'awslocal ec2 run-instances --image-id ami-123 --instance-type t2.micro',check:(e,l)=>/run-instances/.test(l)},
  {type:'quiz',q:'Which instance type keeps you inside the AWS Free Tier?',options:['m5.large','t2.micro / t3.micro','c5.xlarge','Any of them'],answer:1,explain:'Micro instances (t2.micro/t3.micro) are Free Tier eligible for the first 12 months.'},
  {type:'concept',title:'You built cloud infrastructure',body:`<p>VPC, subnet, internet gateway, an instance — the foundation every AWS deployment sits on. On real AWS, remember to tear it down. Hit <strong>Launch live env</strong> to try it for real.</p>`}
]},

'aws-lambda': { name:'AWS Lambda & events', phase:'Phase 1 · AWS', env:'aws', liveUrl:LIVE, steps:[
  {type:'concept',title:'Serverless functions',body:`<p>Lambda runs your code with no servers to manage — you pay per invocation. It's the glue of event-driven architectures.</p>`},
  {type:'terminal',instruction:'Create a function: <code>awslocal lambda create-function --function-name process-upload --runtime python3.12 --handler handler.handler --role arn:aws:iam::000000000000:role/lambda-role --zip-file fileb:///tmp/fn.zip</code>.',goalText:'A function exists',hint:'awslocal lambda create-function --function-name process-upload --runtime python3.12 --handler handler.handler --role arn:aws:iam::000000000000:role/lambda-role --zip-file fileb:///tmp/fn.zip',check:e=>e.fnCount()>0},
  {type:'terminal',instruction:'Invoke it: <code>awslocal lambda invoke --function-name process-upload --payload {} /tmp/out.json</code>.',goalText:'Run lambda invoke',hint:'awslocal lambda invoke --function-name process-upload --payload {} /tmp/out.json',check:(e,l)=>/lambda\s+invoke/.test(l)},
  {type:'quiz',q:'How does a Lambda get permissions to touch other AWS services?',options:['Access keys in the code','An execution role it assumes','It has admin by default','It can\'t'],answer:1,explain:'Lambda assumes an execution role — temporary, least-privilege credentials. Same pattern as EC2 roles.'},
  {type:'concept',title:'Event-driven glue',body:`<p>The classic pattern: an S3 upload triggers a Lambda that processes the file. Event → trigger → compute → output. This shape powers huge amounts of real AWS architecture.</p>`},
  {type:'quiz',q:'In an S3→Lambda trigger, what must be configured?',options:['Nothing, it\'s automatic','A permission letting S3 invoke the function, and a bucket notification','Only a bucket','A NAT gateway'],answer:1,explain:'You grant S3 permission to invoke the function AND add an S3 event notification pointing at it. Both are required.'},
  {type:'concept',title:'Serverless basics done',body:`<p>You created and invoked a function and learned the event-driven pattern and execution roles — the serverless core.</p>`}
]}

};

const LESSON_ORDER = [
  {phase:'Phase 0 · Foundations', ids:['linux-permissions','linux-cli','git-basics','networking-cidr']},
  {phase:'Phase 1 · AWS Fundamentals', ids:['aws-iam-cli','aws-s3','aws-vpc','aws-lambda']}
];

if (typeof module!=='undefined') module.exports={LESSONS,LESSON_ORDER};
