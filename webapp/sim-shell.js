/* ============================================================
   MOCK SHELL — simulated Linux + git environment.
   Behaves like bash over a virtual filesystem so learners run
   real commands and see realistic output. No real machine.
   ============================================================ */
function makeShell(){
  const root={type:'dir',mode:0o755,children:{}};
  root.children.home={type:'dir',mode:0o755,children:{you:{type:'dir',mode:0o755,children:{}}}};
  root.children.tmp={type:'dir',mode:0o777,children:{}};
  let cwd=['home','you'];
  // minimal git model (per-session, single repo)
  const git={inited:false,branch:'main',branches:['main'],commits:[],staged:[],user:''};

  function resolve(path){
    let base = path.startsWith('/') ? [] : cwd.slice();
    for(const part of path.split('/')){
      if(part===''||part==='.') continue;
      if(part==='..'){ base.pop(); continue; }
      base.push(part);
    }
    return base;
  }
  function getNode(segs){ let n=root; for(const s of segs){ if(!n||n.type!=='dir'||!n.children[s]) return null; n=n.children[s]; } return n; }
  function parent(segs){ return getNode(segs.slice(0,-1)); }
  function oct(n){ return ((n&4)?'r':'-')+((n&2)?'w':'-')+((n&1)?'x':'-'); }
  function modeStr(node){ return (node.type==='dir'?'d':'-')+oct((node.mode>>6)&7)+oct((node.mode>>3)&7)+oct(node.mode&7); }
  function tok(s){ return (s.match(/"[^"]*"|'[^']*'|\S+/g)||[]).map(t=>t.replace(/^["']|["']$/g,'')); }

  function line(node,name){
    const size=node.type==='dir'?4096:(node.content?node.content.length:0);
    return modeStr(node)+' 1 you you '+String(size).padStart(5)+' Jan  1 10:00 '+name;
  }
  function ls(a){
    const long=a.some(x=>/^-.*l/.test(x)), all=a.some(x=>/^-.*a/.test(x));
    const t=a.find(x=>!x.startsWith('-'));
    const segs=t?resolve(t):cwd.slice(), node=getNode(segs);
    if(!node) return {err:"ls: cannot access '"+t+"': No such file or directory"};
    if(node.type==='file') return {out: long?line(node,t):t};
    const names=Object.keys(node.children).sort();
    if(!long) return {out:(all?['.','..']:[]).concat(names).join('  ')};
    return {out:'total '+names.length+'\n'+names.map(nm=>line(node.children[nm],nm)).join('\n')};
  }
  function cd(a){ const t=a[0]||'/home/you', s=resolve(t), n=getNode(s);
    if(!n) return {err:'cd: '+t+': No such file or directory'};
    if(n.type!=='dir') return {err:'cd: '+t+': Not a directory'}; cwd=s; return {out:''}; }
  function mkdir(a){ const name=a.find(x=>!x.startsWith('-')); if(!name) return {err:'mkdir: missing operand'};
    const s=resolve(name),p=parent(s),b=s[s.length-1];
    if(!p||p.type!=='dir') return {err:"mkdir: cannot create directory '"+name+"': No such file or directory"};
    if(p.children[b]) return {err:"mkdir: cannot create directory '"+name+"': File exists"};
    p.children[b]={type:'dir',mode:0o755,children:{}}; return {out:''}; }
  function touch(a){ const name=a[0]; if(!name) return {err:'touch: missing file operand'};
    const s=resolve(name),p=parent(s),b=s[s.length-1];
    if(!p||p.type!=='dir') return {err:"touch: cannot touch '"+name+"': No such file or directory"};
    if(!p.children[b]) p.children[b]={type:'file',mode:0o644,content:''}; return {out:''}; }
  function cat(a){ const n=getNode(resolve(a[0]||'')); if(!n) return {err:'cat: '+a[0]+': No such file or directory'};
    if(n.type==='dir') return {err:'cat: '+a[0]+': Is a directory'}; return {out:n.content||''}; }
  function chmod(a){ const m=a[0],name=a[1];
    if(!/^[0-7]{3}$/.test(m||'')) return {err:"chmod: invalid mode: '"+(m||'')+"' (use 3 octal digits, e.g. 644)"};
    const n=getNode(resolve(name||'')); if(!n) return {err:"chmod: cannot access '"+name+"': No such file or directory"};
    n.mode=parseInt(m,8); return {out:''}; }
  function echo(a){ const gt=a.indexOf('>'); if(gt===-1) return {out:a.join(' ')};
    const text=a.slice(0,gt).join(' '),name=a[gt+1],s=resolve(name),p=parent(s),b=s[s.length-1];
    if(!p||p.type!=='dir') return {err:'bash: '+name+': No such file or directory'};
    p.children[b]={type:'file',mode:0o644,content:text}; return {out:''}; }
  function rm(a){ const name=a.find(x=>!x.startsWith('-')); const s=resolve(name||''),p=parent(s),b=s[s.length-1];
    if(!p||!p.children[b]) return {err:"rm: cannot remove '"+name+"': No such file or directory"};
    delete p.children[b]; return {out:''}; }

  function gitCmd(a){
    const sub=a[0];
    if(sub==='init'){ git.inited=true; return {out:'Initialized empty Git repository in '+('/'+cwd.join('/'))+'/.git/'}; }
    if(!git.inited && sub!=='--version') return {err:'fatal: not a git repository (run: git init)'};
    switch(sub){
      case 'config': return {out:''};
      case 'status': {
        const st=git.staged.length?('Changes to be committed:\n  '+git.staged.join('\n  ')):'nothing staged';
        return {out:'On branch '+git.branch+'\n'+st}; }
      case 'add': { const f=a.slice(1).join(' ')||'.'; if(!git.staged.includes(f)) git.staged.push(f);
        return {out:''}; }
      case 'commit': {
        const mi=a.indexOf('-m'); const msg=mi>=0?a.slice(mi+1).join(' '):'';
        if(!msg) return {err:'commit needs a message: git commit -m "..."'};
        if(!git.staged.length && !git.commits.length) return {err:'nothing to commit (use git add first)'};
        const hash=Math.random().toString(16).slice(2,9);
        git.commits.push({hash,msg,branch:git.branch}); const n=git.staged.length; git.staged=[];
        return {out:'['+git.branch+' '+hash+'] '+msg+'\n '+n+' file(s) changed'}; }
      case 'log': {
        if(!git.commits.length) return {err:'fatal: your current branch does not have any commits yet'};
        const one=a.includes('--oneline');
        return {out: git.commits.slice().reverse().map(c=> one? (c.hash+' '+c.msg) : ('commit '+c.hash+'\n    '+c.msg)).join(one?'\n':'\n\n')}; }
      case 'branch': {
        if(a[1]){ if(!git.branches.includes(a[1])) git.branches.push(a[1]); return {out:''}; }
        return {out: git.branches.map(b=>(b===git.branch?'* ':'  ')+b).join('\n')}; }
      case 'checkout': {
        if(a[1]==='-b'){ const nm=a[2]; if(nm){ if(!git.branches.includes(nm)) git.branches.push(nm); git.branch=nm; return {out:"Switched to a new branch '"+nm+"'"}; } }
        const nm=a[1]; if(git.branches.includes(nm)){ git.branch=nm; return {out:"Switched to branch '"+nm+"'"}; }
        return {err:"error: pathspec '"+nm+"' did not match any branch"}; }
      default: return {err:"git: '"+sub+"' is not a git command"};
    }
  }

  function run(input){
    const parts=tok(input.trim()); if(!parts.length) return {out:''};
    const c=parts[0], a=parts.slice(1);
    switch(c){
      case 'pwd': return {out:'/'+cwd.join('/')};
      case 'whoami': return {out:'you'};
      case 'id': return {out:'uid=1000(you) gid=1000(you) groups=1000(you)'};
      case 'clear': return {out:'__CLEAR__'};
      case 'help': return {out:'available: pwd, ls [-l], cd, mkdir, touch, echo "x" > f, cat, chmod NNN f, rm, git, whoami, id, clear'};
      case 'ls': return ls(a);
      case 'cd': return cd(a);
      case 'mkdir': return mkdir(a);
      case 'touch': return touch(a);
      case 'cat': return cat(a);
      case 'chmod': return chmod(a);
      case 'echo': return echo(a);
      case 'rm': return rm(a);
      case 'git': return gitCmd(a);
      default: return {err:c+': command not found (type help)'};
    }
  }
  return {
    run,
    prompt:()=>'you@devops:'+('/'+cwd.join('/')).replace('/home/you','~')+'$ ',
    exists:p=>getNode(resolve(p))!==null,
    isDir:p=>{const n=getNode(resolve(p));return !!n&&n.type==='dir';},
    isFile:p=>{const n=getNode(resolve(p));return !!n&&n.type==='file';},
    mode:p=>{const n=getNode(resolve(p));return n?n.mode:null;},
    content:p=>{const n=getNode(resolve(p));return n?n.content:null;},
    cwdStr:()=>'/'+cwd.join('/'),
    git
  };
}
if (typeof module!=='undefined') module.exports={makeShell};
