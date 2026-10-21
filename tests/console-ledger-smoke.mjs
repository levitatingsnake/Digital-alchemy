import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = fs.readFileSync('console.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, 'Console must contain its inline script');
new vm.Script(match[1], { filename: 'console-inline.js' });
assert.match(html, /id="experimentLedger"/, 'Console must expose the experiment ledger');
assert.match(match[1], /lumora-experiment-ledger-v1/, 'Experiment data must have a versioned local schema');
assert.match(match[1], /absolutePercentageError/, 'Stored records must include prediction error');
assert.match(match[1], /digital-alchemy-experiment-ledger\.csv/, 'Experiment records must be exportable as CSV');
assert.match(match[1], /digital-alchemy-experiment-ledger\.json/, 'Experiment records must be exportable as JSON');

const handlers = {};
const values = {};
const textContent = {};
const innerHTML = {};
const elements = {};
const getElement = id => elements[id] ||= {
  get value() { return values[id] ?? ''; },
  set value(v) { values[id] = String(v); },
  get textContent() { return textContent[id] ?? ''; },
  set textContent(v) { textContent[id] = String(v); },
  get innerHTML() { return innerHTML[id] ?? ''; },
  set innerHTML(v) { innerHTML[id] = String(v); },
  addEventListener(type, fn) { handlers[id + ':' + type] = fn; },
  focus() {}
};
const stored = new Map();
const document = {
  getElementById: getElement,
  querySelectorAll() { return []; }
};
const localStorage = {
  getItem(k) { return stored.has(k) ? stored.get(k) : null; },
  setItem(k, v) { stored.set(k, String(v)); }
};
vm.runInNewContext(match[1], { document, localStorage, alert() {}, confirm() { return true; }, Date, Math, JSON, Number, String, Set, URL, Blob });
assert.equal(getElement('expCount').textContent, '0', 'Ledger should start empty');
for (const [id, value] of Object.entries({
  expDecision: 'Pilot customer follow-up',
  expHypothesis: 'A prompt follow-up saves 2 hours per week',
  expMetric: 'Hours saved per week',
  expPredicted: '2',
  expActual: '1.5',
  expUnit: 'hours/week',
  expDate: '2026-10-21',
  expVerdict: 'Partially met',
  expNotes: 'Sample outcome'
})) getElement(id).value = value;
handlers['experimentForm:submit']({ preventDefault() {} });
assert.equal(getElement('expCount').textContent, '1', 'Submitting a measured outcome should add one record');
assert.equal(getElement('expMae').textContent, '0.50', 'Mean absolute error should compare predicted and actual values');
assert.equal(getElement('expMape').textContent, '25.0%', 'Mean absolute percentage error should be calculated correctly');
assert.match(getElement('experimentList').innerHTML, /Error -0\.50 hours\/week/, 'Ledger should expose signed prediction error');
const records = JSON.parse(stored.get('lumora-experiment-ledger-v1'));
assert.equal(records.length, 1);
assert.equal(records[0].error, -0.5);
assert.equal(records[0].absolutePercentageError, 25);
console.log('PASS: Console syntax, experiment ledger, local persistence, signed error, MAE and percentage error.');
