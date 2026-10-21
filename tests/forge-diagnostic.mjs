// Dependency-free diagnostic laboratory. No network, AI API or file mutations.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const html=readFileSync('cockpit.html','utf8');
const slice=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a);if(a<0||b<0)throw Error('Missing engine section: '+start);return html.slice(a,b)};
const source=slice('const intentSignals=','function renderQuestionDiagnosis(')+slice('const constraintPatterns=','function renderQuestionDiagnosis(');
const ctx=runInNewContext(source+'\n({interpretQuestion,extractQuestionContext})');
const scenarios=[
 ['I want to grow without hiring more staff, on a minimal budget, within 3 months.',['no_hiring','low_budget','time'],'capacity'],
 ['How can I improve sales and customer conversion without coding?',['no_code'],'demand'],
 ['Reduce delays and waiting in construction handoffs within 2 weeks.',['time'],'delay'],
 ['We need to automate repetitive paperwork but cannot hire.',['no_hiring'],'automation'],
 ['How do we reduce expensive supplier costs with no capital?',['low_budget'],'cost'],
 ['Build a remote consulting practice from home with a small budget.',['remote','low_budget'],null],
 ['I need to improve risk and safety for a property portfolio. ',[],'risk'],
 ['Launch a digital service without programming and with zero funding.',['no_code','low_budget'],'automation']
];
const cases=[];for(let repeat=0;repeat<15;repeat++)for(const [q,expected,signal] of scenarios){
 const d=ctx.interpretQuestion(q),c=ctx.extractQuestionContext(q),ids=c.constraints.map(x=>x.id);
 const missing=expected.filter(x=>!ids.includes(x)),signalMatch=!signal||d.primary?.id===signal||d.secondary?.id===signal;
 cases.push({question:q,expected,detected:ids,primary:d.primary?.id||null,pass:missing.length===0&&signalMatch,missing,signalMatch});
}
const passed=cases.filter(x=>x.pass).length;
const report={generatedAt:new Date().toISOString(),total:cases.length,passed,failed:cases.length-passed,uniqueCases:scenarios.length,method:'Deterministic rule checks repeated 15 times; not evidence of independent intelligence or real-world accuracy.',failures:cases.filter(x=>!x.pass).slice(0,30)};
mkdirSync('reports',{recursive:true});writeFileSync('reports/forge-diagnostic.json',JSON.stringify(report,null,2)+'\n');
writeFileSync('reports/forge-diagnostic.md','# FORGE diagnostic laboratory\n\n'+report.generatedAt+'\n\n'+passed+'/'+cases.length+' checks passed across '+scenarios.length+' unique questions.\n\n'+report.method+'\n\n## Failures\n'+(report.failures.map(x=>'- '+x.question+' (missing: '+x.missing.join(', ')+', signal match: '+x.signalMatch+')').join('\n')||'None detected in this limited suite.')+'\n');
console.log('FORGE diagnostic:',passed+'/'+cases.length,'passed');
if(report.failed)process.exitCode=1;
