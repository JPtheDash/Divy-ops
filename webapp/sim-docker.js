/* MOCK DOCKER — simulated `docker` CLI. Tracks images & containers. */
function makeDocker(){
  const st={ images:['ubuntu:22.04','python:3.12-slim'], containers:[] };
  let cn=0;
  function tok(s){ return (s.match(/"[^"]*"|'[^']*'|\S+/g)||[]).map(t=>t.replace(/^["']|["']$/g,'')); }
  function flagVal(a,f){ const i=a.indexOf(f); return i>=0?a[i+1]:null; }

  function build(a){
    const t=flagVal(a,'-t')||'app:latest';
    if(!st.images.includes(t)) st.images.push(t);
    return {out:'[+] Building 12.3s (8/8) FINISHED\n => naming to docker.io/library/'+t+'\nSuccessfully tagged '+t}; }
  function images(){ return {out:'REPOSITORY          TAG        IMAGE ID       SIZE\n'+
    st.images.map(i=>{const [r,t]=i.includes(':')?i.split(':'):[i,'latest'];return r.padEnd(19)+' '+t.padEnd(10)+' '+Math.random().toString(16).slice(2,14)+'   '+(Math.floor(Math.random()*200)+20)+'MB';}).join('\n')}; }
  function run(a){
    const detach=a.includes('-d'); const name=flagVal(a,'--name')||('c'+(++cn));
    const image=a.filter(x=>!x.startsWith('-')&&x!=='run').pop()||a[a.length-1];
    const pmap=flagVal(a,'-p');
    if(!st.images.some(i=>i===image||i.split(':')[0]===image)) return {err:"Unable to find image '"+image+"' locally\ndocker: image not found. (build or pull it first)"};
    const id=Math.random().toString(16).slice(2,14);
    st.containers.push({id,name,image,running:true,ports:pmap});
    return {out: detach? id : 'container '+name+' started'+(pmap?' on '+pmap:'')}; }
  function ps(a){
    const all=a.includes('-a'); const list=st.containers.filter(c=>all||c.running);
    return {out:'CONTAINER ID   IMAGE           STATUS      PORTS        NAMES\n'+
      (list.map(c=>c.id.slice(0,12)+'   '+c.image.padEnd(15)+' '+(c.running?'Up 2s   ':'Exited  ')+' '+(c.ports||'').padEnd(11)+'  '+c.name).join('\n')||'(no containers)')}; }
  function stop(a){ const n=a.find(x=>!x.startsWith('-')); const c=st.containers.find(c=>c.name===n||c.id.startsWith(n));
    if(!c) return {err:'Error: No such container: '+n}; c.running=false; return {out:n}; }
  function pull(a){ const im=a.find(x=>!x.startsWith('-')); if(im&&!st.images.includes(im)) st.images.push(im.includes(':')?im:im+':latest'); return {out:'Using default tag: latest\nPulled '+im}; }

  function runCmd(input){
    const p=tok(input.trim()); if(!p.length) return {out:''};
    if(p[0]==='clear') return {out:'__CLEAR__'};
    if(p[0]==='help') return {out:'docker: build -t NAME . | images | run [-d] [-p H:C] [--name N] IMAGE | ps [-a] | stop N | pull IMAGE'};
    if(p[0]==='hadolint') return {out:'(no issues found in Dockerfile)'};
    if(p[0]!=='docker') return {err:p[0]+": command not found (use 'docker ...')"};
    const sub=p[1], a=p.slice(2);
    switch(sub){
      case 'build': return build(a);
      case 'images': return images();
      case 'run': return run(a);
      case 'ps': return ps(a);
      case 'stop': return stop(a);
      case 'pull': return pull(a);
      case '--version': return {out:'Docker version 26.0.0 (mock)'};
      default: return {err:"docker: '"+sub+"' not simulated (try build, run, ps, images, stop)"};
    }
  }
  return { run:runCmd, prompt:()=>'you@devops:~/app$ ',
    hasImage:n=>st.images.some(i=>i===n||i.split(':')[0]===n),
    running:n=>st.containers.some(c=>(c.name===n||c.image===n||c.image.split(':')[0]===n)&&c.running),
    containerCount:()=>st.containers.length, state:st };
}
if (typeof module!=='undefined') module.exports={makeDocker};
