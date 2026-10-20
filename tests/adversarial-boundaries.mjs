import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
if (scriptStart < 0 || scriptEnd < 0) throw new Error('Could not locate application script.');
const applicationScript = html.slice(scriptStart + '<script>'.length, scriptEnd);
const coreStart = applicationScript.indexOf('const names=');
const coreEnd = applicationScript.indexOf('function synthesizeStrategy()', coreStart);
if (coreStart < 0 || coreEnd < 0) throw new Error('Could not isolate symbolic model.');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  applicationScript.slice(coreStart, coreEnd) +
  '\nglobalThis.testApi = { names, goals, ops, state, score, apply, goalConfig };',
  sandbox,
  { timeout: 5000 }
);
const api = sandbox.testApi;
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const edgeValues = [0, 1, 50, 99, 100];
const states = [];
for (const a of edgeValues) {
  for (const b of edgeValues) {
    states.push({ values: [a, b, 0, 100], stability: 0 });
    states.push({ values: [100, 0, a, b], stability: 10 });
  }
}
states.push(
  { values: [0, 0, 0, 0], stability: 0 },
  { values: [100, 100, 100, 100], stability: 10 },
  { values: [0, 100, 0, 100], stability: 5 },
  { values: [100, 0, 100, 0], stability: 5 }
);

let checkedTransitions = 0;
for (const start of states) {
  for (const goal of Object.keys(api.goals)) {
    const before = JSON.stringify(start);
    const score = api.score(start, goal);
    assert(Number.isFinite(score) && score >= 0 && score <= 100, `score stays finite and bounded for goal ${goal}`);
    assert(JSON.stringify(start) === before, 'scoring does not mutate its input');
    for (const op of api.ops) {
      const inputBefore = JSON.stringify(start);
      const result = api.apply(start, op);
      assert(JSON.stringify(start) === inputBefore, `operation ${op} does not mutate its input`);
      assert(result && result.state && Array.isArray(result.state.values), `operation ${op} returns a state`);
      assert(result.state.values.length === 4, `operation ${op} preserves four components`);
      assert(result.state.values.every(v => Number.isInteger(v) && v >= 0 && v <= 100), `operation ${op} keeps components integral and clamped`);
      assert(Number.isInteger(result.state.stability) && result.state.stability >= 0 && result.state.stability <= 10, `operation ${op} keeps stability integral and bounded`);
      assert(typeof result.explain === 'string' && result.explain.length > 0, `operation ${op} returns an explanation`);
      checkedTransitions++;
    }
  }
}
console.log(`PASS: ${states.length} boundary states × ${Object.keys(api.goals).length} goals; checked ${checkedTransitions} operation transitions.`);
console.log('PASS: scores remain finite and bounded; operations preserve inputs and clamp state values.');
