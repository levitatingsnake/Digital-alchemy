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
assert.match(html, /id="expTarget"/, 'Ledger should allow an explicit success threshold');
assert.match(html, /id="expReview"/, 'Ledger should capture the human decision after reviewing an outcome');
assert.match(html, /id="expReviewReason"/, 'Ledger should record why a follow-up decision was chosen');
assert.match(match[1], /Review open/, 'Readout should expose unresolved review decisions');
assert.match(match[1], /The target was missed\. Inspect context and assumptions/, "A missed target should suggest reviewing assumptions and retesting");
assert.match(match[1], /The target was met\. Check side effects and repeat/, "A met target should suggest a controlled repeat before scaling");
assert.match(match[1], /No explicit success target was recorded/, "Missing targets should not be silently interpreted as success");
assert.match(html, /id="expPrefillNotice"/, 'Console should explain when an experiment is carried over from Decision Lab');
assert.match(match[1], /params\.get\("experiment"\)/, 'Console should accept a decision action from the recommendation link');
assert.match(match[1], /TARGET MISSED/, 'Ledger should flag outcomes that miss their target');
assert.match(match[1], /Review missed targets before repeating or scaling/i, 'A missed target should prompt a review, not claim causation');
assert.match(match[1], /digital-alchemy-experiment-ledger\.csv/, 'Experiment records must be exportable as CSV');
assert.match(match[1], /"target","direction"/, 'CSV export must preserve the success rule used for review flags');
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
vm.runInNewContext(match[1], { document, localStorage, alert() {}, confirm() { return true; }, Date, Math, JSON, Number, String, Set, URL, URLSearchParams, Blob, window: { location: { search: '?experiment=Cash-flow%20forecast&hypothesis=Test%20cash%20visibility&metric=Weekly%20forecast%20error' } } });
assert.equal(getElement('expCount').textContent, '0', 'Ledger should start empty');
assert.equal(getElement('expDecision').value, 'Cash-flow forecast', 'Decision Lab action should prefill the experiment name');
assert.equal(getElement('expHypothesis').value, 'Test cash visibility', 'Decision Lab hypothesis should carry into the ledger');
assert.equal(getElement('expMetric').value, 'Weekly forecast error', 'Suggested metric should carry into the ledger');
assert.equal(getElement('expPrefillNotice').hidden, false, 'Console should disclose the carried-over draft');
for (const [id, value] of Object.entries({
  expDecision: 'Pilot customer follow-up',
  expHypothesis: 'A prompt follow-up saves 2 hours per week',
  expMetric: 'Hours saved per week',
  expPredicted: '2',
  expActual: '1.5',
  expUnit: 'hours/week',
  expTarget: '1.8',
  expDirection: 'higher',
  expDate: '2026-10-21',
  expVerdict: 'Partially met',
  expNotes: 'Sample outcome',
  expReview: 'adjust',
  expReviewReason: 'Target missed; reduce scope and retest'
})) getElement(id).value = value;
handlers['experimentForm:submit']({ preventDefault() {} });
assert.equal(getElement('expCount').textContent, '1', 'Submitting a measured outcome should add one record');
assert.equal(getElement('expMae').textContent, '0.50', 'Mean absolute error should compare predicted and actual values');
assert.equal(getElement('expMape').textContent, '25.0%', 'Mean absolute percentage error should be calculated correctly');
assert.match(getElement('experimentList').innerHTML, /Error -0\.50 hours\/week/, 'Ledger should expose signed prediction error');
assert.match(getElement('experimentList').innerHTML, /TARGET MISSED/, 'Ledger should flag a failed success threshold');
assert.match(getElement('expAlerts').textContent, /1 result\(s\) missed/, 'Learning readout should summarise missed thresholds');
const records = JSON.parse(stored.get('lumora-experiment-ledger-v1'));
assert.equal(records.length, 1);
assert.equal(records[0].error, -0.5);
assert.equal(records[0].absolutePercentageError, 25);
assert.equal(records[0].target, 1.8);
assert.equal(records[0].direction, 'higher');
assert.equal(records[0].review, 'adjust');
assert.equal(records[0].reviewReason, 'Target missed; reduce scope and retest');
assert.match(getElement('experimentList').innerHTML, /Adjust and retest/);
assert.match(getElement('experimentList').innerHTML, /reduce scope and retest/);
assert.match(getElement('expAlerts').textContent, /0 review decision\(s\) still open/, 'A completed human review should clear the open-review count');
console.log('PASS: Console syntax, experiment ledger, local persistence, signed error, MAE and percentage error.');
