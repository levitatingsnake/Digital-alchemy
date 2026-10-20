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
  ['Paired baseline comparison button', 'id="compareBaseline"'],
  ['Cross-goal audit button', 'id="crossGoalAudit"'],
  ['Rule stability audit button', 'id="ruleStabilityAudit"'],
  ['Saved rule Apply buttons', 'data-apply-kept="'],
  ['Delegated saved-rule click handler', "root.onclick=function(event)"],
  ['Delegated handler targets Apply buttons', "event.target.closest('[data-apply-kept]')"],
  ['Apply handler calls candidate application', "applyCandidate({next},'Saved '+r.name,24)"],
  ['Rule stability audit wiring', "getElementById('ruleStabilityAudit').addEventListener('click',runRuleStabilityAudit)"],
  ['Discovery Evidence Ledger button', 'id="compileEvidenceLedger"'],
  ['Next experiment selector button', 'id="selectNextExperiment"'],
  ['Run selected probes button', 'id="runSelectedProbes"'],
  ['Run selected probes button wiring', "getElementById('runSelectedProbes').addEventListener('click',runSelectedProbes)"],
  ['Next experiment selector wiring', "getElementById('selectNextExperiment').addEventListener('click',selectNextExperiment)"],
  ['Discovery Evidence Ledger button wiring', "getElementById('compileEvidenceLedger').addEventListener('click',compileDiscoveryEvidenceLedger)"],
  ['Cross-goal audit button wiring', "getElementById('crossGoalAudit').addEventListener('click',auditAcrossGoals)"],
  ['Paired baseline comparison button wiring', "getElementById('compareBaseline').addEventListener('click',compareAgainstBaseline)"],
  ['Pattern Vault panel', '00D / PATTERN VAULT'],
  ['Experiment Designer panel', '00E / EXPERIMENT DESIGNER'],
  ['Anomaly Lab panel', '00C / ANOMALY LAB'],
  ['Portfolio quick proof demo button', 'id="runPortfolioDemo"'],
  ['Portfolio quick proof demo function', 'function runPortfolioDemo(){'],
  ['Portfolio demo runs integrity checks', 'runIntegrityTests();'],
  ['Portfolio demo runs reproducibility audit', 'runReproducibilityAudit();'],
  ['Portfolio demo explains evidence boundary', 'They do not establish real-world effectiveness or scientific truth'],
  ['Guided session console', 'id="missionTitle"'],
  ['Intention brief input', 'id="intentionText"'],
  ['Explicit model interpretation selector', 'id="intentionGoal"'],
  ['Bounded route comparison function', 'function compareCandidateRoutes(start,goal,maxDepth=4)'],
  ['Alternative endpoint comparison panel', 'Alternative endpoint comparison'],
  ['Alternative endpoint score delta', 'Change from starting alignment: '],
  ['Research report builder', 'function buildResearchReport(current,goalSettings,createdAt)'],
  ['Research report export button', 'id="exportReport"'],
  ['Research report download wiring', "getElementById('exportReport').addEventListener('click'"],
  ['Research report limitations', 'Synthetic holdout tests can reveal fragility within this model'],
  ['Research report next-experiment recommendation', 'Suggested next experiment'],
  ['Intention brief compiler', 'function compileIntentBrief()'],
  ['Intention brief button wiring', "getElementById('compileIntent').addEventListener('click',compileIntentBrief)"],
  ['Intent context persisted locally', 'intentText:state.intentText'],
  ['Intent context included in export', "intentText:current.intentText||''"],
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
  ['Discovery cycle summary uses audit contract', 'audit.requiredReports.length-missing.length'],
  ['Discovery cycle records stage failures', 'stageErrors:stageErrors.slice()'],
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
const exportHelperEnd = applicationScript.indexOf("document.getElementById('exportReport').addEventListener", exportHelperStart);
if (exportHelperStart < 0 || exportHelperEnd < 0) throw new Error('Cannot isolate export payload builder.');
const exportHelper = applicationScript.slice(exportHelperStart, exportHelperEnd);
const modelSource = [
  applicationScript.slice(coreStart, coreEnd),
  functionBlock('buildPrometheusHoldout', 'measurePrometheusRule'),
  functionBlock('buildBaselineComparison', 'buildCrossGoalAudit'),
  functionBlock('buildCrossGoalAudit', 'compareAgainstBaseline'),
  functionBlock('measurePrometheusRuleForGoal', 'buildDiscoveryEvidenceLedger'),
  functionBlock('buildRuleStabilityAudit', 'runRuleStabilityAudit'),
  functionBlock('buildDiscoveryEvidenceLedger', 'compileDiscoveryEvidenceLedger'),
  functionBlock('buildNextExperimentPlan', 'selectNextExperiment'),
  functionBlock('evaluateRecommendedProbes', 'runSelectedProbes'),
  functionBlock('measurePrometheusRule', 'buildBlindSpotFamilies'),
  functionBlock('buildBlindSpotFamilies', 'runDiscoveryCycle'),
  functionBlock('buildDiscoveryCycleAudit', 'runDiscoveryCycle'),
  functionBlock('runDiscoveryCycle', 'designDiscriminatingExperiments'),
  functionBlock('persist', 'setStatus'),
  functionBlock('load', 'showToast'),
  functionBlock('validVector', 'load'),
  exportHelper,
  'globalThis.testApi={state,goals,ops,clamp,score,apply,buildPrometheusHoldout,measurePrometheusRuleForGoal,buildRuleStabilityAudit,evaluateRecommendedProbes,buildNextExperimentPlan,buildDiscoveryEvidenceLedger,buildCrossGoalAudit,measurePrometheusRule,buildBaselineComparison,buildBlindSpotFamilies,buildDiscoveryCycleAudit,runDiscoveryCycle,persist,load,validVector,validSnapshot,validHistoryEntry,validTraceEntry,validRule,createExportPayload};'
].join('\n');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(modelSource, sandbox, { timeout: 3000 });
const api = sandbox.testApi;
function assertModel(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS: ${message}`);
}
const activeRules=[{name:'fragile-rule',delta:[-8,2,0,0],ds:-2},{name:'untested-rule',delta:[0,0,8,-3],ds:1},{name:'promising-rule',delta:[1,1,-1,1],ds:0}];
const activeLedger={rules:[{name:'fragile-rule',status:'FRAGILE OR CONTRADICTED',measurementCount:4,positiveMeasurements:1,negativeMeasurements:3},{name:'promising-rule',status:'REPEATEDLY POSITIVE IN RECORDED TESTS',measurementCount:5,positiveMeasurements:5,negativeMeasurements:0}]};
const activeSamples=Array.from({length:64},(_,i)=>({values:[(i*17)%101,(i*31)%101,(i*47)%101,(i*61)%101],stability:i%11}));
const activeSamplesBefore=JSON.stringify(activeSamples);
const activeA=api.buildNextExperimentPlan(activeRules,activeSamples,activeLedger,'balanced');
const activeB=api.buildNextExperimentPlan(activeRules,activeSamples,activeLedger,'balanced');
assertModel(activeA.priorityRules[0].name==='fragile-rule'&&activeA.priorityRules[1].name==='untested-rule', 'next experiment selector prioritises fragile and under-tested rules');
assertModel(activeA.probes.length===8&&activeA.probes.every((p,i)=>i===0||activeA.probes[i-1].spread>=p.spread), 'next experiment selector returns eight probes ranked by prediction disagreement');
assertModel(new Set(activeA.probes.map(p=>p.sample.values.join(',')+'/'+p.sample.stability)).size===activeA.probes.length, 'next experiment selector keeps probe states distinct');
assertModel(JSON.stringify(activeA)===JSON.stringify(activeB)&&JSON.stringify(activeSamples)===activeSamplesBefore, 'next experiment plan is deterministic and does not mutate candidate samples');
const ledgerProm=[
 {type:'prometheus-trial',timestamp:'t1',results:[{name:'rule-a',holdoutMean:2,holdoutWinRate:70,worst:-2,verdict:'ROBUST IN THIS TEST'},{name:'rule-b',holdoutMean:-1,holdoutWinRate:30,worst:-12,verdict:'DOES NOT GENERALISE'}]},
 {type:'paired-baseline-comparison',timestamp:'t2',rules:[{name:'rule-a',mean:1.5,winRate:65,worst:-3},{name:'rule-b',mean:-0.5,winRate:40,worst:-10}]},
 {type:'cross-goal-robustness-audit',timestamp:'t3',summaries:[{name:'rule-a',meanAcrossGoals:1.2,positiveGoals:4,weakestGoal:'Purified',weakestMean:-0.2,goals:[{worst:-3},{worst:-2}]},{name:'rule-b',meanAcrossGoals:-1,positiveGoals:1,weakestGoal:'Stable',weakestMean:-4,goals:[{worst:-12},{worst:-10}]}]}
];
const ledgerBlind=[{timestamp:'t4',rules:[{name:'rule-a',weakestMean:-2,weakest:'Low-value states'},{name:'rule-b',weakestMean:-12,weakest:'Saturation boundaries'}]}];
const ledger=api.buildDiscoveryEvidenceLedger(ledgerProm,ledgerBlind,[{name:'rule-a'},{name:'rule-b'},{name:'untested'}]);
assertModel(ledger.type==='discovery-evidence-ledger'&&ledger.ruleCount===3, 'evidence ledger includes saved rules and historical evidence');
assertModel(ledger.rules.find(r=>r.name==='rule-a').measurementCount===4&&ledger.rules.find(r=>r.name==='rule-a').sources.length>=3, 'evidence ledger aggregates multiple test families for each rule');
assertModel(ledger.rules.find(r=>r.name==='rule-b').status==='FRAGILE OR CONTRADICTED'&&ledger.rules.find(r=>r.name==='untested').status==='INSUFFICIENT EVIDENCE', 'evidence ledger flags counterevidence and avoids overstating untested rules');
assertModel(api.buildDiscoveryEvidenceLedger([{type:'discovery-evidence-ledger',rules:[{name:'rule-a',mean:99}]}],[],[]).ruleCount===0, 'evidence ledger does not recursively count its own saved snapshots');
const stabilityRules=[{name:'stable-candidate',delta:[2,2,2,2],ds:0},{name:'edge-sensitive',delta:[0,0,0,0],ds:0}];
const stabilitySamples=api.buildPrometheusHoldout(),stabilityBefore=JSON.stringify(stabilitySamples);
const stabilityAudit=api.buildRuleStabilityAudit(stabilityRules,stabilitySamples,'balanced');
assertModel(stabilityAudit.type==='rule-stability-audit'&&stabilityAudit.summaries.length===2&&stabilityAudit.summaries.every(r=>r.variantCount===10), 'stability audit tests the baseline plus eight component and two stability perturbations per rule');
assertModel(stabilityAudit.summaries.every(r=>r.variants.every(v=>Number.isFinite(v.mean)&&v.winRate>=0&&v.winRate<=100&&Number.isFinite(v.worst))), 'stability audit metrics are numeric and bounded');
assertModel(JSON.stringify(stabilitySamples)===stabilityBefore&&JSON.stringify(api.buildRuleStabilityAudit(stabilityRules,stabilitySamples,'balanced'))===JSON.stringify(stabilityAudit), 'stability audit is deterministic and leaves sample states unchanged');
const stabilityLedger=api.buildDiscoveryEvidenceLedger([{type:'rule-stability-audit',summaries:stabilityAudit.summaries}],[],stabilityRules);
assertModel(stabilityLedger.rules.every(r=>r.sources.includes('Parameter stability audit')), 'stability audit results are included in evidence ledger');
const crossGoalRules=[{name:'toward-salt',delta:[-2,-2,5,-4],ds:1},{name:'toward-void',delta:[1,1,-1,6],ds:-1}];
const crossGoalSamples=api.buildPrometheusHoldout();
const crossGoalSamplesBefore=JSON.stringify(crossGoalSamples);
const crossGoalStateBefore=JSON.stringify({values:api.state.values,stability:api.state.stability,goal:api.state.goal,customTarget:api.state.customTarget,customStability:api.state.customStability,rules:api.state.learnedRules});
const crossGoalA=api.buildCrossGoalAudit(crossGoalRules,crossGoalSamples);
const crossGoalB=api.buildCrossGoalAudit(crossGoalRules,crossGoalSamples);
assertModel(crossGoalA.goalCount===5 && crossGoalA.goals.map(g=>g.goal).join(',')==='balanced,concentrated,purified,stable,custom', 'cross-goal audit covers all five defined goal types');
assertModel(crossGoalA.summaries.length===2 && crossGoalA.summaries.every(r=>r.goals.length===5&&Number.isFinite(r.meanAcrossGoals)&&r.positiveGoals>=0&&r.positiveGoals<=5), 'cross-goal audit produces bounded per-rule and across-goal metrics');
assertModel(JSON.stringify(crossGoalA)===JSON.stringify(crossGoalB), 'cross-goal audit is deterministic on identical rules and samples');
assertModel(JSON.stringify(crossGoalSamples)===crossGoalSamplesBefore && JSON.stringify({values:api.state.values,stability:api.state.stability,goal:api.state.goal,customTarget:api.state.customTarget,customStability:api.state.customStability,rules:api.state.learnedRules})===crossGoalStateBefore, 'cross-goal audit does not mutate samples or workspace state');
const probePlan={goal:'balanced',seed:'0xAC71E202',timestamp:'plan-time',probes:activeA.probes};
const probeWorkspaceBefore=JSON.stringify({values:api.state.values,stability:api.state.stability,goal:api.state.goal,rules:api.state.learnedRules});
const probeOutcomes=api.evaluateRecommendedProbes(probePlan,activeRules);
assertModel(probeOutcomes.type==='recommended-probe-results'&&probeOutcomes.rules.length===activeRules.length&&probeOutcomes.probeCount===8, 'selected probe executor returns outcomes for all saved rules and selected states');
assertModel(probeOutcomes.rules.every(r=>r.results.length===8&&r.meanAbsolutePredictionError===0&&r.results.every(x=>x.predictionError===0)), 'selected probe replay checks every prediction against the deterministic scoring model');
assertModel(JSON.stringify({values:api.state.values,stability:api.state.stability,goal:api.state.goal,rules:api.state.learnedRules})===probeWorkspaceBefore, 'selected probe replay does not mutate current workspace or rules');
const ledgerWithProbe=api.buildDiscoveryEvidenceLedger([], [{type:'recommended-probe-results',rules:probeOutcomes.rules}], activeRules);
assertModel(ledgerWithProbe.rules.find(r=>r.name==='fragile-rule').sources.includes('Recommended probe replay'), 'selected probe results feed back into the evidence ledger');
const cycleRoot = {innerHTML:''};
sandbox.document = {getElementById:()=>cycleRoot};
sandbox.goalConfig = goal => api.goals[goal || api.state.goal];
sandbox.esc = value => String(value);
sandbox.persist = () => {};
sandbox.showToast = () => {};
let cycleStageCalls = [];
const resetCycleState = () => {
  api.state.values=[10,20,30,40]; api.state.stability=5; api.state.goal='balanced';
  api.state.learnedRules=[{name:'rule-a'},{name:'rule-b'}]; api.state.blindSpotReports=[];
  cycleStageCalls=[];
  sandbox.scanConditionalPatterns=()=>{cycleStageCalls.push('conditional-pattern-scan');api.state.blindSpotReports.push({type:'conditional-pattern-scan',goal:api.state.goal});};
  sandbox.designDiscriminatingExperiments=()=>{cycleStageCalls.push('discriminating-experiment-design');api.state.blindSpotReports.push({type:'discriminating-experiment-design',goal:api.state.goal});};
  sandbox.runAnomalyProtocol=()=>{cycleStageCalls.push('anomaly-challenge-protocol');api.state.blindSpotReports.push({type:'anomaly-challenge-protocol',goal:api.state.goal});};
  sandbox.runPrometheusTrial=()=>cycleStageCalls.push('heldout-prometheus-trial');
  sandbox.compareAgainstBaseline=()=>cycleStageCalls.push('paired-baseline-comparison');
  sandbox.auditAcrossGoals=()=>cycleStageCalls.push('cross-goal-robustness-audit');
  sandbox.runRuleStabilityAudit=()=>cycleStageCalls.push('rule-stability-audit');
  sandbox.compileDiscoveryEvidenceLedger=()=>cycleStageCalls.push('discovery-evidence-ledger');
  sandbox.selectNextExperiment=()=>cycleStageCalls.push('next-experiment-selection');
};
resetCycleState();
vm.runInContext('runDiscoveryCycle()',sandbox,{timeout:3000});
assertModel(cycleStageCalls.length===9 && api.state.blindSpotReports.some(r=>r.type==='discovery-cycle-audit'&&r.passed===true), 'full discovery-cycle orchestration passes when all stages report and preserve state');
resetCycleState();
sandbox.designDiscriminatingExperiments=()=>{cycleStageCalls.push('discriminating-experiment-design');throw new Error('simulated stage failure');};
vm.runInContext('runDiscoveryCycle()',sandbox,{timeout:3000});
const failedRunAudit=api.state.blindSpotReports.find(r=>r.type==='discovery-cycle-audit');
assertModel(cycleStageCalls.length===9 && failedRunAudit && failedRunAudit.passed===false && failedRunAudit.stageErrors[0].stage==='discriminating-experiment-design', 'full discovery cycle records stage exceptions and continues remaining stages');
let savedWorkspace = null;
sandbox.localStorage = {getItem:()=>savedWorkspace,setItem:(_key,value)=>{savedWorkspace=value;}};
sandbox.KEY = 'digital-alchemy-test';
sandbox.setStatus = () => {};
api.state.values=[11,22,33,44];api.state.stability=6;api.state.goal='balanced';
api.state.customTarget=[65,35,70,8];api.state.customStability=8;
api.state.history=[{id:'persist-1',title:'Round-trip',time:'2026-10-20',ops:['Separate'],start:{values:[10,20,30,40],stability:5},end:{values:[11,21,31,41],stability:5},score:72}];
api.state.trace=[{op:'Separate',before:[10,20,30,40],after:[11,21,31,41],score:72}];
api.state.learnedRules=[{name:'Round-trip rule',delta:[1,1,1,1],ds:0}];
api.state.integrityReports=[{passed:true}];api.state.prometheusReports=[{verdict:'ROBUST IN THIS TEST'}];api.state.lawForgeReports=[{generation:1}];api.state.blindSpotReports=[{type:'anomaly-challenge-protocol'}];
api.persist();
const savedPayload=JSON.parse(savedWorkspace);
api.state.values=[0,0,0,0];api.state.history=[];api.state.trace=[];api.state.learnedRules=[];api.state.integrityReports=[];api.state.prometheusReports=[];api.state.lawForgeReports=[];api.state.blindSpotReports=[];
api.load();
assertModel(JSON.stringify(api.state.values)==='[11,22,33,44]' && api.state.stability===6, 'workspace values and stability survive save/load round trip');
assertModel(api.state.history.length===1 && api.state.trace.length===1 && api.state.learnedRules.length===1, 'experiment ledger, trace and saved rules survive save/load round trip');
assertModel(['integrityReports','prometheusReports','lawForgeReports','blindSpotReports'].every(k=>api.state[k].length===1), 'all research report families survive save/load round trip');
assertModel(savedPayload.customTarget.length===4 && savedPayload.customStability===8, 'custom goal settings are included in local persistence');
const stateBeforeCorruptLoad=JSON.stringify({values:api.state.values,stability:api.state.stability,goal:api.state.goal});
savedWorkspace='{not valid JSON';
api.load();
assertModel(JSON.stringify({values:api.state.values,stability:api.state.stability,goal:api.state.goal})===stateBeforeCorruptLoad, 'corrupt local save is caught without replacing the current working state');
const validStoredSnapshot={values:[1,2,3,4],stability:5};
savedWorkspace=JSON.stringify({values:[9,8,7,6],stability:7,goal:'balanced',history:[{id:'good',title:'Good',time:'2026-10-20',ops:['Separate'],start:validStoredSnapshot,end:validStoredSnapshot,score:80},{id:'bad',title:'Bad',time:'now',ops:['unknown'],start:validStoredSnapshot,end:validStoredSnapshot,score:80}],trace:[{op:'Separate',before:[1,2,3,4],after:[2,3,4,5],score:70},{op:'Bad',before:[1,2],after:[2,3,4,5],score:70}],learnedRules:[{name:'Good rule',delta:[1,1,1,1],ds:0},{name:'Bad rule',delta:[1,2],ds:0}],integrityReports:[],prometheusReports:[],lawForgeReports:[],blindSpotReports:[]});
api.load();
assertModel(api.state.values.join(',')==='9,8,7,6' && api.state.history.length===1 && api.state.history[0].id==='good', 'restore accepts valid saved data while filtering malformed history');
assertModel(api.state.trace.length===1 && api.state.learnedRules.length===1, 'restore filters malformed trace entries and rules');
const cycleGoal = 'balanced';
const cycleTypes = ['conditional-pattern-scan','discriminating-experiment-design','anomaly-challenge-protocol'];
const cycleReports = cycleTypes.map(type=>({type,goal:cycleGoal}));
const cycleBefore = {values:'[10,20,30,40]',stability:5,goal:cycleGoal,rules:'[]'};
const cycleAfter = {values:[10,20,30,40],stability:5,goal:cycleGoal,learnedRules:[]};
const freshCycleAudit = api.buildDiscoveryCycleAudit(cycleBefore,cycleAfter,new Set(),cycleReports,cycleGoal,2,'2026-10-20T00:00:00.000Z');
assertModel(freshCycleAudit.passed && freshCycleAudit.missingReports.length===0 && freshCycleAudit.statePreserved, 'discovery cycle audit passes with all fresh reports and preserved state');
const failedStageAudit = api.buildDiscoveryCycleAudit(cycleBefore,cycleAfter,new Set(),cycleReports,cycleGoal,2,'2026-10-20T00:00:00.000Z',[{stage:'anomaly-challenge-protocol',message:'simulated failure'}]);
assertModel(!failedStageAudit.passed && failedStageAudit.stageErrors.length===1 && failedStageAudit.stageErrors[0].stage==='anomaly-challenge-protocol', 'discovery cycle cannot pass when a stage reports an error');
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
const pairedRules=[{name:'increase-sulphur',delta:[5,0,0,0],ds:0},{name:'decrease-sulphur',delta:[-5,0,0,0],ds:0}];
const pairedSamples=[{values:[10,20,30,40],stability:5},{values:[90,20,30,40],stability:5},{values:[50,50,50,50],stability:5}];
const pairedBefore=JSON.stringify(pairedSamples);
const paired=api.buildBaselineComparison(pairedRules,pairedSamples);
assertModel(paired.baseline.meanGain===0 && paired.sampleCount===3, 'paired comparison includes an explicit do-nothing baseline');
assertModel(paired.rules.length===2 && paired.pairwise.length===1 && paired.pairwise[0].aWins+paired.pairwise[0].bWins+paired.pairwise[0].ties===3, 'competing rules are compared head-to-head on identical states');
assertModel(paired.rules.every(r=>Number.isFinite(r.mean)&&r.worst>=-100&&r.worst<=100&&r.winRate>=0&&r.winRate<=100), 'paired comparison reports bounded metrics for each rule');
assertModel(JSON.stringify(pairedSamples)===pairedBefore, 'paired comparison leaves benchmark samples unchanged');
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
