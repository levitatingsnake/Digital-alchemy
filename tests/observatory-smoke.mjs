import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../observatory.html', import.meta.url), 'utf8');
assert.match(html, /Signal Observatory/, 'page has the expected product identity');
assert.match(html, /https:\/\/catalogue\.data\.govt\.nz\/api\/3\/action\/package_search/, 'search points to the public CKAN API');
assert.match(html, /fetch\(url/, 'search makes a real network request');
assert.match(html, /No stale sample data is substituted/, 'network failure is not masked with fake data');
assert.match(html, /pass the bounded sample into Decision Lab/, 'sample handoff and its boundary are disclosed');
assert.match(html, /data-q=/, 'curated search shortcuts exist');
assert.match(html, /data-copy=/, 'source-link copy action exists');
assert.match(html, /datastore_search/, 'DataStore resource preview is supported');
assert.match(html, /data-preview=/, 'machine-readable resources have a live fetch control');
assert.match(html, /data-analyse-source=/, 'each compatible resource has a visible direct Decision Lab action');
assert.match(html, /Preview rows/, 'preview and analysis actions are clearly separated');
assert.match(html, /function handoffToForge/, 'live samples can be handed to the Decision Lab');
assert.match(html, /digitalAlchemyImportedCsv/, 'handoff uses a defined same-origin transfer key');
assert.match(html, /data-export=/, 'fetched rows can be exported as CSV');
assert.match(html, /function toCSV/, 'API rows are serialised as CSV with escaping');
assert.match(html, /function profileRecords/, 'sample numeric fields are profiled');
assert.match(html, /metadata_modified/, 'catalogue metadata timestamps are surfaced');
assert.match(html, /<meta name="viewport"/, 'page is responsive');
assert.match(html, /prefers-reduced-motion/, 'reduced-motion preference is respected');
assert.doesNotMatch(html, /<script[^>]+src=/i, 'page has no unpinned external script dependency');

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
assert.ok(scripts.length, 'inline application script exists');
for (const script of scripts) new vm.Script(script[1], { filename: 'observatory-inline.js' });

console.log('Signal Observatory smoke checks passed: live API wiring, provenance cues, failure handling, interactions, responsive/accessibility cues, and JavaScript syntax.');
