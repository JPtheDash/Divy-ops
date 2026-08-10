/* MOCK KUBECTL — simulated `kubectl` over a pretend cluster. */
function makeK8s(){
  const st={ deployments:{}, services:{} };
  function tok(s){ return (s.match(/\S+/g)||[]); }
  function flagVal(a,f){ for(const x of a){ if(x.startsWith(f+'=')) return x.split('=')[1]; } const i=a.indexOf(f); return i>=0?a[i+1]:null; }
  function pods(name,n){ const out=[]; for(let i=0;i<n;i++) out.push(name+'-'+Math.random().toString(36).slice(2,7)+'   1/1   Running   0   10s'); return out; }

  function get(a){
    const kind=a[0]||'';
    if(/^pod/.test(kind)){ let lines=[]; Object.entries(st.deployments).forEach(([n,d])=>{ for(let i=0;i<d.replicas;i++) lines.push(n+'-'+Math.random().toString(36).slice(2,7)+'   1/1   Running   0   10s'); });
      return {out:'NAME                     READY   STATUS    RESTARTS   AGE\n'+(lines.join('\n')||'No resources found.')}; }
    if(/^deploy/.test(kind)){ const rows=Object.entries(st.deployments).map(([n,d])=>n+'   '+d.replicas+'/'+d.replicas+'   '+d.replicas+'   '+d.replicas+'   1m');
      return {out:'NAME   READY   UP-TO-DATE   AVAILABLE   AGE\n'+(rows.join('\n')||'No resources found.')}; }
    if(/^svc|^service/.test(kind)){ const rows=Object.entries(st.services).map(([n,s])=>n+'   '+s.type+'   10.0.0.'+(Math.floor(Math.random()*250))+'   80/TCP   1m');
      return {out:'NAME   TYPE   CLUSTER-IP   PORT(S)   AGE\n'+(rows.join('\n')||'No resources found.')}; }
    if(kind==='nodes'||kind==='node') return {out:'NAME            STATUS   ROLES    AGE   VERSION\nkind-control-plane   Ready    control-plane   1h    v1.29.0'};
    if(kind==='all') return {out:'(deployments: '+Object.keys(st.deployments).length+', services: '+Object.keys(st.services).length+')'};
    return {err:"error: unknown resource type '"+kind+"'"};
  }
  function run(input){
    const p=tok(input.trim()); if(!p.length) return {out:''};
    if(p[0]==='clear') return {out:'__CLEAR__'};
    if(p[0]==='help') return {out:'kubectl: get pods|deploy|svc|nodes | create deployment NAME --image=IMG | scale deployment NAME --replicas=N | expose deployment NAME --port=80 | describe ...'};
    if(p[0]!=='kubectl') return {err:p[0]+": command not found (use 'kubectl ...')"};
    const sub=p[1], a=p.slice(2);
    if(sub==='get') return get(a);
    if(sub==='create'){ if(a[0]==='deployment'){ const n=a[1]; const img=flagVal(a,'--image')||'nginx';
      st.deployments[n]={image:img,replicas:1}; return {out:'deployment.apps/'+n+' created'}; } return {out:''}; }
    if(sub==='apply'){ const n='web'; if(!st.deployments[n]) st.deployments[n]={image:'nginx',replicas:1}; return {out:'deployment.apps/'+n+' created\nservice/'+n+' created'}; }
    if(sub==='scale'){ const n=a[1]; const r=+(flagVal(a,'--replicas')||1); if(st.deployments[n]){ st.deployments[n].replicas=r; return {out:'deployment.apps/'+n+' scaled'}; } return {err:'Error: deployments.apps "'+n+'" not found'}; }
    if(sub==='expose'){ const n=a[1]; st.services[n]={type:flagVal(a,'--type')||'ClusterIP'}; return {out:'service/'+n+' exposed'}; }
    if(sub==='describe') return {out:'Name: '+ (a[1]||'web') +'\nReplicas: '+((st.deployments[a[1]]||{}).replicas||1)+' desired\nStatus: Running'};
    if(sub==='delete') return {out:(a.join(' '))+' deleted'};
    if(sub==='version') return {out:'Client Version: v1.29.0 (mock)'};
    return {err:"kubectl: '"+sub+"' not simulated (try get, create deployment, scale, expose)"};
  }
  return { run, prompt:()=>'you@devops:~$ ',
    hasDeployment:n=>!!st.deployments[n], replicas:n=>st.deployments[n]?st.deployments[n].replicas:0,
    hasService:n=>!!st.services[n], state:st };
}
if (typeof module!=='undefined') module.exports={makeK8s};
