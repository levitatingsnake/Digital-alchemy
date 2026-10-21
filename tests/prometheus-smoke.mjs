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
for(const name of ['buildDecisionReadout','buildCounterfactual','buildEvidenceIntelligence','buildStrategyConstellation','buildDecisionFingerprint','buildInterventionForge']){
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
