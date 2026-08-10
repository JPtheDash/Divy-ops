/* ============================================================
   LESSON PLAYER — environment-agnostic.
   Renders a lesson's steps (concept / quiz / terminal / checkpoint
   / cidr), gates progress, tracks XP. Works with the mock shell
   or mock aws environment.
   ============================================================ */
function startLesson(lesson, opts){
  opts=opts||{};
  const env = lesson.env==='shell' ? makeShell() : lesson.env==='aws' ? makeAws() : null;
  let idx=0, xp=0;
  const done=new Array(lesson.steps.length).fill(false);

  const root=document.getElementById('app');
  root.innerHTML=`
    <div class="topbar">
      <a class="back-link" href="index.html">←</a>
      <div class="brand"><span class="dot"></span>${lesson.name}</div>
      <div class="steps-count" id="steps-count"></div>
      <div class="score" id="score">0 XP</div>
      ${lesson.liveUrl?`<a class="live-btn" href="${lesson.liveUrl}" target="_blank" rel="noopener">↗ Launch live env</a>`:''}
    </div>
    <div class="progress-line"><i id="progress-fill"></i></div>
    <div class="wrap"><div class="col" id="stage"></div></div>
    <div class="nav">
      <button class="btn ghost" id="back-btn">← Back</button>
      <span class="locked-note" id="lock-note"></span>
      <button class="btn primary" id="next-btn">Next →</button>
    </div>`;

  const stage=document.getElementById('stage');
  const nextBtn=document.getElementById('next-btn');
  const backBtn=document.getElementById('back-btn');
  const lockNote=document.getElementById('lock-note');

  function setScore(){ document.getElementById('score').textContent=xp+' XP'; }
  function setProgress(){
    document.getElementById('steps-count').textContent='Step '+(idx+1)+' of '+lesson.steps.length;
    document.getElementById('progress-fill').style.width=Math.round(idx/(lesson.steps.length-1)*100)+'%';
  }
  function award(n){ xp+=n; setScore(); }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function renderTerminal(step){
    const box=document.createElement('div');
    box.innerHTML=`<div class="term">
      <div class="term-bar"><i class="r"></i><i class="y"></i><i class="g"></i><span>${lesson.env==='aws'?'aws cli — mock environment':'bash — mock environment'}</span></div>
      <div class="term-body" id="tbody"></div>
      <div class="term-inputline"><span class="ps" id="ps"></span><input id="tin" autocomplete="off" autocapitalize="off" spellcheck="false"/></div>
    </div>
    <div class="goal" id="goal"><span id="gm">◦ </span><span>${step.goalText}</span></div>
    <button class="hintbtn" id="hintbtn">Show hint</button><div class="hint" id="hint">${step.hint||''}</div>`;
    const body=box.querySelector('#tbody'), input=box.querySelector('#tin'), ps=box.querySelector('#ps');
    const goalEl=box.querySelector('#goal');
    ps.textContent=env.prompt();
    box.querySelector('#hintbtn').onclick=()=>{ box.querySelector('#hint').style.display='block'; };
    function print(html,cls){ const d=document.createElement('div'); d.className=cls||''; d.innerHTML=html; body.appendChild(d); body.scrollTop=body.scrollHeight; }
    input.addEventListener('keydown',e=>{
      if(e.key!=='Enter') return;
      const cmd=input.value; if(!cmd.trim()) return;
      print('<span class="ps">'+esc(env.prompt())+'</span>'+esc(cmd),'term-cmd');
      const res=env.run(cmd);
      if(res.out==='__CLEAR__') body.innerHTML='';
      else if(res.err) print(esc(res.err),'term-err');
      else if(res.out) print(esc(res.out),'term-out');
      input.value=''; ps.textContent=env.prompt();
      if(!done[idx] && step.check(env,cmd)){ award(10); done[idx]=true; goalEl.classList.add('done'); box.querySelector('#gm').textContent='✓ '; refreshNav(); }
    });
    setTimeout(()=>input.focus(),40);
    return box;
  }

  function renderQuiz(step){
    const box=document.createElement('div');
    box.innerHTML=`<div class="card"><h2>${step.q}</h2><div id="opts"></div><div class="explain" id="explain">${step.explain}</div></div>`;
    const opts=box.querySelector('#opts');
    step.options.forEach((o,i)=>{
      const b=document.createElement('button'); b.className='opt'; b.innerHTML=o;
      b.onclick=()=>{ if(done[idx]) return;
        [...opts.children].forEach(c=>c.disabled=true);
        if(i===step.answer){ b.classList.add('correct'); award(10); } else { b.classList.add('wrong'); opts.children[step.answer].classList.add('correct'); }
        box.querySelector('#explain').classList.add('show'); done[idx]=true; refreshNav();
      };
      opts.appendChild(b);
    });
    return box;
  }

  function renderCheckpoint(step){
    const box=document.createElement('div');
    box.innerHTML=`<p>${step.instruction}</p>
      <textarea class="cp-input" id="cp" placeholder="${step.placeholder||''}"></textarea>
      <button class="btn" id="cpbtn" style="margin-top:10px">Check my answer</button>
      <div class="cp-feedback" id="cpfb"></div>`;
    box.querySelector('#cpbtn').onclick=()=>{
      const v=box.querySelector('#cp').value, fb=box.querySelector('#cpfb');
      if(step.validate(v)){ fb.className='cp-feedback ok'; fb.textContent='✓ '+(step.ok||'Correct!'); if(!done[idx]) award(10); done[idx]=true; refreshNav(); }
      else { fb.className='cp-feedback no'; fb.textContent=step.no||'Not quite — try again.'; }
    };
    return box;
  }

  function renderCidr(step){
    const box=document.createElement('div');
    box.innerHTML=`
      <div class="widgetbox">
        <div class="wtitle">◆ interactive · CIDR calculator</div>
        <div class="wrow"><label>VPC CIDR</label><input id="cbase" value="${step.base||'10.0.0.0/16'}" size="16">
          <label>split into</label><select id="ccount"><option>2</option><option selected>4</option><option>6</option><option>8</option></select><span>subnets</span></div>
        <div id="csum" style="font-size:13px;margin-bottom:6px"></div>
        <div class="wbar" id="cbar"></div>
        <div style="overflow-x:auto"><table class="wtable" id="ctab"></table></div>
      </div>
      <p style="margin-top:16px">${step.task.prompt}</p>
      <input class="answer-input" id="cans" placeholder="${step.task.placeholder||'e.g. 10.0.0.0/18'}"/>
      <button class="btn" id="cbtn" style="margin-left:8px">Check</button>
      <div class="cp-feedback" id="cfb"></div>`;
    function ip2i(ip){return ip.split('.').reduce((a,o)=>(a<<8)+(+o),0)>>>0;}
    function i2ip(nn){return [24,16,8,0].map(s=>(nn>>>s)&255).join('.');}
    function calc(){
      const raw=box.querySelector('#cbase').value.trim(), m=raw.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
      const sum=box.querySelector('#csum'), tab=box.querySelector('#ctab'), bar=box.querySelector('#cbar');
      if(!m){ sum.textContent='Enter a valid CIDR like 10.0.0.0/16'; tab.innerHTML=''; bar.innerHTML=''; return; }
      const base=ip2i(m[1]), prefix=+m[2], count=+box.querySelector('#ccount').value;
      const bits=Math.ceil(Math.log2(count)), np=prefix+bits;
      if(np>32){ sum.textContent='Too many subnets for this size.'; return; }
      const size=2**(32-np);
      sum.innerHTML='VPC <b>'+raw+'</b> → '+count+' × <b>/'+np+'</b> ('+size.toLocaleString()+' addrs each)';
      const cols=['#ff9900','#4f8cff','#3fb950','#d29922','#c586ff','#ff7b72','#56d4dd','#f0883e'];
      let rows='<tr><th>#</th><th>CIDR</th><th>range</th></tr>', b2='';
      for(let i=0;i<count;i++){ const s=base+i*size;
        rows+='<tr><td>'+i+'</td><td>'+i2ip(s)+'/'+np+'</td><td>'+i2ip(s)+'–'+i2ip(s+size-1)+'</td></tr>';
        b2+='<span style="background:'+cols[i%cols.length]+';flex:1">/'+np+'</span>'; }
      tab.innerHTML=rows; bar.innerHTML=b2;
    }
    box.querySelector('#cbase').oninput=calc; box.querySelector('#ccount').onchange=calc; calc();
    box.querySelector('#cbtn').onclick=()=>{
      const v=box.querySelector('#cans').value.trim().toLowerCase().replace(/\s/g,''), fb=box.querySelector('#cfb');
      if(v===step.task.answer.toLowerCase()){ fb.className='cp-feedback ok'; fb.textContent='✓ Correct!'; if(!done[idx]) award(10); done[idx]=true; refreshNav(); }
      else { fb.className='cp-feedback no'; fb.textContent='Not quite — use the calculator above to check.'; }
    };
    return box;
  }

  function renderConcept(step){
    const box=document.createElement('div');
    box.innerHTML=`<div class="card"><h2>${step.title}</h2>${step.body}</div>`;
    done[idx]=true;
    return box;
  }

  function render(){
    const step=lesson.steps[idx];
    stage.innerHTML='';
    const kick={concept:'Concept',quiz:'Knowledge check',terminal:'Your turn — mock terminal',checkpoint:'Checkpoint',cidr:'Interactive'}[step.type];
    const tagcls={concept:'concept',quiz:'quiz',terminal:'term',checkpoint:'check',cidr:'term'}[step.type];
    const head=document.createElement('div'); head.innerHTML=`<div class="tasktag ${tagcls}">${kick}</div>`;
    stage.appendChild(head);
    if(step.type==='terminal'){ const p=document.createElement('p'); p.innerHTML=step.instruction; stage.appendChild(p); stage.appendChild(renderTerminal(step)); }
    else if(step.type==='quiz') stage.appendChild(renderQuiz(step));
    else if(step.type==='checkpoint') stage.appendChild(renderCheckpoint(step));
    else if(step.type==='cidr'){ const p=document.createElement('p'); p.innerHTML=step.instruction||''; stage.appendChild(p); stage.appendChild(renderCidr(step)); }
    else stage.appendChild(renderConcept(step));
    setProgress(); refreshNav(); backBtn.disabled=idx===0; window.scrollTo(0,0);
  }

  function refreshNav(){
    const last=idx===lesson.steps.length-1;
    nextBtn.textContent=last?'Finish ✓':'Next →';
    nextBtn.disabled=!done[idx];
    const t=lesson.steps[idx].type;
    lockNote.textContent = done[idx] ? '' : ({terminal:'Run the command to continue',quiz:'Answer to continue',checkpoint:'Pass the checkpoint',cidr:'Answer to continue'}[t]||'');
  }

  nextBtn.onclick=()=>{ if(!done[idx]) return; if(idx===lesson.steps.length-1){ finish(); return; } idx++; render(); };
  backBtn.onclick=()=>{ if(idx>0){ idx--; render(); } };

  function finish(){
    stage.innerHTML=`<div class="done-screen"><div class="big">🎉</div>
      <h1>Lesson complete</h1>
      <p>You scored <strong>${xp} XP</strong> on <strong>${lesson.name}</strong>.</p>
      ${lesson.liveUrl?`<p><a class="live-btn" href="${lesson.liveUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px">↗ Do it for real (live env)</a></p>`:''}
      <p style="margin-top:14px"><a class="live-btn" href="interactive.html" style="display:inline-block">← Back to all lessons</a></p></div>`;
    document.getElementById('progress-fill').style.width='100%';
    document.querySelector('.nav').style.display='none';
  }

  setScore(); render();
}
