# Digital Alchemy — Finished Product Workbook

_Last updated: 2026-10-20_

This workbook records the intended finished product, acceptance criteria, and portfolio goals. It is a living specification, not a claim that every listed capability has already been implemented.

## 1. Product vision

Digital Alchemy is an experimental, goal-directed discovery system wrapped in an intuitive, futuristic user experience. A person states an intention in ordinary language; the product helps translate it into a measurable objective, explores possible transformations, evaluates candidates, preserves evidence, and presents useful options in plain English.

**Product promise:** the user chooses the outcome; the system handles the complexity.

The interface should feel like advanced alien scientific technology, while the underlying behaviour remains transparent, reproducible, and technically honest. The aesthetic supports the product; it must never disguise a weak or nonfunctional engine.

## 2. Primary product experience: The Idea Forge / Oracle

The first user-facing application is an invention and possibility laboratory for everyday users.

### User journey
1. **State an intention.** Accept a rough idea, question, problem, or desired outcome without requiring a polished specification.
2. **Clarify success.** Help translate the intention into explicit, measurable criteria and identify constraints.
3. **Explore possibilities.** Generate materially different candidate approaches, not just paraphrases of the same idea.
4. **Transform and search.** Use the symbolic engine where its available operations and state representation can meaningfully contribute. Use additional tools or models only where justified.
5. **Evaluate candidates.** Score against declared objectives, constraints, evidence quality, feasibility, cost, novelty, and usefulness as appropriate.
6. **Show the work.** Present candidate routes, intermediate states, reasons for rankings, uncertainty, assumptions, and failed approaches.
7. **Select and act.** Let the user compare, refine, save, replay, export, and choose a next experiment. Any consequential external action requires explicit approval.
8. **Learn from outcomes.** Record results so later experiments can compare against prior work and simple baselines.

### Modes
- **Explore possibilities:** examine alternative futures and unexpected directions.
- **Achieve an outcome:** search for routes toward a defined target.
- **Create or transform:** turn an idea, dataset, document, or workflow into a useful artifact, where appropriate tools exist.

These modes are product directions. Do not present them as fully implemented until each has been built and verified.

## 3. Engine requirements

The engine must grow beyond a visually compelling toy model into a defensible computational discovery loop.

### Required capabilities
- Explicit state representation, operation definitions, and objective functions.
- Candidate generation and multi-step search within declared limits.
- Constraint checking, including clear reporting when no candidate satisfies constraints.
- Transparent scoring with documented weights and limitations.
- Repeatable runs with stable inputs, recorded parameters, and reproducible outputs.
- Experiment archive with route, intermediate states, score, constraints, run metadata, and outcome.
- Rule/candidate library that supports retaining, comparing, reusing, combining, and discarding candidates.
- Evaluation against a simple baseline to establish whether the search adds value.
- Honest handling of failure, uncertainty, ties, and search-space limitations.
- A clear separation between symbolic engine results, language-model interpretation, external data, and human judgement.

### Discovery loop target
1. Generate candidates.
2. Evaluate each against the declared objective and constraints.
3. Reject invalid or infeasible candidates, recording why.
4. Rank surviving candidates and retain promising discoveries.
5. Test retained candidates against baselines or external validation.
6. Preserve the evidence and use it to inform the next search.

**Important distinction:** candidate combinations may be new within the defined search space, but this alone does not prove scientific novelty, general intelligence, real-world effectiveness, or commercial value. Claims must be supported by tests.

## 4. Portfolio objective: flagship AI engineering demonstration

Digital Alchemy is intended to become the flagship project in the user's AI engineering portfolio, demonstrating creative technical thinking through a working, inspectable artifact.

### What the finished project should demonstrate
1. **Goal-directed search:** translate a target into measurable criteria and search for candidate solutions.
2. **Combinatorial discovery:** identify useful multi-step combinations not supplied as complete recipes.
3. **Reproducibility:** replay experiments and inspect their full records.
4. **Measured performance:** compare results with a simple baseline using a defined test set.
5. **Human-guided exploration:** make technically meaningful discovery accessible through an intuitive interface.
6. **Responsible technical communication:** show limitations, failed experiments, assumptions, and what remains unproven.

### Portfolio deliverables
- Public, working demo with a distinctive, polished interface.
- Clean GitHub repository with a useful README and setup instructions.
- Architecture diagram covering interface, interpreter/orchestration, symbolic engine, evaluator, storage, and optional external tools.
- Automated tests for core operations, search, constraints, persistence/export, and reproducibility.
- A benchmark or evaluation report that includes baseline comparisons and failure cases.
- A short demonstration video showing an actual run from intention to candidate evaluation.
- Technical case study documenting the problem, design choices, experiments, results, trade-offs, limitations, and next steps.
- Clear contribution statement: what the user conceived and directed, what AI tools assisted with, what was tested, and what the system demonstrably does.

The project should make its technical value evident without relying on self-promotional claims. Do not imply that the user independently wrote every line if AI tools contributed.

## 5. Visual and interaction principles

- Futuristic, alien-science instrument aesthetic: dark, precise, luminous, elegant, not cluttered.
- Plain-language entry point; no requirement for the user to understand formulas or code.
- Show the destination, candidate routes, evidence, and confidence/limitations in understandable terms.
- Advanced details should be inspectable without overwhelming a first-time user.
- Every visible control must work or be clearly marked as a future concept.
- Preserve the distinction between a conceptual mock-up, an AI-generated suggestion, a simulated run, and a verified engine result.
- Keep local-first functionality where practical; cross-device sync is a separate capability and must not be implied until implemented.

## 6. Acceptance gates for a finished portfolio release

### Gate A — Functional integrity
- Every advertised core control works in the deployed version.
- Core tests pass and key failure states are handled.
- Saving, restoring, and export behaviour are accurately described.
- No critical feature is only decorative or silently fails.

### Gate B — Discovery integrity
- Candidate generation and evaluation are real executable code, not manually authored example outputs.
- Objective functions and constraints are explicit.
- Runs can be reproduced from recorded inputs and parameters.
- Search results are compared with a baseline on a declared test set.
- Failed and invalid candidates are recorded honestly.

### Gate C — Demonstrated value
- At least one end-to-end task shows a measurable benefit over a simple baseline, or the report candidly documents that the hypothesis was not supported.
- A reviewer can reproduce or independently inspect the evidence.
- The demo clearly separates verified results from illustrative scenarios.

### Gate D — Portfolio quality
- README, architecture diagram, tests, benchmark notes, and case study are available.
- Demo is accessible and works on desktop and mobile layouts.
- Visual identity is cohesive and the interface explains what the engine is doing.
- Limitations and future work are documented.

## 7. Phased roadmap

### Phase 1 — Stabilise the existing workbench
- Verify the current deployed build and existing symbolic operations.
- Check route search, scoring, constraints, traces, archive, replay/restore, JSON export, and local persistence.
- Fix defects before expanding the feature set.

### Phase 2 — Build a real discovery loop
- Formalise candidate generation, objective evaluation, constraint handling, ranking, and retention.
- Add run identifiers and complete reproducibility metadata.
- Add tests for deterministic and edge-case behaviour.

### Phase 3 — Create a compelling Idea Forge experience
- Add intention capture and clarification.
- Present multiple distinct candidate paths with plain-language explanations.
- Show evidence, assumptions, trade-offs, and next experiments.
- Mark features that require an LLM, external data, or other services rather than implying the symbolic engine does them alone.

### Phase 4 — Prove the engine adds value
- Select a bounded benchmark problem.
- Define success metrics before testing.
- Compare against a simple baseline.
- Report positive, negative, and ambiguous results.

### Phase 5 — Package the flagship portfolio project
- Complete documentation, tests, architecture diagram, evaluation report, and demonstration video.
- Polish the visual experience and verify the public deployment.
- Prepare a concise technical narrative for creative AI engineering / AI prototyping roles.

## 8. Explicitly out of scope until separately justified

- Claims of general-purpose intelligence or autonomous scientific discovery.
- Claims that the system discovers profitable strategies or reliably solves arbitrary real-world goals.
- Unverified claims of scientific novelty.
- Automatic real-world actions without user approval.
- Paid infrastructure or services before a compelling need is demonstrated.
- Feature expansion for visual spectacle alone.

## 9. Current-state honesty

The existing repository contains the working Digital Alchemy prototype and tests. Previous project notes describe symbolic operations, goal scoring, route search, execution traces, an experiment archive, replay/restore, JSON export, and browser-local saving. Each capability must be rechecked against the current deployed build before being advertised as verified.

The Oracle / Idea Forge experience, general-purpose intention interpretation, expanded discovery loop, baseline evaluation, and portfolio packaging are roadmap requirements unless separately implemented and tested. Conceptual examples in planning discussions are not evidence of engine execution.

## 10. Definition of success

Digital Alchemy is ready to serve as the flagship portfolio project when a reviewer can:
- open the live demo;
- state or select a bounded goal;
- run a genuine search;
- inspect and replay the result;
- understand why candidates were ranked;
- compare performance with a baseline;
- read the technical documentation and reproduce the key result; and
- see a clear, honest account of what works, what fails, and what should be built next.

The target is not merely to look like advanced technology. It is to be an original, well-engineered, experimentally honest project that makes an AI engineering team curious enough to investigate further.

## 11. Overnight experiment laboratory (implemented 2026-10-20)

### Automation
- GitHub Actions workflow: `.github/workflows/overnight-lab.yml`.
- Scheduled daily at 13:30 UTC (02:30 during New Zealand daylight time; 01:30 during standard time).
- Also runs when relevant application, test, or lab workflow files change on `main`, and can be launched manually from GitHub Actions.
- Runs the existing smoke checks, then the deterministic benchmark on Node.js 24.
- Publishes a readable report to the Actions run summary and uploads JSON + Markdown reports as a 30-day artifact.
- The workflow has read-only repository permissions. It does not edit application code or merge changes.

### Benchmark
- Script: `tests/overnight-benchmark.mjs`.
- Evaluates 400 deterministic starting states across five defined goals, four fixed operations, and four fixed seeds.
- Compares the no-op baseline, best single-operation (greedy) choice, and exhaustive operation sequences up to depth three.
- Evaluates 33,600 candidate transitions per run and repeats the benchmark to check reproducibility.
- Records per-goal metrics, route choices, representative search advantages/regressions, and all case-level data.
- Report paths created during each run: `reports/overnight-latest.md` and `reports/overnight-latest.json` (available as workflow artifacts rather than committed into the live branch).

### First verified run
The first GitHub Actions run completed successfully on 2026-10-20. The existing smoke checks and benchmark assertions passed.

| Metric | First run |
|---|---:|
| Test cases | 400 |
| Candidate evaluations | 33,600 |
| No-op mean score | 68.778 |
| Greedy mean score | 72.995 |
| Greedy gain vs no-op | +4.218 |
| Depth-three search mean score | 78.933 |
| Depth-three gain vs no-op | +10.155 |
| Cases where depth-three search beat greedy | 379 / 400 |
| Average selected route length | 2.757 |

These are results inside the current symbolic scoring model only. They demonstrate that multi-step search improves the model's own objective on this fixed test suite; they do not demonstrate real-world utility, scientific novelty, or general intelligence. Future benchmark changes must preserve a declared test method and compare results against these baselines.

### Next laboratory upgrades
1. Test whether beam search or state deduplication can reduce evaluations while preserving solution quality.
2. Add boundary, constraint, and adversarial test suites.
3. Add mutation tests so accidental changes to operation/scoring behaviour are detected.
4. Track benchmark history and compare candidate algorithm versions.
5. Only after stronger tests exist, introduce an AI-assisted code-change proposal workflow on a separate branch. Never automatically merge unreviewed changes into `main`.

### Search-efficiency experiment (2026-10-20)
- Added a state-deduplicated search variant to `tests/overnight-benchmark.mjs`.
- GitHub Actions reran the smoke checks and benchmark successfully after the change.
- The deduplicated variant matched the naive bounded search score on all 400 test cases.
- Naive search attempted 33,600 transitions; deduplicated search attempted 27,348, a reduction of 18.61%.
- The deduplicated run skipped expanding 7,518 duplicate states and scored 19,830 newly reached states.
- Mean score remained 78.933, matching the naive depth-three search.

Interpretation: this is a positive internal optimisation result for the current four-operation symbolic model. The transition-count reduction is a work proxy, not a measured wall-clock speedup, and it does not establish real-world usefulness. Keep the equivalence assertion in place whenever search logic changes.

### Complete ten-stage research cycle (updated 2026-10-21)

- Expanded the existing Discovery Cycle button into a ten-stage orchestrator.
- Stages: conditional pattern scan; discriminating experiment design; adversarial anomaly challenge; held-out Prometheus trial; paired comparison against do-nothing; cross-goal robustness audit; rule stability audit; evidence-ledger compilation; next-experiment selection; competing-rule adjudication with a separate synthetic holdout.
- Each stage is isolated with error capture, so one failure is recorded and the remaining stages are still attempted.
- The cycle integrity audit requires fresh report types from all ten stages across both report stores, rejects stale reports, records stage errors, and verifies that the substrate, stability, selected goal, custom target, custom stability setting, and saved rule library remain unchanged.
- Added `tests/real-stage-integration.mjs`, which executes the actual application script in a lightweight Node DOM shim, runs all ten real stages with competing candidate rules, and asserts fresh evidence, no stage exceptions, a passing audit, workspace preservation, and a rendered cycle summary. This is a real-stage integration test, but not a visual browser test.
- The smoke suite also retains mocked orchestration tests for simulated stage failure, continuation, and audit rejection, because the integration test's successful path alone does not prove every failure mode.
- Prometheus trial reports carry an explicit `prometheus-trial` type, allowing the report generator and evidence ledger to recognise them reliably.
- All generated evidence remains synthetic and scoring-model-dependent; this workflow is a repeatable internal research protocol, not external validation.

### Independent validation for rule refinement (2026-10-21)

- Corrected a potential evaluation leak: candidate variants were previously selected and judged on the same sample set.
- Candidate variants are now ranked on 128 deterministic tuning states, then the chosen variant is evaluated against the original rule on a separate 128-state validation set generated from a distinct seed, with tuning states explicitly excluded.
- Conservative acceptance criteria are applied to validation metrics, not tuning metrics. If a candidate does not clear the threshold on validation, it is not offered for preservation.
- The original saved rule remains unchanged; only a candidate that clears independent validation can be added to the local library.
- Tests assert determinism, separate sample counts, non-overlap between tuning and validation sets, non-mutation of source rule/samples, and the validation acceptance thresholds.
- This reduces selection bias within the synthetic symbolic model. It is not independent real-world validation.

### Evidence-aware research report export (2026-10-20)

- Added a **Research report** export alongside the existing full JSON experiment export.
- The Markdown report captures the current intention, selected goal and target profile, current substrate and objective score, candidate route if present, and counts of saved experiment/evidence reports.
- It summarises available recent Prometheus/baseline and Law Forge evidence where compatible metrics exist.
- It proposes a next experiment based on which evidence categories are already saved, without fabricating missing results.
- Includes explicit limitations around synthetic states, objective-score interpretation, external validity, browser-local storage, and missing reports.
- Added smoke checks for the report builder, download wiring, limitation language and next-experiment recommendation.
- The export is a point-in-time report from the current browser state; it does not claim to have independently validated the model.

### Alternative route evidence (2026-10-20)

- Test briefs now compare the primary route with the strongest distinct endpoint states found by a separate bounded search through four operations.
- Each alternative reports its operation sequence, endpoint component values, stability, model alignment, and score-point change from the starting state.
- The panel reports how many states were checked and clearly distinguishes model score from real-world effectiveness.
- Search is deterministic under the current model and bounded to keep interaction responsive; it is not exhaustive over unlimited sequences.
- Smoke checks now cover the comparison function, alternative panel, and score delta.

### Intention-to-test-brief workflow (2026-10-20)

- Added a plain-language intention field and an explicit model-interpretation selector.
- Building a brief selects the chosen goal, updates the current goal alignment, runs the bounded route finder, and presents the target profile and any candidate operation sequence.
- The user's intention text is stored locally and included in the experiment export.
- The interface explicitly states that the sentence is contextual text, not semantic input to an NLP/LLM system. Goal interpretation remains a deliberate human choice.
- Added smoke-check coverage for the brief controls, event wiring, local persistence, and export.
- The brief reports the model's predicted alignment only; it does not claim the route is effective in the real world.

### Guided session console (2026-10-20)

- Added a responsive launch console near the top of the app to reduce the cognitive load of a lab that now contains many research tools.
- Five jump points guide users through substrate setup, goal selection, route exploration, model investigation, and evidence review.
- Navigation uses real in-page anchors, includes keyboard-visible focus styling, and rearranges for mobile screens.
- Added an explicit scope reminder: scores describe the symbolic model and are not probabilities of real-world success.
- Existing engine functions and saved state format are unchanged by this UI-only addition.

### Search-route replay integrity (2026-10-20)

- The benchmark now replays every selected naive and deduplicated route from its original starting state.
- Each replay must reproduce both the recorded final state and the recorded objective score across all 400 benchmark cases.
- This guards against a misleading result where a search reports a high score or route that cannot actually be reproduced by executing its listed operations.

### Controlled mutation testing (2026-10-20)

- Added `tests/mutation-check.mjs`, which runs the unmodified symbolic model as a control, then introduces three deliberate faults in isolated in-memory source copies.
- Mutations tested: widen the component clamp ceiling from 100 to 1000; make the objective score return `NaN`; remove state cloning so an operation mutates its input.
- Each mutation must be rejected by the matching invariant check. The production `index.html` is never modified by the test.
- Added the mutation check to the overnight GitHub Actions workflow.
- This is a small, targeted mutation test, not comprehensive mutation coverage of the whole application.

### Search-depth comparison (2026-10-20)

- Extended the benchmark report to compare greedy/depth-one, depth-two, depth-three, and deduplicated depth-three search on the same 400 fixed cases.
- GitHub Actions run completed successfully: [run 9](https://github.com/levitatingsnake/Digital-alchemy/actions/runs/39403419493).
- Smoke checks, adversarial boundary checks, deterministic repeatability, score-equivalence assertions, report generation, and artifact upload all passed.

| Strategy | Mean score | Mean gain vs no-op | Cases improved |
|---|---:|---:|---:|
| Greedy / depth one | 72.995 | +4.218 | 371 / 400 |
| Bounded search, depth two | 76.270 | +7.492 | 390 / 400 |
| Bounded search, depth three | 78.933 | +10.155 | 394 / 400 |
| Deduplicated search, depth three | 78.933 | +10.155 | 394 / 400 |

The result supports a limited conclusion: deeper search improves the current model's own score on this fixed benchmark. Deduplication preserves that score while reducing attempted transitions by 18.61%. This does not yet measure wall-clock speed, generalize to new problem domains, or validate the scoring function against real-world outcomes.

### Adversarial boundary checks (2026-10-20)
- Added `tests/adversarial-boundaries.mjs` and wired it into the overnight workflow before the benchmark.
- Exercises boundary and mixed states, including component values at 0, 1, 50, 99, and 100 and stability at 0 and 10.
- Checks every declared goal and every operation against finite/bounded scoring, input immutability, four-component shape, clamped integer values, bounded stability, and non-empty operation explanations.
- The workflow should be treated as the source of truth for pass/fail. Do not claim these checks passed until the new run completes.


### Competing-rule adjudication (2026-10-21)

- Added a Rule Adjudicator panel and a tenth stage in the Discovery Cycle.
- The adjudicator ranks all saved candidate rules on 256 deterministic discovery states, then evaluates the same candidates on a separate 256-state holdout generated from a different fixed seed.
- It reports whether the discovery leader stays top-ranked, is contradicted by the holdout ranking, ties, or has no clear separation. It also displays up to five concrete states with the largest spread between candidate-rule predictions.
- The report is deterministic for the same saved rules and goal, records the two seeds, and checks that the user's working substrate, goal, and saved rules remain unchanged.
- Important limit: both samples are scored by the same symbolic objective used to define candidate gains. The holdout can expose ranking instability within this model, but it is not independent real-world validation and cannot establish practical usefulness.
- Smoke checks cover deterministic output, separate sample counts, complete candidate rankings, non-zero disagreement probes, explicit verdicts, insufficient-candidate handling, and the stated evidence boundary.


### Portfolio packaging checkpoint (2026-10-21)

- Added a repository README with the live demo, guided first-run path, benchmark summary, test commands, repository map, current limits, and clear distinction between model-internal evidence and real-world claims.
- Added `ARCHITECTURE.md` with a Mermaid system map, current component boundaries, evidence flow, benchmark method, and explicit non-goals.
- These documents describe the current implementation and do not present planned work as already implemented.
- Portfolio work remaining: record a short screen demonstration, write a concise technical case study, and test whether the approach generalises beyond its current hand-defined objective.
