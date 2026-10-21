# Independent Constrained-Selection Benchmark

**Run:** [Successful automated workflow](https://github.com/levitatingsnake/Digital-alchemy/actions/runs/39549026880)  
**Date:** 21 October 2026

> **Scope:** This is a separate synthetic optimisation task. It does not establish that Digital Alchemy's symbolic model generalises to real-world tasks.

## Method

- 100 deterministic cases across four fixed seeds.
- 14 candidate items per case and a fixed budget of 30.
- Each item has a cost, a value, and one of four categories.
- Objective: maximise total item value plus a fixed bonus of 4 for each represented category.
- Greedy comparator: choose items by value-to-cost ratio while respecting the budget.
- Reference solver: exact enumeration of all 16,384 possible subsets per case.
- Reproducibility: run the full benchmark twice and assert identical results.

## Results

| Metric | Result |
|---|---:|
| Cases | 100 |
| Mean greedy score | 130.220 |
| Mean exact optimum score | 132.010 |
| Mean absolute score gap | 1.790 |
| Mean relative gap | 1.396% |
| Greedy matched optimum | 53 / 100 (53%) |
| Cases where greedy was suboptimal | 47 / 100 |
| Budget violations | 0 |

## Interpretation

The exact solver provides a ground-truth optimum for this small, fully enumerable problem. The greedy heuristic matched that optimum in 53 cases and fell short in 47, with a mean relative gap of 1.396% on this generated suite. No selection exceeded the budget.

This demonstrates a measurable comparison between a simple heuristic and an exact reference on a different problem formulation. It is not proof that the Digital Alchemy symbolic engine generalises, that the generated cases represent real decisions, or that either approach would be appropriate for a real-world allocation problem.

## Reproduce

Run:

```bash
node tests/transfer-task-benchmark.mjs
```

The script checks determinism and constraints, then writes machine-readable JSON and Markdown outputs under `reports/`. GitHub Actions also includes these outputs as workflow artifacts.
