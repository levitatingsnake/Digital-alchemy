import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
if (scriptStart < 0 || scriptEnd < 0) throw new Error('Could not locate the application script.');

const applicationScript = html.slice(scriptStart + '<script>'.length, scriptEnd);
const coreStart = applicationScript.indexOf('const names=');
const coreEnd = applicationScript.indexOf('function synthesizeStrategy()', coreStart);
if (coreStart < 0 || coreEnd < 0) throw new Error('Could not isolate the symbolic model.');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  applicationScript.slice(coreStart, coreEnd) +
  '\nglobalThis.benchmarkApi = { names, goals, ops, state, score, apply, goalConfig };',
  sandbox,
  { timeout: 5000 }
);
const api = sandbox.benchmarkApi;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildCases() {
  const cases = [];
  const seeds = [0xA17C0DE, 0xBADC0DE, 0xC0FFEE, 0x5EED1234];
  const goalNames = Object.keys(api.goals);
  for (const seed of seeds) {
    const random = makeRandom(seed);
    for (const goal of goalNames) {
      for (let i = 0; i < 20; i++) {
        cases.push({
          id: `${seed.toString(16)}-${goal}-${String(i + 1).padStart(2, '0')}`,
          seed: seed.toString(16),
          goal,
          start: {
            values: Array.from({ length: 4 }, () => Math.floor(random() * 101)),
            stability: Math.floor(random() * 11)
          }
        });
      }
    }
  }
  return cases;
}

function stateKey(s) {
  return [...s.values, s.stability].join(',');
}

function search(start, goal, maxDepth = 3) {
  const startScore = api.score(start, goal);
  let best = { score: startScore, state: start, route: [] };
  let frontier = [{ state: start, route: [] }];
  let candidatesEvaluated = 0;
  const bestScoreByDepth = {};

  for (let depth = 1; depth <= maxDepth; depth++) {
    const nextFrontier = [];
    for (const node of frontier) {
      for (const op of api.ops) {
        const result = api.apply(node.state, op).state;
        const route = [...node.route, op];
        const score = api.score(result, goal);
        candidatesEvaluated++;
        if (
          score > best.score ||
          (score === best.score && route.length > 0 && route.length < best.route.length)
        ) {
          best = { score, state: result, route };
        }
        nextFrontier.push({ state: result, route });
      }
    }
    frontier = nextFrontier;
    bestScoreByDepth[depth] = best.score;
  }
  return { ...best, startScore, candidatesEvaluated, bestScoreByDepth };
}

function searchWithStateDeduplication(start, goal, maxDepth = 3) {
  const startScore = api.score(start, goal);
  let best = { score: startScore, state: start, route: [] };
  let frontier = [{ state: start, route: [] }];
  const visited = new Set([stateKey(start)]);
  let transitionAttempts = 0;
  let uniqueStatesScored = 0;
  let duplicateStatesSkipped = 0;

  for (let depth = 1; depth <= maxDepth; depth++) {
    const nextFrontier = [];
    for (const node of frontier) {
      for (const op of api.ops) {
        transitionAttempts++;
        const result = api.apply(node.state, op).state;
        const key = stateKey(result);
        const score = api.score(result, goal);
        if (!Number.isFinite(score)) throw new Error('Non-finite score during deduplicated search.');
        if (
          score > best.score ||
          (score === best.score && depth < best.route.length)
        ) {
          best = { score, state: result, route: [...node.route, op] };
        }
        if (visited.has(key)) {
          duplicateStatesSkipped++;
          continue;
        }
        visited.add(key);
        uniqueStatesScored++;
        nextFrontier.push({ state: result, route: [...node.route, op] });
      }
    }
    frontier = nextFrontier;
    if (!frontier.length) break;
  }
  return {
    ...best,
    startScore,
    transitionAttempts,
    uniqueStatesScored,
    duplicateStatesSkipped,
    uniqueStatesVisited: visited.size
  };
}

function greedyOneStep(start, goal) {
  let best = { score: api.score(start, goal), route: [], state: start };
  for (const op of api.ops) {
    const state = api.apply(start, op).state;
    const score = api.score(state, goal);
    if (score > best.score) best = { score, route: [op], state };
  }
  return best;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function summarize(rows, key) {
  const gains = rows.map(row => row[key] - row.startScore);
  return {
    meanScore: +mean(rows.map(row => row[key])).toFixed(3),
    meanGainVsNoOp: +mean(gains).toFixed(3),
    casesImproved: gains.filter(gain => gain > 0).length,
    casesTied: gains.filter(gain => gain === 0).length,
    casesWorse: gains.filter(gain => gain < 0).length,
    improvementRatePct: +(gains.filter(gain => gain > 0).length / rows.length * 100).toFixed(2)
  };
}

function runBenchmark() {
  const cases = buildCases();
  const rows = cases.map(testCase => {
    const greedy = greedyOneStep(testCase.start, testCase.goal);
    const searched = search(testCase.start, testCase.goal, 3);
    const deduplicated = searchWithStateDeduplication(testCase.start, testCase.goal, 3);
    assert(deduplicated.score === searched.score, `state deduplication preserves optimal bounded-search score for ${testCase.id}`);
    return {
      id: testCase.id,
      seed: testCase.seed,
      goal: testCase.goal,
      start: testCase.start,
      startScore: api.score(testCase.start, testCase.goal),
      greedyScore: greedy.score,
      greedyRoute: greedy.route,
      searchScore: searched.score,
      searchRoute: searched.route,
      candidatesEvaluated: searched.candidatesEvaluated,
      depth1Score: searched.bestScoreByDepth[1],
      depth2Score: searched.bestScoreByDepth[2],
      depth3Score: searched.bestScoreByDepth[3],
      deduplicatedScore: deduplicated.score,
      deduplicatedRoute: deduplicated.route,
      deduplicatedTransitionAttempts: deduplicated.transitionAttempts,
      deduplicatedUniqueStatesScored: deduplicated.uniqueStatesScored,
      deduplicatedDuplicateStatesSkipped: deduplicated.duplicateStatesSkipped,
      deduplicatedUniqueStatesVisited: deduplicated.uniqueStatesVisited
    };
  });

  const byGoal = Object.keys(api.goals).map(goal => {
    const group = rows.filter(row => row.goal === goal);
    return {
      goal,
      cases: group.length,
      greedy: summarize(group, 'greedyScore'),
      depth1Search: summarize(group, 'depth1Score'),
      depth2Search: summarize(group, 'depth2Score'),
      depth3Search: summarize(group, 'depth3Score'),
      depth3Deduplicated: summarize(group, 'deduplicatedScore'),
      searchBeatsGreedy: group.filter(row => row.searchScore > row.greedyScore).length
    };
  });

  const result = {
    benchmark: 'Digital Alchemy bounded symbolic search',
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    method: {
      caseCount: rows.length,
      deterministicSeeds: 4,
      goals: Object.keys(api.goals),
      casesPerSeedPerGoal: 20,
      operations: api.ops,
      maximumSearchDepth: 3,
      routesPerCase: 4 + 16 + 64,
      baseline: 'Do nothing: retain the initial state and its score',
      comparator: 'Greedy one-step search across each available operation',
      scoring: 'The current application score() function, evaluated against each declared goal',
      caveat: 'This measures performance only within the current symbolic model and its defined operations. It does not establish real-world usefulness or scientific novelty.'
    },
    overall: {
      baselineMeanScore: +mean(rows.map(row => row.startScore)).toFixed(3),
      greedy: summarize(rows, 'greedyScore'),
      depth1Search: summarize(rows, 'depth1Score'),
      depth2Search: summarize(rows, 'depth2Score'),
      depth3Search: summarize(rows, 'depth3Score'),
      depth3Deduplicated: summarize(rows, 'deduplicatedScore'),
      searchBeatsGreedy: rows.filter(row => row.searchScore > row.greedyScore).length,
      searchTiesGreedy: rows.filter(row => row.searchScore === row.greedyScore).length,
      searchWorseThanGreedy: rows.filter(row => row.searchScore < row.greedyScore).length,
      totalCandidateEvaluations: rows.reduce((sum, row) => sum + row.candidatesEvaluated, 0),
      averageRouteLength: +mean(rows.map(row => row.searchRoute.length)).toFixed(3),
      deduplicatedMeanScore: +mean(rows.map(row => row.deduplicatedScore)).toFixed(3),
      deduplicatedTransitionAttempts: rows.reduce((sum, row) => sum + row.deduplicatedTransitionAttempts, 0),
      deduplicatedUniqueStatesScored: rows.reduce((sum, row) => sum + row.deduplicatedUniqueStatesScored, 0),
      deduplicatedDuplicateStatesSkipped: rows.reduce((sum, row) => sum + row.deduplicatedDuplicateStatesSkipped, 0),
      transitionAttemptReductionPct: +((1 - rows.reduce((sum, row) => sum + row.deduplicatedTransitionAttempts, 0) / rows.reduce((sum, row) => sum + row.candidatesEvaluated, 0)) * 100).toFixed(2),
      dedupSearchScoreMatches: rows.filter(row => row.deduplicatedScore === row.searchScore).length
    },
    byGoal,
    examples: {
      largestSearchAdvantage: rows.slice().sort((a, b) => (b.searchScore - b.greedyScore) - (a.searchScore - a.greedyScore)).slice(0, 5),
      searchRegressions: rows.filter(row => row.searchScore < row.greedyScore).slice(0, 5)
    },
    cases: rows
  };

  assert(result.overall.totalCandidateEvaluations === rows.length * 84, 'candidate count matches the depth-three search contract');
  assert(rows.every(row => row.searchScore >= row.startScore), 'search never returns a result worse than the no-op baseline');
  assert(rows.every(row => row.searchScore >= row.greedyScore), 'bounded search contains every one-step route and should not underperform greedy');
  assert(rows.every(row => row.searchRoute.length <= 3), 'all selected routes respect the depth limit');
  assert(rows.every(row => Number.isFinite(row.startScore) && Number.isFinite(row.searchScore)), 'all scores are finite');

  return result;
}

function stableResult(result) {
  const copy = structuredClone(result);
  delete copy.generatedAt;
  return JSON.stringify(copy);
}

const first = runBenchmark();
const second = runBenchmark();
assert(stableResult(first) === stableResult(second), 'benchmark results are reproducible across repeated runs');

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/overnight-latest.json', JSON.stringify(first, null, 2) + '\n');

const lines = [
  '# Digital Alchemy Overnight Lab',
  '',
  `Generated: ${first.generatedAt}`,
  '',
  '> Scope: deterministic evaluation of the current symbolic model only. These results do not establish real-world effectiveness, scientific novelty, or general intelligence.',
  '',
  '## Overall results',
  '',
  '| Metric | Result |',
  '|---|---:|',
  `| Test cases | ${first.method.caseCount} |`,
  `| Candidate evaluations | ${first.overall.totalCandidateEvaluations} |`,
  `| No-op baseline mean score | ${first.overall.baselineMeanScore} |`,
  `| Greedy mean score | ${first.overall.greedy.meanScore} |`,
  `| Greedy mean gain vs no-op | ${first.overall.greedy.meanGainVsNoOp} |`,
  `| Depth-3 search mean score | ${first.overall.depth3Search.meanScore} |`,
  `| Depth-3 mean gain vs no-op | ${first.overall.depth3Search.meanGainVsNoOp} |`,
  `| Cases search beats greedy | ${first.overall.searchBeatsGreedy} / ${first.method.caseCount} |`,
  `| Average selected route length | ${first.overall.averageRouteLength} |`,
  `| Deduplicated search mean score | ${first.overall.deduplicatedMeanScore} |`,
  `| Deduplicated transition attempts | ${first.overall.deduplicatedTransitionAttempts} |`,
  `| Unique states scored by deduplicated search | ${first.overall.deduplicatedUniqueStatesScored} |`,
  `| Duplicate states skipped | ${first.overall.deduplicatedDuplicateStatesSkipped} |`,
  `| Transition-attempt reduction vs naive search | ${first.overall.transitionAttemptReductionPct}% |`,
  `| Cases with identical deduplicated and naive scores | ${first.overall.dedupSearchScoreMatches} / ${first.method.caseCount} |`,
  '',
  '## Overall strategy comparison',
  '',
  '| Search strategy | Mean score | Mean gain vs no-op | Cases improved | Improvement rate |',
  '|---|---:|---:|---:|---:|',
  ...[
    ['Greedy (depth 1)', first.overall.greedy],
    ['Bounded search (depth 1)', first.overall.depth1Search],
    ['Bounded search (depth 2)', first.overall.depth2Search],
    ['Bounded search (depth 3)', first.overall.depth3Search],
    ['Deduplicated search (depth 3)', first.overall.depth3Deduplicated]
  ].map(([name, metrics]) => `| ${name} | ${metrics.meanScore} | ${metrics.meanGainVsNoOp} | ${metrics.casesImproved} | ${metrics.improvementRatePct}% |`),
  '',
  '### Results by goal',
  '',
  '| Goal | Cases | Greedy mean | Depth 1 | Depth 2 | Depth 3 | Deduplicated depth 3 |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...first.byGoal.map(row => `| ${row.goal} | ${row.cases} | ${row.greedy.meanScore} | ${row.depth1Search.meanScore} | ${row.depth2Search.meanScore} | ${row.depth3Search.meanScore} | ${row.depth3Deduplicated.meanScore} |`),
  '',
  '## Method',
  '',
  `- Goals: ${first.method.goals.join(', ')}.`,
  `- Operations: ${first.method.operations.join(', ')}.`,
  `- Maximum route depth: ${first.method.maximumSearchDepth}.`,
  '- Baseline: leave the starting state unchanged.',
  '- Comparator: choose the best result among all single-operation routes.',
  '- Deduplication variant: skip expanding any state already reached at a shallower or equal depth.',
  '- Integrity check: deduplicated and naive search must return the same best score for every case.',
  '- Repeatability: the full experiment is executed twice and must produce identical results apart from the timestamp.',
  '',
  '## Interpretation',
  '',
  'This is a bounded internal benchmark, not proof that the system solves arbitrary problems. A deeper search has access to all one-step routes, so it should never score below the greedy comparator. State deduplication is accepted only when it preserves the best score on every case; transition attempts are a proxy for search work, not a direct wall-clock speed measurement.',
  '',
  'Full case-level results and selected examples are in `overnight-latest.json`.'
];

fs.writeFileSync('reports/overnight-latest.md', lines.join('\n') + '\n');
console.log(lines.join('\n'));
console.log('\nPASS: benchmark is deterministic and all integrity assertions passed.');
