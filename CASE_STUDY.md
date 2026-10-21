# Case study: Digital Alchemy

## Summary

Digital Alchemy is a browser-based symbolic search and experimentation prototype built to investigate a simple engineering question:

**Can a system make its decision process more inspectable by comparing candidate routes, testing rules against baselines, and recording reproducible evidence?**

The project combines a small explicit state model, bounded search, deterministic experiments, a multi-stage research workflow, regression checks, and automated benchmark reporting. It is a portfolio prototype rather than a production service or a validated scientific model.

- **Live demo:** https://levitatingsnake.github.io/Digital-alchemy/
- **Source:** https://github.com/levitatingsnake/Digital-alchemy
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Development history:** [WORKBOOK.md](WORKBOOK.md)

## Problem framing

A polished interface can make an algorithm feel more capable than the evidence warrants. The project therefore treats observability and evaluation as product features: a user should be able to inspect the goal, see candidate operation sequences, compare alternatives, export recorded evidence, and understand what the result does and does not establish.

The design also makes a narrow scope explicit. Natural-language intention text is stored as context, while the user chooses the actual symbolic goal. The app does not pretend that a hidden language model has understood the user's intention.

## Design

### Model and search

The core is a deterministic symbolic environment with four bounded component values, a stability value, four operations, and five goal profiles. A score function measures alignment with the selected target. Bounded search compares short operation sequences and can show distinct alternative endpoints.

The benchmark compares no-op, greedy one-step, depth-two, depth-three, and deduplicated depth-three strategies over the same 400 deterministic cases. Selected routes are replayed from their original states to verify that the recorded endpoint and score are reproducible.

### Evidence workflow

The application includes tools for baseline comparisons, cross-goal audits, parameter stability, anomaly challenges, rule refinement, an evidence ledger, next-experiment selection, and competing-rule adjudication. A ten-stage Discovery Cycle coordinates these activities and audits fresh reports and workspace preservation.

A specific evaluation issue was corrected in rule refinement: selecting and evaluating a candidate on the same sample set can bias the apparent result. The current workflow selects variants on one 128-state tuning sample and evaluates the chosen candidate against the original rule on a separate 128-state validation sample. The candidate is only labelled improved if it meets the predeclared validation thresholds. The saved original remains unchanged.

### Automated verification

GitHub Actions runs JavaScript parsing and smoke checks, a real-stage integration test for the ten-stage cycle, adversarial boundary checks, targeted mutation checks, and the overnight benchmark. The mutation test deliberately introduces three faults in isolated source copies and verifies that the corresponding invariants reject them.

## Results

The latest verified overnight benchmark reports:

| Metric | Result |
|---|---:|
| Deterministic starting cases | 400 |
| Candidate transition evaluations | 33,600 |
| No-op baseline mean score | 68.778 |
| Greedy mean score | 72.995 |
| Depth-three mean score | 78.933 |
| Depth-three mean gain vs no-op | +10.155 |
| Cases where search beats greedy | 379 / 400 |
| Average selected route length | 2.757 |
| Transition-attempt reduction from deduplication | 18.61% |
| Cases with identical deduplicated and naive scores | 400 / 400 |

The results show that, for this model and fixed benchmark, bounded multi-step search improves the model's own objective over simpler baselines. State deduplication reduces attempted transitions while preserving the best measured score in all tested cases.

The full workflow passed on the latest verified code revision, including the real-stage integration test, boundary checks, targeted mutation checks, and benchmark assertions. The run is available at https://github.com/levitatingsnake/Digital-alchemy/actions/runs/39537751705.

## What was learned

1. **A baseline makes a result interpretable.** A score is more useful when compared against no-op and greedy strategies on the same cases.
2. **Replay is an integrity check, not decoration.** A route should be executable from its original state and reproduce its recorded endpoint.
3. **Holdout separation matters.** Candidate selection and candidate evaluation should not reuse the same sample set.
4. **Tests should demonstrate that they can fail.** Targeted mutation tests check whether chosen invariants catch specific implementation faults.
5. **A system should expose disagreement.** Competing-rule adjudication can show when the discovery leader does not retain its position on holdout states.
6. **A measured improvement can still be narrow.** All current scores depend on a hand-defined symbolic objective. Honest scope is part of the result.

## Limitations

- The model and score are hand-defined; the objective may not represent any useful external task.
- The benchmark is synthetic and fixed. Generalisation to new tasks is unknown.
- Holdout sets are independent samples generated for the same model, not external or real-world validation.
- The measured transition reduction is not a direct wall-clock timing result.
- The targeted mutation suite covers three deliberately introduced faults, not comprehensive mutation testing.
- The application stores research state in browser-local storage and does not provide cloud synchronisation, user accounts, or collaborative sessions.
- The project has not demonstrated scientific novelty, general intelligence, causal discovery, or practical effectiveness in a real-world domain.

## Next experiment

The highest-value next evaluation is to define a genuinely different task or objective, establish an external baseline, and test whether the same search-and-evidence architecture provides a measurable benefit without tuning the evaluation around the result. If it does not, that negative result should be documented rather than hidden.

A short screen-recorded demonstration should then walk through one intention, the explicit goal choice, a primary route and alternatives, the evidence workflow, the benchmark result, and the limitations.

## Implementation and AI assistance

The project was developed iteratively with AI assistance under human direction. The portfolio claim is not autonomous invention. It is the implementation and evaluation of an inspectable prototype, including the decisions to separate tuning from validation, add regression checks, measure against baselines, and state evidence limits clearly.
