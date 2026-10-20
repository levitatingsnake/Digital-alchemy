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
  ['Saved history validation', 'x.history.filter(validHistoryEntry)'],
  ['Saved trace validation', 'x.trace.filter(validTraceEntry)'],
  ['Saved rule validation', 'x.learnedRules.filter(validRule)'],
  ['Saved snapshot validation', 'function validSnapshot(x)'],
  ['Malformed archive entries are filtered', 'x.history.filter(validHistoryEntry)'],
  ['Oversized archives are bounded on restore', '.slice(-100)'],
  ['Discovery cycle requires fresh reports from this run', 'buildDiscoveryCycleAudit(before,'],
  ['Local persistence of research reports', 'blindSpotReports:state.blindSpotReports'],
  ['Export of research reports', 'blindSpotReports:current.blindSpotReports,methodology:']
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
const exportHelperStart = applicationScript.indexOf('function createExportPayload(');
const exportHelperEnd = applicationScript.indexOf("document.getElementById('export').addEventListener", exportHelperStart);
if (exportHelperStart < 0 || exportHelperEnd < 0) throw new Error('Cannot isolate export payload builder.');
const exportHelper = applicationScript.slice(exportHelperStart, exportHelperEnd);
const modelSource = [
  applicationScript.slice(coreStart, coreEnd),
  functionBlock('buildPrometheusHoldout', 'measurePrometheusRule'),
  functionBlock('measurePrometheusRule', 'buildBlindSpotFamilies'),
  functionBlock('buildBlindSpotFamilies', 'runDiscoveryCycle'),
  functionBlock('buildDiscoveryCycleAudit', 'runDiscoveryCycle'),
  functionBlock('validVector', 'load'),
  exportHelper,
  'globalThis.testApi={state,goals,ops,clamp,score,apply,buildPrometheusHoldout,measurePrometheusRule,buildBlindSpotFamilies,buildDiscoveryCycleAudit,validVector,validSnapshot,validHistoryEntry,validTraceEntry,validRule,createExportPayload};'
].join('\n');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(modelSource, sandbox, { timeout: 3000 });
const api = sandbox.testApi;
function assertModel(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS: ${message}`);
}
const cycleGoal = 'balanced';
const cycleTypes = ['conditional-pattern-scan','discriminating-experiment-design','anomaly-challenge-protocol'];
const cycleReports = cycleTypes.map(type=>({type,goal:cycleGoal}));
const cycleBefore = {values:'[10,20,30,40]',stability:5,goal:cycleGoal,rules:'[]'};
const cycleAfter = {values:[10,20,30,40],stability:5,goal:cycleGoal,learnedRules:[]};
const freshCycleAudit = api.buildDiscoveryCycleAudit(cycleBefore,cycleAfter,new Set(),cycleReports,cycleGoal,2,'2026-10-20T00:00:00.000Z');
assertModel(freshCycleAudit.passed && freshCycleAudit.missingReports.length===0 && freshCycleAudit.statePreserved, 'discovery cycle audit passes with all fresh reports and preserved state');
const staleCycleAudit = api.buildDiscoveryCycleAudit(cycleBefore,cycleAfter,new Set(cycleReports),cycleReports,cycleGoal,2,'2026-10-20T00:00:00.000Z');
assertModel(!staleCycleAudit.passed && staleCycleAudit.missingReports.length===3, 'discovery cycle audit rejects stale reports from earlier runs');
const incompleteCycleAudit = api.buildDiscoveryCycleAudit(cycleBefore,cycleAfter,new Set(),cycleReports.slice(0,2),cycleGoal,2,'2026-10-20T00:00:00.000Z');
assertModel(!incompleteCycleAudit.passed && incompleteCycleAudit.missingReports.includes('anomaly-challenge-protocol'), 'discovery cycle audit identifies missing stage reports');
const mutatedCycleAudit = api.buildDiscoveryCycleAudit(cycleBefore,{...cycleAfter,stability:9},new Set(),cycleReports,cycleGoal,2,'2026-10-20T00:00:00.000Z');
assertModel(!mutatedCycleAudit.passed && !mutatedCycleAudit.statePreserved, 'discovery cycle audit detects working-state mutation');
const exportState = {values:[1,2,3,4],stability:5,goal:'balanced',history:[{id:'h1'}],trace:[{op:'Separate'}],learnedRules:[{name:'r1'}],integrityReports:[{passed:true}],prometheusReports:[{verdict:'test'}],lawForgeReports:[{generation:1}],blindSpotReports:[{type:'audit'}]};
const exported = api.createExportPayload(exportState,{name:'Balanced'},'2026-10-20T00:00:00.000Z');
const exportedRoundTrip = JSON.parse(JSON.stringify(exported));
assertModel(exportedRoundTrip.schemaVersion === 4 && exportedRoundTrip.app === 'Digital Alchemy Lab', 'export has app identity and schema version');
assertModel(exportedRoundTrip.exportedAt === '2026-10-20T00:00:00.000Z', 'export preserves supplied timestamp');
assertModel(JSON.stringify(exportedRoundTrip.currentState.values) === JSON.stringify([1,2,3,4]) && exportedRoundTrip.currentState.goalConfig.name === 'Balanced', 'export includes current state and goal configuration');
for (const key of ['experimentLedger','trace','learnedRules','integrityReports','prometheusReports','lawForgeReports','blindSpotReports']) assertModel(Array.isArray(exportedRoundTrip[key]) && exportedRoundTrip[key].length === 1, 'export includes '+key);
assertModel(Array.isArray(exportedRoundTrip.methodology.limitations) && exportedRoundTrip.methodology.limitations.length >= 5, 'export carries methodology limitations');
const goodSnapshot = {values:[10,20,30,40],stability:5};
const goodHistory = {id:'abc',title:'Test',time:'2026-10-20',ops:['Separate'],start:goodSnapshot,end:goodSnapshot,score:50};
assertModel(api.validSnapshot(goodSnapshot), 'valid saved snapshot is accepted');
assertModel(!api.validSnapshot({values:[10,20,NaN,40],stability:5}), 'snapshot containing NaN is rejected');
assertModel(!api.validSnapshot({values:[10,20,30,101],stability:5}), 'snapshot outside model bounds is rejected');
assertModel(api.validHistoryEntry(goodHistory), 'well-formed history record is accepted');
assertModel(!api.validHistoryEntry({...goodHistory,ops:['not-an-operation']}), 'history record with unknown operation is rejected');
assertModel(!api.validHistoryEntry({...goodHistory,end:{values:[1],stability:5}}), 'history record with malformed ending state is rejected');
assertModel(api.validTraceEntry({op:'Separate',before:[1,2,3,4],after:[2,3,4,5],score:50}), 'well-formed trace record is accepted');
assertModel(!api.validTraceEntry({op:'Separate',before:[1,2],after:[2,3,4,5],score:50}), 'trace record with malformed vector is rejected');
assertModel(api.validRule({name:'rule',delta:[1,2,3,4],ds:1}), 'well-formed saved rule is accepted');
assertModel(!api.validRule({name:'rule',delta:[1,2,3,NaN],ds:1}), 'saved rule containing NaN is rejected');
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
const boundaryStates = [
  {values:[0,0,0,0],stability:0},
  {values:[100,100,100,100],stability:10},
  {values:[0,100,0,100],stability:5},
  {values:[100,0,100,0],stability:10},
  {values:[50,50,50,50],stability:5}
];
for (const goal of ['balanced','concentrated','purified','stable','custom']) {
  for (const sample of boundaryStates) {
    const value = api.score(sample, goal);
    assertModel(Number.isFinite(value) && value >= 0 && value <= 100, `alignment score stays within 0-100 for ${goal}`);
  }
}
const edgeSample = {values:[0,100,0,100],stability:0};
const edgeBefore = JSON.stringify(edgeSample);
for (const op of api.ops) api.apply(edgeSample, op);
assertModel(JSON.stringify(edgeSample) === edgeBefore, 'operations do not mutate their input state');
const customScore = api.score({values:[65,35,70,8],stability:8}, 'custom');
assertModel(customScore === 100, 'custom intention scores 100 at its exact target');
const rule = {name:'smoke-test-rule',delta:[8,-4,3,-7],ds:1};
const measureA = api.measurePrometheusRule(rule,holdA), measureB = api.measurePrometheusRule(rule,holdB);
assertModel(JSON.stringify(measureA) === JSON.stringify(measureB), 'saved-rule scoring is repeatable on identical samples');
assertModel(Number.isFinite(measureA.mean) && measureA.winRate >= 0 && measureA.winRate <= 100 && measureA.worst >= -100 && measureA.worst <= 100, 'saved-rule metrics are finite and bounded');
console.log(`Dynamic model checks passed: ${holdA.length} holdout states, ${operationChecks} operation applications, five targeted families.`);
console.log('All static and dynamic smoke checks passed.');
