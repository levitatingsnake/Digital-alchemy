import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = fs.readFileSync('decision-lab.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, 'Decision Lab must contain its inline application script');
new vm.Script(match[1], { filename: 'decision-lab-inline.js' });

const handlers = {};
const elements = {
  question: { value: 'How can a construction team reduce recurring delays, avoid rework and improve handovers?', addEventListener() {} },
  domain: { value: 'construction', addEventListener() {} },
  budgetMode: { value: 'none', addEventListener() {} },
  budgetWrap: { hidden: true },
  mode: { value: 'solve', addEventListener() {} },
  budget: { value: '30000', addEventListener() {} },
  priority: { value: 'balanced', addEventListener() {} },
  maxItems: { value: '4', addEventListener() {} },
  stressSeverity: { value: '40', addEventListener() {} },
  stressValue: { textContent: '28%' },
  run: { disabled: false, addEventListener(type, fn) { handlers.run = fn; } },
  status: { textContent: '' },
  results: { innerHTML: '' }
};
const samples = ['improve', 'finance', 'investing', 'property', 'construction', 'resilience', 'budget'].map(sample => ({
  dataset: { sample },
  addEventListener(type, fn) { handlers[sample] = fn; }
}));
const document = {
  getElementById(id) {
    if (!elements[id]) elements[id] = { value: '', addEventListener() {} };
    return elements[id];
  },
  querySelectorAll(selector) {
    return selector === '[data-sample]' ? samples : [];
  }
};
vm.runInNewContext(match[1], { document, Intl, Math, Number, String, Set, JSON });
assert.equal(typeof handlers.run, 'function', 'Run button must be wired');
handlers.run();
assert.equal(elements.status.textContent, 'RUN COMPLETE', 'Default scenario must run');
assert.match(elements.results.innerHTML, /Suggested actions/, 'Output must show a plan');
assert.match(elements.results.innerHTML, /THE ANSWER \/ PLAIN ENGLISH/, 'Output must include a clear executive summary');
assert.match(elements.results.innerHTML, /What this result means/, 'Summary must explain the recommendation in ordinary language');
assert.match(elements.results.innerHTML, /What to do next/, 'Summary must give practical next steps');
assert.match(html, /field textarea#question.{0,3}min-height:230px;height:230px/, 'Question field must be large enough for a detailed prompt');
assert.match(html, /Area to assess/, 'Visible labels should use clear language');

assert.match(elements.results.innerHTML, /Challenge the recommendation/, 'Output must include a plain-language decision challenge');
assert.match(elements.results.innerHTML, /When to reconsider this choice/, 'Output must state what evidence could overturn the recommendation');
assert.match(elements.results.innerHTML, /A practical way to test it/, 'Output must recommend a practical validation experiment');
assert.match(elements.results.innerHTML, /Evidence to check first/, 'Output must identify real-world evidence to collect');
assert.match(html, /function buildChallengeBrief\(/, 'Decision Challenger logic must be isolated and maintainable');
assert.match(html, /id="exportDecisionReport"/, 'Decision Lab must expose a decision brief export control');
assert.match(match[1], /\$\("exportDecisionReport"\)\.addEventListener\("click"/, 'Decision brief export control must be wired');
assert.match(match[1], /digital-alchemy-decision-brief\.txt/, 'Decision brief must have a clear export filename');
assert.match(elements.results.innerHTML, /SUBSETS_EVALUATED/, 'Output must expose search evidence');
assert.match(elements.results.innerHTML, /What if conditions get worse\?/, 'Output must show the stress-test scenario');
assert.match(elements.results.innerHTML, /STRESS_SCORE/, 'Run record must include stress score');
assert.match(elements.results.innerHTML, /STRESS_SEVERITY: 40% impact reduction/, 'Run record must preserve the selected stress severity');
assert.match(elements.results.innerHTML, /External evidence to verify/, 'Output must offer external evidence sources');
assert.match(elements.results.innerHTML, /Important boundary/, 'Output must state limitations');
assert.match(elements.results.innerHTML, /risk-adjusted constrained portfolio selection/, 'Run record must identify the robust engine');
assert.match(elements.results.innerHTML, /COST: (\d+) NZD/, 'Output must log the total cost');
assert.match(elements.results.innerHTML, /BUDGET_MODE: none/, 'Default run must not require a budget');
assert.match(elements.results.innerHTML, /BUDGET: open/, 'Default run must report an open budget');
const firstCost = Number(elements.results.innerHTML.match(/COST: (\d+) NZD/)[1]);
assert.ok(firstCost <= 30000, 'Selected plan must obey the budget');

elements.domain.value = 'business';
  elements.budgetMode.value = 'set';
  elements.budget.value = '8000';
elements.priority.value = 'risk';
elements.maxItems.value = '3';
handlers.run();
assert.equal(elements.status.textContent, 'RUN COMPLETE', 'Risk scenario must run');
assert.match(elements.results.innerHTML, /OBJECTIVE: risk/, 'Run record must retain selected objective');
const secondCost = Number(elements.results.innerHTML.match(/COST: (\d+) NZD/)[1]);
assert.ok(secondCost <= 8000, 'Risk-focused plan must obey the budget');

handlers.improve();
assert.equal(elements.budgetMode.value, 'none', 'Improvement sample must remove the budget constraint');
assert.equal(elements.domain.value, 'business', 'Improvement sample must load');
handlers.budget();
assert.equal(elements.budgetMode.value, 'set', 'Budget sample must enable the budget constraint');
handlers.construction();
assert.equal(elements.domain.value, 'construction', 'Construction sample must load');
handlers.resilience();
assert.equal(elements.domain.value, 'business', 'Resilience sample must load');
for (const domain of ['finance', 'investing', 'property']) {
  elements.domain.value = domain;
  elements.budgetMode.value = 'none';
  elements.maxItems.value = '4';
  handlers.run();
  assert.equal(elements.status.textContent, 'RUN COMPLETE', `${domain} scenario must run`);
  assert.match(elements.results.innerHTML, new RegExp(`DOMAIN: ${domain}`), `${domain} output must identify its domain`);
  assert.match(elements.results.innerHTML, /Important boundary/, `${domain} output must state limitations`);
}
handlers.finance();
assert.equal(elements.domain.value, 'finance', 'Finance sample must load');
handlers.investing();
assert.equal(elements.domain.value, 'investing', 'Investment sample must load');
handlers.property();
assert.equal(elements.domain.value, 'property', 'Real-estate sample must load');
console.log('PASS: Decision Lab syntax, controls, all five domains, reproducible output, objective selection, and budget constraints.');
