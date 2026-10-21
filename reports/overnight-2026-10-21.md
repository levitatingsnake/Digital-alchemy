# Digital Alchemy Overnight Lab Report

**Run date:** 21 October 2026  
**Workflow:** [Successful GitHub Actions run](https://github.com/levitatingsnake/Digital-alchemy/actions/runs/39545380031)  
**Commit:** `d73a85f8e795a90de78bab5307463dc23486f033`

> **Scope and limitations:** This is a deterministic benchmark of Digital Alchemy's internal symbolic model. It does not establish real-world effectiveness, scientific novelty, causal discovery, physical chemistry, or general intelligence.

## Overall results

| Metric | Result |
|---|---:|
| Test cases | 400 |
| Candidate evaluations | 33,600 |
| No-op baseline mean score | 68.778 |
| Greedy mean score | 72.995 |
| Greedy mean gain vs no-op | +4.218 |
| Depth-3 search mean score | 78.933 |
| Depth-3 mean gain vs no-op | +10.155 |
| Cases depth-3 search beats greedy | 379 / 400 |
| Average selected route length | 2.757 |
| Deduplicated search mean score | 78.933 |
| Deduplicated transition attempts | 27,348 |
| Unique states scored by deduplicated search | 19,830 |
| Duplicate states skipped | 7,518 |
| Transition-attempt reduction vs naive search | 18.61% |
| Cases with identical deduplicated and naive scores | 400 / 400 |

## Strategy comparison

| Strategy | Mean score | Mean gain vs no-op | Cases improved | Improvement rate |
|---|---:|---:|---:|---:|
| Greedy (depth 1) | 72.995 | +4.218 | 371 | 92.75% |
| Bounded search (depth 1) | 72.995 | +4.218 | 371 | 92.75% |
| Bounded search (depth 2) | 76.270 | +7.492 | 390 | 97.50% |
| Bounded search (depth 3) | 78.933 | +10.155 | 394 | 98.50% |
| Deduplicated search (depth 3) | 78.933 | +10.155 | 394 | 98.50% |

## Method

- Five goals: balanced, concentrated, purified, stable, and custom.
- Four symbolic operations: Separate, Conjoin, Distill, and Fix.
- Maximum search depth: three operations.
- Baseline: leave the starting state unchanged.
- Greedy comparator: choose the best result among all single-operation routes.
- Deduplication: skip expanding states already reached at a shallower or equal depth.
- Integrity condition: deduplicated and naive search must return the same best score for every case.
- Repeatability: the full experiment executes twice and must produce identical results apart from the timestamp.

## Interpretation

Deeper search can consider all one-step routes plus longer sequences, so it should not score below the greedy comparator under this setup. The benchmark confirms that deeper search improves the internal objective across these generated cases. Deduplication preserved the best score on every case and reduced transition attempts by 18.61%.

Transition attempts are a proxy for search work, not a direct measurement of wall-clock speed. These results describe this implementation and test distribution only. They do not demonstrate that the approach generalises to arbitrary tasks or external reality.

## Automated validation

The successful workflow also completed:
- static and dynamic smoke checks;
- a real ten-stage Discovery Cycle integration test, verifying fresh report types and preservation of the experiment workspace;
- adversarial boundary checks;
- controlled mutation checks;
- repeatability and benchmark integrity assertions.

The workflow generated machine-readable JSON and this Markdown report as downloadable artifacts. The report here is a human-readable, versioned summary of the successful run.
