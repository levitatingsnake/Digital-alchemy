import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
if (scriptStart < 0 || scriptEnd < 0) throw new Error('Could not locate the application script.');
const applicationScript = html.slice(scriptStart + '<script>'.length, scriptEnd);
const coreStart = applicationScript.indexOf('const names=');
const coreEnd = applicationScript.indexOf('function synthesizeStrategy()', coreStart);
if (coreStart < 0 || coreEnd < 0) throw new Error('Could not isolate symbolic model.');
const core = applicationScript.slice(coreStart, coreEnd);

function loadModel(source) {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(source + '\nglobalThis.testApi = { names, goals, ops, state, score, apply, goalConfig, clamp };', sandbox, { timeout: 3000 });
  return sandbox.testApi;
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function expectRejected(label, runInvariant) {
  let rejected = false;
  try { runInvariant(); } catch { rejected = true; }
  assert(rejected, `Mutation escaped detection: ${label}`);
  console.log(`PASS: invariant checks reject mutation: ${label}`);
}
function checkBounds(api) {
  const out = api.apply({ values: [100, 0, 100, 0], stability: 10 }, 'Separate').state;
  assert(out.values.every(v => Number.isInteger(v) && v >= 0 && v <= 100), 'component values remain integer and within 0-100');
  assert(Number.isInteger(out.stability) && out.stability >= 0 && out.stability <= 10, 'stability remains integer and within 0-10');
}
function checkFiniteScore(api) {
  const value = api.score({ values: [10, 20, 30, 40], stability: 5 }, 'balanced');
  assert(Number.isFinite(value) && value >= 0 && value <= 100, 'score is finite and bounded');
}
function checkInputImmutability(api) {
  const input = { values: [20, 30, 40, 50], stability: 4 };
  const before = JSON.stringify(input);
  api.apply(input, 'Distill');
  assert(JSON.stringify(input) === before, 'operation does not mutate its input');
}

// Verify the unmodified production model satisfies each invariant first.
const original = loadModel(core);
checkBounds(original);
checkFiniteScore(original);
checkInputImmutability(original);
console.log('PASS: unmodified model satisfies all mutation-test control invariants.');

const clampMutation = 'function clamp(n){return Math.max(0,Math.min(100,Math.round(n)))}';
assert(core.includes(clampMutation), 'expected clamp implementation found');
const mutantClamp = core.replace(clampMutation, 'function clamp(n){return Math.max(0,Math.min(1000,Math.round(n)))}');
expectRejected('component clamp ceiling changed from 100 to 1000', () => checkBounds(loadModel(mutantClamp)));

const scoreMutation = 'return Math.round(Math.max(0,100-(d/5*100)))';
assert(core.includes(scoreMutation), 'expected score formula found');
const mutantScore = core.replace(scoreMutation, 'return NaN');
expectRejected('score function returns NaN', () => checkFiniteScore(loadModel(mutantScore)));

const cloneMutation = 'let n=clone(s),v=n.values,explain=';
assert(core.includes(cloneMutation), 'expected operation clone found');
const mutantClone = core.replace(cloneMutation, 'let n=s,v=n.values,explain=');
expectRejected('operation mutates its input instead of cloning it', () => checkInputImmutability(loadModel(mutantClone)));

console.log('PASS: all three deliberately introduced faults were detected.');
