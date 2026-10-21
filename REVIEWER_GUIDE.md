# Reviewer Guide: Digital Alchemy

This guide is for an engineer or hiring reviewer who wants to evaluate the project quickly without taking the product metaphor on faith.

## A five-minute review

### 1. Run the application (about 60 seconds)
Open the [live demo](https://levitatingsnake.github.io/Digital-alchemy/). In the Guided Session Console:
1. Set a starting substrate.
2. Choose a target goal.
3. Build a test brief and inspect the suggested route.
4. Compare the alternative endpoints. Check the displayed starting score, final score, route length, and explored-state count.

**Question to ask:** can you trace the suggested result to explicit state values, operations, and a stated objective?

### 2. Challenge the evidence (about 90 seconds)
Inspect the discovery workflow and its reports. Preserve at least two competing rules before running the ten-stage Discovery Cycle. Read the adjudication verdict, independent holdout results, and integrity audit.

**Question to ask:** does the system distinguish evidence within its symbolic model from evidence about the real world?

### 3. Reproduce the benchmark (about 90 seconds)
Open [the overnight lab workflow](https://github.com/levitatingsnake/Digital-alchemy/actions/workflows/overnight-lab.yml), select a successful run, and download its `digital-alchemy-overnight-lab` artifact. The artifact contains JSON and Markdown reports. The workflow also runs the smoke, real-stage integration, adversarial-boundary, mutation, and benchmark tests.

The committed test command is documented in the [README](README.md). The benchmark uses deterministic seeds and compares no-op, greedy, and bounded multi-step search on a fixed synthetic suite.

### 4. Inspect the implementation (about 60 seconds)
Start with:
- [Architecture](ARCHITECTURE.md): component boundaries and data flow.
- [Benchmark implementation](tests/overnight-benchmark.mjs): state generation, baselines, search, and replay checks.
- [Adversarial boundary tests](tests/adversarial-boundaries.mjs): clamping, finite scores, bounded stability, and mutation checks.
- [Mutation tests](tests/mutation-check.mjs): three deliberately faulty in-memory variants that must be rejected.
- [Technical case study](CASE_STUDY.md): measured results, design decisions, limitations, and next steps.

## What the results do and do not establish

The latest recorded benchmark evaluated 400 deterministic cases and 33,600 candidate transitions. Depth-three search achieved a mean score of 78.933 versus 72.995 for greedy search and 68.778 for the no-op baseline. These are scores under the project's own symbolic objective.

The benchmark supports the narrow claim that bounded search improves that objective on this test suite. It does **not** establish scientific novelty, physical chemistry, real-world utility, causal effects, or general intelligence. Transition-attempt counts are a work proxy, not a wall-clock performance measurement.

The synthetic holdout sets are deterministic and generated from the same declared model. They help detect overfitting to a particular sample, but are not independent real-world validation.

## Collaboration and provenance

This is an AI-assisted portfolio project. The owner directed the concept, product goals, review priorities, and decisions; AI assistance contributed to implementation, tests, analysis, and documentation. Review the repository and tests directly rather than treating the disclosure as a substitute for inspection.

## Suggested reviewer feedback

The most useful next challenge is a concrete one:
- propose a failure case the current tests miss;
- identify an assumption in the objective or operation model;
- suggest a stronger baseline or external validation design;
- or explain which claim the current evidence is not strong enough to support.

A good next step should be testable and should improve the evidence, not merely add another feature.
