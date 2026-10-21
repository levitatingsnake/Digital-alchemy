import assert from 'node:assert/strict';
import fs from 'node:fs';

function makeRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildCases() {
  const cases = [];
  const seeds = [0x71A5C0DE, 0xB16B00B5, 0xC0FFEE12, 0x51EC710A];
  for (const seed of seeds) {
    const random = makeRandom(seed);
    for (let index = 0; index < 25; index++) {
      const items = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        cost: 2 + Math.floor(random() * 9),
        value: 3 + Math.floor(random() * 23),
        category: Math.floor(random() * 4)
      }));
      cases.push({
        id: seed.toString(16) + '-' + String(index + 1).padStart(2, '0'),
        seed: seed.toString(16),
        budget: 30,
        diversityBonus: 4,
        items
      });
    }
  }
  return cases;
}

function scoreSelection(items, selectedIds, diversityBonus) {
  const selected = selectedIds.map(id => items[id]);
  const cost = selected.reduce((sum, item) => sum + item.cost, 0);
  const value = selected.reduce((sum, item) => sum + item.value, 0);
  const categories = new Set(selected.map(item => item.category));
  return {
    cost,
    value,
    categoryCount: categories.size,
    score: value + diversityBonus * categories.size
  };
}

function greedy(caseData) {
  const selected = [];
  let remaining = caseData.budget;
  const ordered = [...caseData.items].sort((a, b) =>
    (b.value / b.cost) - (a.value / a.cost) || a.id - b.id
  );
  for (const item of ordered) {
    if (item.cost <= remaining) {
      selected.push(item.id);
      remaining -= item.cost;
    }
  }
  return scoreSelection(caseData.items, selected, caseData.diversityBonus);
}

function exactOptimal(caseData) {
  let best = { score: -Infinity, cost: 0, value: 0, categoryCount: 0, mask: 0 };
  const n = caseData.items.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    let cost = 0;
    let value = 0;
    let categoryMask = 0;
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const item = caseData.items[i];
      cost += item.cost;
      if (cost > caseData.budget) break;
      value += item.value;
      categoryMask |= 1 << item.category;
    }
    if (cost > caseData.budget) continue;
    let categoryCount = 0;
    for (let bits = categoryMask; bits; bits &= bits - 1) categoryCount++;
    const score = value + caseData.diversityBonus * categoryCount;
    if (score > best.score) best = { score, cost, value, categoryCount, mask };
  }
  return best;
}

function runBenchmark() {
  const cases = buildCases();
  const rows = cases.map(testCase => {
    const heuristic = greedy(testCase);
    const optimum = exactOptimal(testCase);
    assert(heuristic.cost <= testCase.budget, 'greedy selection must obey budget: ' + testCase.id);
    assert(optimum.cost <= testCase.budget, 'exact selection must obey budget: ' + testCase.id);
    assert(optimum.score >= heuristic.score, 'exact optimum must be at least as good as heuristic: ' + testCase.id);
    return {
      id: testCase.id,
      seed: testCase.seed,
      itemCount: testCase.items.length,
      budget: testCase.budget,
      greedyScore: heuristic.score,
      greedyCost: heuristic.cost,
      exactScore: optimum.score,
      exactCost: optimum.cost,
      absoluteGap: optimum.score - heuristic.score,
      relativeGapPct: optimum.score === 0 ? 0 : +((optimum.score - heuristic.score) / optimum.score * 100).toFixed(3),
      greedyMatchedOptimum: heuristic.score === optimum.score
    };
  });
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  const result = {
    benchmark: 'Independent constrained-selection task',
    schemaVersion: 1,
    method: {
      caseCount: cases.length,
      deterministicSeeds: 4,
      casesPerSeed: 25,
      itemsPerCase: 14,
      budget: 30,
      objective: 'Maximise sum of item values plus a fixed bonus per represented category, subject to the budget',
      heuristic: 'Greedy selection ordered by value-to-cost ratio',
      reference: 'Exact enumeration of all 2^14 subsets for each case',
      caveat: 'This is a separate toy optimisation problem. It tests comparison against an exact reference, not generalisation of the Digital Alchemy symbolic model or real-world decision quality.'
    },
    overall: {
      cases: rows.length,
      averageGreedyScore: +mean(rows.map(row => row.greedyScore)).toFixed(3),
      averageExactScore: +mean(rows.map(row => row.exactScore)).toFixed(3),
      averageAbsoluteGap: +mean(rows.map(row => row.absoluteGap)).toFixed(3),
      averageRelativeGapPct: +mean(rows.map(row => row.relativeGapPct)).toFixed(3),
      greedyMatchedOptimumCases: rows.filter(row => row.greedyMatchedOptimum).length,
      greedyMatchedOptimumPct: +(rows.filter(row => row.greedyMatchedOptimum).length / rows.length * 100).toFixed(2),
      casesWhereGreedyWasSuboptimal: rows.filter(row => !row.greedyMatchedOptimum).length,
      budgetViolations: rows.filter(row => row.greedyCost > 30 || row.exactCost > 30).length
    },
    examples: {
      largestGaps: [...rows].sort((a, b) => b.absoluteGap - a.absoluteGap).slice(0, 5)
    },
    cases: rows
  };
  assert(result.overall.budgetViolations === 0, 'no solution may exceed the budget');
  assert(result.overall.greedyMatchedOptimumCases + result.overall.casesWhereGreedyWasSuboptimal === rows.length, 'case totals must reconcile');
  return result;
}

function stableResult(result) {
  const copy = structuredClone(result);
  return JSON.stringify(copy);
}

const first = runBenchmark();
const second = runBenchmark();
assert(stableResult(first) === stableResult(second), 'independent benchmark must be deterministic');
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/transfer-task-latest.json', JSON.stringify(first, null, 2) + '\\n');
const markdown = [
  '# Independent Constrained-Selection Benchmark',
  '',
  '> Scope: separate synthetic optimisation task; this does not establish generalisation to real-world tasks.',
  '',
  '## Method',
  '',
  '- 100 deterministic cases across four fixed seeds.',
  '- 14 candidate items per case and a fixed budget of 30.',
  '- Objective: total item value plus a bonus for each represented category.',
  '- Greedy comparator: value-to-cost ratio.',
  '- Reference: exact enumeration of all 16,384 possible subsets per case.',
  '',
  '## Results',
  '',
  '| Metric | Result |',
  '|---|---:|',
  '| Cases | ' + first.overall.cases + ' |',
  '| Mean greedy score | ' + first.overall.averageGreedyScore + ' |',
  '| Mean exact optimum score | ' + first.overall.averageExactScore + ' |',
  '| Mean absolute score gap | ' + first.overall.averageAbsoluteGap + ' |',
  '| Mean relative gap | ' + first.overall.averageRelativeGapPct + '% |',
  '| Greedy matched optimum | ' + first.overall.greedyMatchedOptimumCases + ' / ' + first.overall.cases + ' (' + first.overall.greedyMatchedOptimumPct + '%) |',
  '| Budget violations | ' + first.overall.budgetViolations + ' |',
  '',
  '## Interpretation',
  '',
  'The exact solver is a reference for this small, fully enumerable problem. The gap measures how the simple greedy heuristic compares on these generated cases. This is a separate toy task, not evidence that Digital Alchemy generalises to unrelated domains or makes good real-world decisions.',
  ''
].join('\n');
fs.writeFileSync('reports/transfer-task-latest.md', markdown + '\\n');
console.log('PASS: independent constrained-selection benchmark');
console.log(markdown);
