import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
assert.ok(scriptStart >= 0 && scriptEnd > scriptStart, 'application inline script exists');
let script = html.slice(scriptStart + '<script>'.length, scriptEnd);
const bridge = 'globalThis.__digitalAlchemyTest = { state, runDiscoveryCycle };\n';
const close = script.lastIndexOf('})();');
assert.ok(close >= 0, 'application IIFE can be located');
script = script.slice(0, close) + bridge + script.slice(close);

function makeElement() {
  const base = {
    value: '', innerHTML: '', textContent: '', checked: false, disabled: false,
    style: {}, dataset: {}, children: [],
    addEventListener() {}, removeEventListener() {},
    appendChild(child) { this.children.push(child); return child; },
    remove() {}, click() {}, focus() {}, setAttribute() {},
    getAttribute() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }
  };
  return new Proxy(base, {
    get(target, key) { return key in target ? target[key] : undefined; },
    set(target, key, value) { target[key] = value; return true; }
  });
}
const elements = new Map();
const document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); }
};
const saved = new Map();
const sandbox = {
  document,
  localStorage: {
    getItem(key) { return saved.has(key) ? saved.get(key) : null; },
    setItem(key, value) { saved.set(key, String(value)); }
  },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  Blob: class Blob { constructor(parts, options) { this.parts = parts; this.options = options; } },
  console, setTimeout() { return 0; }, clearTimeout() {}
};
vm.createContext(sandbox);
vm.runInContext(script, sandbox, { timeout: 5000 });
const api = sandbox.__digitalAlchemyTest;
assert.ok(api?.state && typeof api.runDiscoveryCycle === 'function', 'real application exposes test bridge');
const state = api.state;
state.values = [17, 42, 63, 24];
state.stability = 5;
state.goal = 'balanced';
state.customTarget = [65, 35, 70, 8];
state.customStability = 8;
state.intentText = 'Integration test intention';
state.learnedRules = [
  { name: 'toward-balance', delta: [2, 1, -1, -2], ds: 0 },
  { name: 'toward-salt', delta: [-1, -1, 3, -2], ds: 1 },
  { name: 'toward-void', delta: [1, 0, -1, 3], ds: -1 }
];
state.blindSpotReports = [];
state.prometheusReports = [];
state.integrityReports = [];
state.lawForgeReports = [];
const workspaceBefore = JSON.stringify({
  values: state.values, stability: state.stability, goal: state.goal,
  customTarget: state.customTarget, customStability: state.customStability,
  intentText: state.intentText, learnedRules: state.learnedRules
});
api.runDiscoveryCycle();
const audit = state.blindSpotReports.find(r => r.type === 'discovery-cycle-audit');
assert.ok(audit, 'real Discovery Cycle records an audit report');
assert.equal(audit.passed, true, 'real ten-stage cycle passes fresh-evidence and workspace-preservation audit');
assert.deepEqual(Array.from(audit.missingReports || []), [], 'all ten real stages produce required fresh report types');
assert.deepEqual(Array.from(audit.stageErrors || []), [], 'no real stage throws during integration run');
const required = [
  'conditional-pattern-scan', 'discriminating-experiment-design',
  'anomaly-challenge-protocol', 'prometheus-trial',
  'paired-baseline-comparison', 'cross-goal-robustness-audit',
  'rule-stability-audit', 'discovery-evidence-ledger',
  'next-experiment-plan', 'rule-disagreement-adjudication'
];
const fresh = [...state.blindSpotReports, ...state.prometheusReports];
for (const type of required) assert.ok(fresh.some(r => r.type === type), `actual stage emitted fresh ${type} report`);
assert.equal(JSON.stringify({
  values: state.values, stability: state.stability, goal: state.goal,
  customTarget: state.customTarget, customStability: state.customStability,
  intentText: state.intentText, learnedRules: state.learnedRules
}), workspaceBefore, 'real stages preserve substrate, target settings, intention and saved rules');
assert.ok(elements.get('discoveryCycleResults')?.innerHTML.includes('Stage 10'), 'cycle UI renders the final-stage summary');
console.log('PASS: actual ten-stage Discovery Cycle integration completed with fresh reports and preserved workspace.');
console.log('NOTE: real app script runs in a lightweight Node DOM shim; this is not a visual browser test.');
