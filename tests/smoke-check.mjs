import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
  ['Conditional pattern scanner', 'function scanConditionalPatterns()'],
  ['Discriminating experiment designer', 'function designDiscriminatingExperiments()'],
  ['Anomaly challenge protocol', 'function runAnomalyProtocol()'],
  ['Cycle audit record', "type:'discovery-cycle-audit'"],
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
console.log('All static smoke checks passed.');
