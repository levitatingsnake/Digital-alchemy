import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
if (scriptStart < 0 || scriptEnd < 0 || html.indexOf('<script>', scriptStart + 1) >= 0) {
  console.error('Expected exactly one inline application script.');
  process.exit(1);
}
const applicationScript = html.slice(scriptStart + '<script>'.length, scriptEnd);

const temporaryScript = path.join(os.tmpdir(), 'digital-alchemy-inline-check.js');
fs.writeFileSync(temporaryScript, applicationScript);
const syntax = spawnSync(process.execPath, ['--check', temporaryScript], { encoding: 'utf8' });
fs.rmSync(temporaryScript, { force: true });
if (syntax.status !== 0) {
  console.error(syntax.stderr || syntax.stdout || 'JavaScript syntax check failed.');
  process.exit(syntax.status ?? 1);
}
console.log('PASS: inline JavaScript parses.');

const required = [
  ['Discovery Cycle panel', '00F / DISCOVERY CYCLE'],
  ['Pattern Vault panel', '00D / PATTERN VAULT'],
  ['Experiment Designer panel', '00E / EXPERIMENT DESIGNER'],
  ['Anomaly Lab panel', '00C / ANOMALY LAB'],
  ['Discovery cycle function', 'function runDiscoveryCycle()'],
  ['Reproducibility audit function', 'function runReproducibilityAudit()'],
  ['Conditional pattern scanner', 'function scanConditionalPatterns()'],
  ['Discriminating experiment designer', 'function designDiscriminatingExperiments()'],
  ['Anomaly challenge protocol', 'function runAnomalyProtocol()'],
  ['Cycle audit record', "type:'discovery-cycle-audit'"],
  ['Discovery cycle requires fresh reports from this run', 'const missing=required.filter(type=>!createdTypes.has(type))'],
  ['Local persistence of research reports', 'blindSpotReports:state.blindSpotReports'],
  ['Export of research reports', 'blindSpotReports:state.blindSpotReports,methodology:']
];
for (const [label, needle] of required) {
  if (!html.includes(needle)) {
    console.error(`FAIL: ${label} missing (${needle}).`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}
for (const [label, needle] of [
  ['Discovery cycle button wiring', "getElementById('runDiscoveryCycle').addEventListener('click',runDiscoveryCycle)"],
  ['Reproducibility audit button wiring', "getElementById('runReproducibility').addEventListener('click',runReproducibilityAudit)"],
  ['Pattern scanner button wiring', "getElementById('scanPatterns').addEventListener('click',scanConditionalPatterns)"],
  ['Experiment designer button wiring', "getElementById('designExperiments').addEventListener('click',designDiscriminatingExperiments)"],
  ['Anomaly Lab button wiring', "getElementById('runAnomalyProtocol').addEventListener('click',runAnomalyProtocol)"]
]) {
  if (!html.includes(needle)) {
    console.error(`FAIL: ${label} missing.`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}
if (process.exitCode) process.exit(process.exitCode);

// Execute the pure model functions in an isolated Node VM. The UI and local storage are not loaded.
function functionBlock(name, nextName) {
  const start = applicationScript.indexOf(`function ${name}(`);
  const end = applicationScript.indexOf(`function ${nextName}(`, start + 1);
  if (start < 0 || end < 0) throw new Error(`Cannot isolate ${name}()`);
  return applicationScript.slice(start, end);
}
const coreStart = applicationScript.indexOf('const names=');
const coreEnd = applicationScript.indexOf('function synthesizeStrategy()', coreStart);
if (coreStart < 0 || coreEnd < 0) throw new Error('Cannot isolate core symbolic model.');
const modelSource = [
  applicationScript.slice(coreStart, coreEnd),
  functionBlock('buildPrometheusHoldout', 'measurePrometheusRule'),
  functionBlock('measurePrometheusRule', 'buildBlindSpotFamilies'),
  functionBlock('buildBlindSpotFamilies', 'runDiscoveryCycle'),
  'globalThis.testApi={state,goals,ops,clamp,score,apply,buildPrometheusHoldout,measurePrometheusRule,buildBlindSpotFamilies};'
].join('\n');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(modelSource, sandbox, { timeout: 3000 });
const api = sandbox.testApi;
function assertModel(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS: ${message}`);
}
const holdA = api.buildPrometheusHoldout();
const holdB = api.buildPrometheusHoldout();
assertModel(holdA.length === 128, 'holdout contains 128 samples');
assertModel(JSON.stringify(holdA) === JSON.stringify(holdB), 'holdout generation is deterministic');
assertModel(new Set(holdA.map(x => [...x.values, x.stability].join(','))).size === 128, 'holdout samples are unique');
assertModel(holdA.every(x => x.values.length === 4 && x.values.every(v => v >= 0 && v <= 100) && x.stability >= 0 && x.stability <= 10), 'holdout values stay within valid bounds');
const fixedTraining = new Set(Array.from({length:64},(_,i)=>[(i*37+13)%101,(i*53+29)%101,(i*29+47)%101,(i*71+7)%101,(i*7+3)%11].join(',')));
assertModel(holdA.every(x => !fixedTraining.has([...x.values,x.stability].join(','))), 'holdout excludes fixed training sequence');
const familiesA = api.buildBlindSpotFamilies(), familiesB = api.buildBlindSpotFamilies();
assertModel(familiesA.length === 5 && familiesA.every(x => x.samples.length === 64), 'five targeted challenge families contain 64 samples each');
assertModel(JSON.stringify(familiesA.map(x=>({name:x.name,samples:x.samples}))) === JSON.stringify(familiesB.map(x=>({name:x.name,samples:x.samples}))), 'targeted challenge families are deterministic');
let operationChecks = 0;
for (const sample of [...holdA.slice(0,32), ...familiesA.flatMap(x=>x.samples.slice(0,4))]) {
  for (const op of api.ops) {
    const out = api.apply(sample, op).state;
    assertModel(out.values.every(v => Number.isFinite(v) && v >= 0 && v <= 100) && Number.isFinite(out.stability) && out.stability >= 0 && out.stability <= 10, `operation ${op} stays in bounds`);
    const repeated = api.apply(sample, op).state;
    assertModel(JSON.stringify(out) === JSON.stringify(repeated), `operation ${op} is deterministic`);
    operationChecks++;
  }
}
const rule = {name:'smoke-test-rule',delta:[8,-4,3,-7],ds:1};
const measureA = api.measurePrometheusRule(rule,holdA), measureB = api.measurePrometheusRule(rule,holdB);
assertModel(JSON.stringify(measureA) === JSON.stringify(measureB), 'saved-rule scoring is repeatable on identical samples');
assertModel(Number.isFinite(measureA.mean) && measureA.winRate >= 0 && measureA.winRate <= 100 && measureA.worst >= -100 && measureA.worst <= 100, 'saved-rule metrics are finite and bounded');
console.log(`Dynamic model checks passed: ${holdA.length} holdout states, ${operationChecks} operation applications, five targeted families.`);
console.log('All static and dynamic smoke checks passed.');
