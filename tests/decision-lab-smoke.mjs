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
assert.match(elements.results.innerHTML, /Recommended initiatives/, 'Output must show a plan');
assert.match(elements.results.innerHTML, /SUBSETS_EVALUATED/, 'Output must expose search evidence');
assert.match(elements.results.innerHTML, /Important boundary/, 'Output must state limitations');
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
