// Dependency-free static regression checks for the Prometheus UI.
// Run: node tests/prometheus-smoke.mjs
import {readFileSync, existsSync} from 'node:fs';
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
for(const name of ['buildDecisionReadout','buildCounterfactual','buildEvidenceIntelligence','buildStrategyConstellation']){
 assert.equal((lab.match(new RegExp('function '+name+'\\(','g'))||[]).length,1,name+' defined once');
 assert.match(lab,new RegExp('html\\+=' +name+'\\('),name+' included in results');
}
console.log('PASS Prometheus static regression checks');
