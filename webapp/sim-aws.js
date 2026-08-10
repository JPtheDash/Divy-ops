/* ============================================================
   MOCK AWS — simulated `aws` / `awslocal` CLI.
   Returns realistic output and tracks state (buckets, users,
   policies, VPCs, subnets, functions). No real AWS, no cost.
   ============================================================ */
function makeAws(){
  const st={ region:'us-east-1', configured:false,
    buckets:{}, users:[], groups:[], policies:[], roles:[],
    vpcs:[], subnets:[], igws:[], instances:[], functions:[] };
  let n=1; const id=(p)=> p+'-'+(Math.random().toString(16).slice(2,10));

  function tok(s){ return (s.match(/"[^"]*"|'[^']*'|\S+/g)||[]).map(t=>t.replace(/^["']|["']$/g,'')); }
  function flag(a,name){ const i=a.indexOf(name); return i>=0? a[i+1] : null; }
  function J(o){ return JSON.stringify(o,null,4); }

  function s3(a){
    const op=a[0];
    if(op==='mb'){ const b=(a[1]||'').replace('s3://',''); if(!b) return {err:'usage: aws s3 mb s3://bucket'};
      if(st.buckets[b]) return {err:'make_bucket failed: bucket already exists'};
      st.buckets[b]={objects:{},versioning:false}; return {out:'make_bucket: '+b}; }
    if(op==='ls'){ const t=a[1];
      if(!t||t==='s3://'){ return {out:Object.keys(st.buckets).map(b=>'2026-01-01 10:00:00 '+b).join('\n')}; }
      const b=t.replace('s3://','').replace(/\/$/,''); const bk=st.buckets[b];
      if(!bk) return {err:'NoSuchBucket'};
      return {out:Object.keys(bk.objects).map(k=>'2026-01-01 10:00:00 '+String(bk.objects[k].length).padStart(6)+' '+k).join('\n')||'(empty)'}; }
    if(op==='cp'){ const src=a[1],dst=a[2];
      const to=(dst||'').startsWith('s3://')?dst:src;
      const b=to.replace('s3://','').split('/')[0]; const key=to.replace('s3://','').split('/').slice(1).join('/');
      if(!st.buckets[b]) return {err:'NoSuchBucket: '+b};
      st.buckets[b].objects[key||'file']='data'; return {out:(dst.startsWith('s3://')?'upload':'download')+': '+src+' to '+dst}; }
    if(op==='sync'){ const dst=a[2]||a[1]; const b=(dst||'').replace('s3://','').split('/')[0];
      if(!st.buckets[b]) return {err:'NoSuchBucket'}; st.buckets[b].objects['index.html']='<h1>site</h1>';
      return {out:'upload: ./index.html to '+dst+'index.html'}; }
    if(op==='presign'){ const u=a[1]||'s3://bucket/key';
      return {out:'https://'+u.replace('s3://','').split('/')[0]+'.s3.amazonaws.com/'+u.replace('s3://','').split('/').slice(1).join('/')+'?X-Amz-Expires=3600&X-Amz-Signature=ex4mpl3'}; }
    return {err:"aws s3: unknown op '"+op+"'"};
  }
  function s3api(a){
    const op=a[0];
    if(op==='list-buckets') return {out:J({Buckets:Object.keys(st.buckets).map(b=>({Name:b,CreationDate:'2026-01-01T10:00:00Z'}))})};
    if(op==='put-bucket-versioning'){ const b=flag(a,'--bucket'); if(st.buckets[b]) st.buckets[b].versioning=true; return {out:''}; }
    return {err:'aws s3api: unsupported in this lab'};
  }
  function iam(a){
    const op=a[0];
    if(op==='create-user'){ const u=flag(a,'--user-name'); st.users.push(u); return {out:J({User:{UserName:u,Arn:'arn:aws:iam::000000000000:user/'+u}})}; }
    if(op==='create-group'){ const g=flag(a,'--group-name'); st.groups.push(g); return {out:J({Group:{GroupName:g,Arn:'arn:aws:iam::000000000000:group/'+g}})}; }
    if(op==='add-user-to-group') return {out:''};
    if(op==='create-policy'){ const p=flag(a,'--policy-name'); st.policies.push(p);
      return {out:J({Policy:{PolicyName:p,Arn:'arn:aws:iam::000000000000:policy/'+p}})}; }
    if(op==='create-role'){ const r=flag(a,'--role-name'); st.roles.push(r);
      return {out:J({Role:{RoleName:r,Arn:'arn:aws:iam::000000000000:role/'+r}})}; }
    if(op==='list-users') return {out:J({Users:st.users.map(u=>({UserName:u,Arn:'arn:aws:iam::000000000000:user/'+u}))})};
    if(op==='list-roles') return {out:J({Roles:st.roles.map(r=>({RoleName:r}))})};
    return {err:'aws iam: unsupported in this lab'};
  }
  function ec2(a){
    const op=a[0];
    if(op==='create-vpc'){ const cidr=flag(a,'--cidr-block')||'10.0.0.0/16'; const v=id('vpc'); st.vpcs.push({VpcId:v,CidrBlock:cidr});
      return {out:J({Vpc:{VpcId:v,CidrBlock:cidr,State:'available'}})}; }
    if(op==='create-subnet'){ const cidr=flag(a,'--cidr-block'); const s=id('subnet'); st.subnets.push({SubnetId:s,CidrBlock:cidr});
      return {out:J({Subnet:{SubnetId:s,CidrBlock:cidr,State:'available'}})}; }
    if(op==='create-internet-gateway'){ const g=id('igw'); st.igws.push(g); return {out:J({InternetGateway:{InternetGatewayId:g}})}; }
    if(op==='attach-internet-gateway') return {out:''};
    if(op==='create-route-table'){ return {out:J({RouteTable:{RouteTableId:id('rtb')}})}; }
    if(op==='create-route') return {out:J({Return:true})};
    if(op==='create-security-group'){ return {out:J({GroupId:id('sg')})}; }
    if(op==='authorize-security-group-ingress') return {out:''};
    if(op==='run-instances'){ const i=id('i'); st.instances.push({InstanceId:i,State:'running'});
      return {out:J({Instances:[{InstanceId:i,InstanceType:flag(a,'--instance-type')||'t2.micro',State:{Name:'running'}}]})}; }
    if(op==='describe-instances') return {out:J({Reservations:st.instances.map(x=>({Instances:[x]}))})};
    if(op==='describe-vpcs') return {out:J({Vpcs:st.vpcs})};
    return {err:'aws ec2: unsupported in this lab'};
  }
  function lambda(a){
    const op=a[0];
    if(op==='create-function'){ const f=flag(a,'--function-name'); st.functions.push(f);
      return {out:J({FunctionName:f,Runtime:flag(a,'--runtime')||'python3.12',State:'Active'})}; }
    if(op==='invoke'){ return {out:'(function invoked — see /tmp/out.json)\n'+J({StatusCode:200})}; }
    if(op==='add-permission') return {out:''};
    return {err:'aws lambda: unsupported in this lab'};
  }

  function run(input){
    const parts=tok(input.trim()); if(!parts.length) return {out:''};
    let c=parts[0];
    if(c!=='aws' && c!=='awslocal') return {err:c+": command not found (try 'aws ...' or 'awslocal ...')"};
    const a=parts.slice(1);
    const svc=a[0], rest=a.slice(1);
    if(svc==='configure'){ st.configured=true; return {out:''}; }
    if(svc==='sts' && rest[0]==='get-caller-identity')
      return {out:J({UserId:'AKIAEXAMPLE',Account:'000000000000',Arn:'arn:aws:iam::000000000000:user/you'})};
    if(svc==='s3') return s3(rest);
    if(svc==='s3api') return s3api(rest);
    if(svc==='iam') return iam(rest);
    if(svc==='ec2') return ec2(rest);
    if(svc==='lambda') return lambda(rest);
    if(svc==='logs') return {out:J({logGroups:[{logGroupName:'/aws/lambda/process-upload'}]})};
    if(svc==='--version') return {out:'aws-cli/2.15.0 (mock)'};
    return {err:"aws: service '"+svc+"' not simulated in this lab (try: s3, iam, ec2, lambda, sts)"};
  }

  return {
    run,
    prompt:()=>'you@devops:~$ ',
    state:st,
    hasBucket:b=>!!st.buckets[b],
    bucketHasObjects:b=>st.buckets[b]&&Object.keys(st.buckets[b].objects).length>0,
    hasUser:u=>st.users.includes(u),
    hasPolicy:p=>st.policies.includes(p),
    hasRole:r=>st.roles.includes(r),
    vpcCount:()=>st.vpcs.length,
    subnetCount:()=>st.subnets.length,
    fnCount:()=>st.functions.length,
    configured:()=>st.configured
  };
}
if (typeof module!=='undefined') module.exports={makeAws};
