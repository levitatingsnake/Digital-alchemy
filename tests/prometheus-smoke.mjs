// Dependency-free static regression checks for the Prometheus UI.
// Run: node tests/prometheus-smoke.mjs
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
const pages=['console.html','decision-lab.html'];
for(const page of pages){
 const html=readFileSync(page,'utf8');
 assert.match(html,/<link rel="stylesheet" href="prometheus-visual.css">/,page+' shared style link');
 assert.match(html,/<textarea\b[^>]*id="(?:chamberQuestion|question)"/,page+' question textarea');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
 assert.ok(scripts.length,page+' contains JS');
 for(const [index,source] of scripts.entries())new Script(source,{filename:page+':script-'+index});
 console.log('PASS',page,'scripts:',scripts.length);
}
const css=readFileSync('prometheus-visual.css','utf8');
assert.match(css,/#chamberQuestion,#question/);
assert.match(css,/prefers-reduced-motion/);
const lab=readFileSync('decision-lab.html','utf8');
for(const name of ['buildDecisionReadout','buildCounterfactual','buildEvidenceIntelligence','buildStrategyConstellation','buildDecisionFingerprint','buildInterventionForge','buildExperimentProtocol','buildMechanismLab','buildMechanismGate','buildExperimentalPortfolio']){
 assert.equal((lab.match(new RegExp('function '+name+'\\(','g'))||[]).length,1,name+' defined once');
 assert.match(lab,new RegExp('html\\+=' +name+'\\('),name+' included in results');
}
console.log('PASS Prometheus static regression checks');

// Execute the actual model's pure scoring and search functions in isolation.
// This catches regressions in the decision logic without a browser or dependencies.
const source=readFileSync('decision-lab.html','utf8');
const start=source.indexOf('function objective(');
const end=source.indexOf('function evidenceSources(',start);
assert.ok(start>=0&&end>start,'pure solver functions found');
const model=runInNewContext(source.slice(start,end)+'\n({objective,solve,stabilityScan})',{Math,Set,Map,Number});
const sample=[
 {id:'a',name:'Fast',cost:100,impact:80,risk:5,speed:95,cat:'operations'},
 {id:'b',name:'Safe',cost:120,impact:60,risk:1,speed:40,cat:'risk'},
 {id:'c',name:'Costly',cost:900,impact:99,risk:20,speed:30,cat:'operations'}
];
const best=model.solve(sample,250,2,'balanced',28);
assert.ok(best.selected.length<=2,'initiative limit');
assert.ok(best.cost<=250,'budget cap');
assert.ok(best.selected.every(x=>x.id!=='c'),'unaffordable item excluded');
assert.equal(best.checks,8,'all subsets enumerated');
const zero=model.solve(sample,0,2,'balanced',28);
assert.equal(zero.selected.length,0,'zero budget selects no initiatives');
const stress=model.stabilityScan(sample,250,2,'balanced',best.selected);
assert.equal(stress.levels.length,5,'five stress scenarios');
assert.ok(stress.stableItems.every(x=>x.stability>=0&&x.stability<=5),'stability counts bounded');
const speed=model.solve(sample,250,1,'speed',28);
assert.equal(speed.selected[0].id,'a','speed priority selects fast option');
console.log('PASS model constraints, exact enumeration, stress sensitivity, and objective switching');

const labSource=readFileSync('decision-lab.html','utf8');
for(const fn of ['probeExperimentalSensitivity','renderExperimentalSensitivity','exportExperimentalReport','runExperimentalPortfolio','generateMechanismHypotheses']){
 assert.equal(labSource.split('function '+fn+'(').length-1,1,fn+' declared once');
}
assert.match(labSource,/runExperimentalPortfolio\(\)/,'comparison button wired');
assert.match(labSource,/exportExperimentalReport\(\)/,'export button wired');
assert.ok(labSource.includes('function buildEvidenceNextStep('),'actionable evidence plan exists');
assert.ok(labSource.includes('buildEvidenceNextStep(probe)'),'evidence plan wired into sensitivity readout');
const sensitivityStart=labSource.indexOf('function probeExperimentalSensitivity(');
const sensitivityEnd=labSource.indexOf('function renderExperimentalSensitivity(',sensitivityStart);
assert.ok(sensitivityStart>=0&&sensitivityEnd>sensitivityStart);
const probe=runInNewContext(labSource.slice(sensitivityStart,sensitivityEnd)+'\nprobeExperimentalSensitivity',{solve:model.solve,Math,Number});
const candidate={id:'new',name:'New approach',cost:75,impact:80,risk:5,speed:80,cat:'experimental'};
const scan=probe(sample,candidate,250,2,'balanced',28);
assert.equal(scan.findings.length,4,'four assumption dimensions tested');
assert.ok(scan.findings.every(f=>f.tests.length>=1&&f.tests.length<=4),'bounded local probes');
assert.ok(scan.findings.every(f=>f.tests.every(t=>Number.isFinite(t.score))),'finite scores');
assert.ok(scan.baseline.selected.every(it=>it.id!=='new'),'baseline excludes hypothetical candidate');
console.log('PASS experimental sensitivity scan and baseline isolation');

assert.ok(scan.findings.every(f=>new Set(f.tests.map(t=>t.value)).size===f.tests.length),'no duplicate boundary probes');
assert.ok(scan.findings.every(f=>!f.changed||Number.isFinite(f.relativeShift)),'changed assumptions have finite relative sensitivity');
const mechanismStart=labSource.indexOf('function generateMechanismHypotheses(');
const mechanismEnd=labSource.indexOf('function buildMechanismLab(',mechanismStart);
assert.ok(mechanismStart>=0&&mechanismEnd>mechanismStart,'mechanism generator available');
const generate=runInNewContext(labSource.slice(mechanismStart,mechanismEnd)+'\ngenerateMechanismHypotheses',{Set,String});
const delayed=generate(sample,'How can we reduce waiting and delays?','balanced');
assert.equal(delayed[0].mechanism,'event-triggered handoff','waiting signal prioritised');
const misleading=generate(sample,'How to improve timely workflows?','balanced');
assert.ok(misleading[0].origin.includes('Fallback'),'substring time in timely does not count as an intent signal');
console.log('PASS mechanism matching and evidence-priority regression checks');

const cockpitSource=readFileSync('cockpit.html','utf8');
assert.ok(cockpitSource.includes('One question.'),'customer cockpit headline');
assert.ok(cockpitSource.includes('Three ways forward.'),'three-plan proposition');
assert.ok(cockpitSource.includes('function generate(){'),'customer generation action');
assert.ok(cockpitSource.includes('function planMarkup('),'detailed plan renderer');
assert.ok(cockpitSource.includes('decision-lab.html'),'engineering view remains accessible');
const cockpitScript=cockpitSource.split('<script>')[1]?.split('</script>')[0];
assert.ok(cockpitScript,'cockpit has embedded script');
new Script(cockpitScript,{filename:'cockpit.html'});
console.log('PASS simplified customer cockpit structure and JavaScript syntax');

for(const heading of ['Opportunity and strategic logic','Business case and financial model','90-day implementation plan','Evidence required before investment','Risks, compliance and stop conditions']){
 assert.ok(cockpitSource.includes(heading),'strategy briefing includes '+heading);
}
for(const domain of ['business','construction','finance','investing','property']){
 assert.ok(cockpitSource.includes(domain+':{market:'),'domain-specific strategy guidance for '+domain);
}
assert.ok(cockpitSource.includes('planMarkup(p.v,p.run,p.i,question,domain,diagnosis)'),'domain context passed to all three briefings');
console.log('PASS comprehensive three-plan strategy structure');

assert.ok(cockpitSource.includes('const modelPlaybooks='),'model-specific strategy library exists');
for(const name of ['The repeatable system','The partnership network','The specialist wedge'])assert.ok(cockpitSource.includes(name),'distinct strategy: '+name);
assert.ok(cockpitSource.includes('const p=modelPlaybooks[domain][index]'),'model-specific domain playbook used');
for(const label of ['Who benefits:','Value proposition:','Distribution or adoption:','Economic logic:','First proof:'])assert.ok(cockpitSource.includes(label),'model differentiation includes '+label);
console.log('PASS three distinct business-model pathways');

assert.ok(cockpitSource.includes('function interpretQuestion(question)'),'question interpreter exists');
assert.ok(cockpitSource.includes('renderQuestionDiagnosis(diagnosis)'),'question interpretation shown to user');
assert.ok(cockpitSource.includes('planMarkup(p.v,p.run,p.i,question,domain,diagnosis)'),'diagnosis passed to all strategies');
for(const signal of ['capacity','demand','delay','cost','risk','automation'])assert.ok(cockpitSource.includes("id:'"+signal+"'"),'intent signal '+signal);
const interpreterStart=cockpitSource.indexOf('const intentSignals=');
const interpreterEnd=cockpitSource.indexOf('const variants=',interpreterStart);
assert.ok(interpreterStart>=0&&interpreterEnd>interpreterStart);
const interpret=runInNewContext(cockpitSource.slice(interpreterStart,interpreterEnd)+'\ninterpretQuestion',{Set,String});
assert.equal(interpret('We need to grow without hiring more staff').primary.id,'capacity','capacity identified from user problem');
assert.equal(interpret('Improve the customer sales funnel').primary.id,'demand','demand identified from user problem');
assert.equal(interpret('A timely business decision').matched,0,'substring matches excluded');
console.log('PASS question-specific interpretation and safeguards');

assert.ok(cockpitSource.includes('function causalMarkup(index,diagnosis)'),'falsifiable causal analysis renderer');
for(const label of ['Critical assumption:','What would disprove it:','Smallest useful test:','Untested hypothesis'])assert.ok(cockpitSource.includes(label),'causal evidence: '+label);
console.log('PASS causal hypotheses and disconfirmation tests');

assert.ok(cockpitSource.includes('function economicsMarkup(index,run,diagnosis,domain)'),'economic modelling helper');
for(const signal of ['capacity','demand','delay','cost','risk','automation'])assert.ok(cockpitSource.includes(' '+signal+':{unit:'),'economic driver '+signal);
for(const label of ['Break-even months:','12-month net value:','No fabricated ROI','conservative, central and optimistic'])assert.ok(cockpitSource.includes(label),'economic model includes '+label);
console.log('PASS transparent question-specific unit economics');

assert.ok(cockpitSource.includes('function compareStrategies(plans,diagnosis)'),'cross-strategy decision arena');
for(const label of ['Evidence strength','Economic viability','Downside exposure','do not invest yet','synthetic optimisation scores are deliberately excluded'])assert.ok(cockpitSource.includes(label),'comparison gate '+label);
assert.ok(cockpitSource.includes('<details class=\\"advanced-analysis\\">') || cockpitSource.includes('<details class="advanced-analysis">'),'advanced comparison is opt-in');
assert.ok(cockpitSource.includes("plans.map(p=>planMarkup") ,'three strategies remain primary output');
console.log('PASS evidence-gated three-strategy decision arena');

assert.ok(cockpitSource.includes('function evidenceWorkbench()'),'optional evidence input UI');
assert.ok(cockpitSource.includes('function calculateEvidence()'),'client-side financial comparison');
for(const field of ['upfront','benefit','monthly'])assert.ok(cockpitSource.includes('data-field="'+field+'"'),'financial input '+field);
assert.ok(cockpitSource.includes('valid.length===3'),'comparison requires all three complete models');
console.log('PASS optional user-entered economics workbench');

assert.ok(cockpitSource.includes('function questionSpecificIntervention(index,diagnosis,domain)'),'intervention composition');
assert.ok(cockpitSource.includes('questionSpecificIntervention(index,diagnosis,domain)+causalMarkup'),'intervention included in each briefing');
for(const label of ['Tailored intervention design','Adaptation to your question:','Low-cost proof:','Trade-off:'])assert.ok(cockpitSource.includes(label),'tailored plan detail '+label);
console.log('PASS tailored intervention and trade-off composition');

assert.ok(cockpitSource.includes('function extractQuestionContext(question)'),'multi-clause context extraction');
assert.ok(cockpitSource.includes('contextMarkup(context)+constraintGateMarkup(index,context)+transformConstraint(index,context,domain)+alchemyCompositionMarkup(index,context)+questionSpecificIntervention'),'constraints included in all plans');
for(const id of ['no_hiring','low_budget','no_code','time','remote'])assert.ok(cockpitSource.includes("id:'"+id+"'"),'explicit constraint '+id);
const ctxStart=cockpitSource.indexOf('const constraintPatterns=');
const ctxEnd=cockpitSource.indexOf('function renderQuestionDiagnosis(',ctxStart);
const getContext=runInNewContext(cockpitSource.slice(ctxStart,ctxEnd)+'\nextractQuestionContext',{String});
const constrained=getContext('I want to grow without hiring more staff. We have a minimal budget and need results within 3 months.');
assert.ok(constrained.constraints.some(x=>x.id==='no_hiring'),'staffing constraint detected');
assert.ok(constrained.constraints.some(x=>x.id==='low_budget'),'budget constraint detected');
assert.ok(constrained.constraints.some(x=>x.id==='time'),'delivery window detected');
console.log('PASS multi-clause goals and explicit constraint extraction');

assert.ok(cockpitSource.includes('function assessConstraints(index,context)'),'constraint-aware strategy screening');
assert.ok(cockpitSource.includes('constraintGateMarkup(index,context)+transformConstraint(index,context,domain)+alchemyCompositionMarkup(index,context)+questionSpecificIntervention'),'constraint checks appear in each plan');
for(const term of ['no_hiring','low_budget','no_code','time','remote'])assert.ok(cockpitSource.includes("ids.includes('"+term+"')"),'constraint affects recommendations: '+term);
console.log('PASS constraint-aware strategy screening');

assert.ok(cockpitSource.includes('function selectConstraintAware(items,context,priority)'),'constraint-aware candidate selection');
assert.ok(cockpitSource.includes('run:selectConstraintAware(items,context,v.priority)'),'optimisation uses screened candidates');
for(const term of ['low_budget','no_hiring','no_code','time'])assert.ok(cockpitSource.includes("ids.has('"+term+"')"),'selection responds to '+term);
console.log('PASS constraints alter candidate selection before optimisation');

assert.ok(cockpitSource.includes('function transformConstraint(index,context,domain)'),'alchemy transformation logic');
for(const label of ['Outcome-based specialist partnerships','Pre-commitment before investment','Manual concierge prototype','Remote coordination and local fulfilment'])assert.ok(cockpitSource.includes(label),'transformation mechanism: '+label);
console.log('PASS alchemy substitution hypotheses');

assert.ok(cockpitSource.includes('function composeAlchemyMechanisms(index,context)'),'alchemy composition function');
assert.ok(cockpitSource.includes('function alchemyCompositionMarkup(index,context)'),'alchemy composition rendering');
assert.ok(cockpitSource.includes('transformConstraint(index,context,domain)+alchemyCompositionMarkup(index,context)'),'composed alternatives appear in plans');
console.log('PASS combined alchemy concepts');

assert.ok(cockpitSource.includes('function evaluateAlchemyConcept(index,context)'),'feasibility assessment');
for(const name of ['Cash exposure','Delivery capacity','Implementation speed','Technical complexity','Operating model'])assert.ok(cockpitSource.includes(name),'feasibility dimension '+name);
assert.ok(cockpitSource.includes('assessment.checks.map'),'feasibility checks rendered');
console.log('PASS composed concept feasibility checks');

assert.ok(cockpitSource.includes('<details class="plan-deep-dive">'),'detailed plan collapses by default');
assert.ok(cockpitSource.includes('</div></details><div class="plan-conclusion">'),'summary and conclusion remain visible');
console.log('PASS progressive disclosure for strategy reports');

assert.ok(cockpitSource.includes('const parts=options;'),'composition retains all applicable constraints');
console.log('PASS no constraint silently dropped from composition');
