/* MOCK TERRAFORM — simulated `terraform` CLI over a pretend main.tf. */
function makeTf(){
  const st={ inited:false, resources:[], applied:false };
  // pretend the working dir has a main.tf declaring these
  const declared=['aws_vpc.main','aws_subnet.public','aws_instance.web'];
  function tok(s){ return (s.match(/\S+/g)||[]); }

  function run(input){
    const p=tok(input.trim()); if(!p.length) return {out:''};
    if(p[0]==='clear') return {out:'__CLEAR__'};
    if(p[0]==='help') return {out:'terraform: init | validate | fmt | plan | apply [-auto-approve] | destroy [-auto-approve] | state list'};
    if(p[0]==='ls') return {out:'main.tf  variables.tf  outputs.tf'};
    if(p[0]==='cat') return {out:'resource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n}'};
    if(p[0]!=='terraform'&&p[0]!=='tofu') return {err:p[0]+": command not found (use 'terraform ...')"};
    const sub=p[1], a=p.slice(2);
    switch(sub){
      case 'init': st.inited=true; return {out:'Initializing provider plugins...\n- Installing hashicorp/aws...\n\nTerraform has been successfully initialized!'};
      case 'validate': return st.inited?{out:'Success! The configuration is valid.'}:{err:'Error: module not initialized — run: terraform init'};
      case 'fmt': return {out:'main.tf'};
      case 'plan':
        if(!st.inited) return {err:'Error: run "terraform init" first'};
        return {out:declared.map(r=>'  # '+r+' will be created').join('\n')+'\n\nPlan: '+declared.length+' to add, 0 to change, 0 to destroy.'};
      case 'apply':
        if(!st.inited) return {err:'Error: run "terraform init" first'};
        if(!a.includes('-auto-approve')) return {out:'Do you want to perform these actions?\n  Terraform will perform the actions described above.\n(re-run with -auto-approve in this lab: terraform apply -auto-approve)'};
        st.resources=declared.slice(); st.applied=true;
        return {out:declared.map(r=>r+': Creating...\n'+r+': Creation complete').join('\n')+'\n\nApply complete! Resources: '+declared.length+' added, 0 changed, 0 destroyed.'};
      case 'destroy':
        if(!a.includes('-auto-approve')) return {out:'(re-run with -auto-approve in this lab: terraform destroy -auto-approve)'};
        {const n=st.resources.length; st.resources=[]; st.applied=false; return {out:'Destroy complete! Resources: '+n+' destroyed.'};}
      case 'state':
        if(a[0]==='list') return {out: st.resources.length? st.resources.join('\n') : '(no resources — apply first)'};
        return {out:''};
      case '--version': return {out:'Terraform v1.7.0 (mock)'};
      default: return {err:"terraform: '"+sub+"' not simulated (try init, plan, apply, destroy, state list)"};
    }
  }
  return { run, prompt:()=>'you@devops:~/infra$ ',
    inited:()=>st.inited, applied:()=>st.applied, resourceCount:()=>st.resources.length, state:st };
}
if (typeof module!=='undefined') module.exports={makeTf};
