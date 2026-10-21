# Digital Alchemy

**A small, inspectable search-and-experiment engine for turning an explicit goal into candidate routes, tests, and evidence.**

[**Launch the live demo**](https://levitatingsnake.github.io/Digital-alchemy/) · [**Open the Lumora Alchemy Console**](https://levitatingsnake.github.io/Digital-alchemy/console.html) · [**Try the Decision Lab**](https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html) · [**Open Signal Observatory**](https://levitatingsnake.github.io/Digital-alchemy/observatory.html) · [Decision Lab method](DECISION_LAB.md) · [Portfolio pitch](PORTFOLIO_PITCH.md) · [Architecture](ARCHITECTURE.md) · [Technical case study](CASE_STUDY.md) · [2-minute demo script](DEMO_SCRIPT.md) · [Event rehearsal card](EVENT_REHEARSAL_CARD.md) · [Development workbook](WORKBOOK.md) · [Latest overnight lab](https://github.com/levitatingsnake/Digital-alchemy/actions/workflows/overnight-lab.yml) · [Latest benchmark report](reports/overnight-2026-10-21.md)

Digital Alchemy is an experimental portfolio project about building systems that do more than produce an answer: they expose their objective, compare alternatives, test candidate rules, preserve reproducible evidence, and report limitations.

The companion Signal Observatory searches New Zealand's public data.govt.nz catalogue live, exposes resource metadata, fetches bounded DataStore samples, profiles numeric fields, and can hand a CSV plus source URL, resource ID and retrieval timestamp to the Decision Lab Evidence Forge. This makes the evidence workflow live, while leaving the model's synthetic candidate scores unchanged. See [Signal Observatory architecture and limits](OBSERVATORY.md). The companion Decision Lab now explores five illustrative decision areas: small-business operations, construction, business finance, investment decision processes, and real estate. It supports improvement discovery without requiring a budget, or constrained optimisation when a budget is supplied. Finance, investment and property scenarios use synthetic assumptions and no live market data. The Decision Lab's portfolio search also scores candidate combinations against a documented downside scenario and provides links to relevant New Zealand evidence sources. Those links are reference pathways, not automatic data feeds; the model still uses synthetic inputs until verified data is entered. The bespoke [Alchemy Console](https://levitatingsnake.github.io/Digital-alchemy/console.html) adds a local-first evidence register for recording source URLs, values, check dates, verification status and limitations. Entries stay in the current browser unless manually exported as JSON. The Console now also includes an experiment ledger: record a prediction before a test, enter the observed numeric outcome, capture context and a pre-set verdict, and inspect signed error, mean absolute error and mean absolute percentage error. Logs can be exported as JSON or CSV. These descriptive metrics are not combined across different units, and they do not imply automatic model training or causal inference. The Decision Lab now lets the user vary downside stress severity to compare how a portfolio responds to harsher assumptions. It is part of an emerging applied-AI portfolio being developed under the working brand **Lumora Strategy**. Lumora Strategy is a proposed name, not a claim that a company has been legally registered.

> **Evidence boundary:** this is a symbolic toy model. Its scores are internal objective scores, not probabilities of success, physical chemistry, causal evidence, or proof of real-world usefulness.

## Why this project exists

Many demos show a result. Digital Alchemy tries to show the chain behind a result:

1. Define a target profile and starting state.
2. Search for candidate operation sequences.
3. Compare routes against simple baselines.
4. Probe saved candidate rules on deterministic samples.
5. challenge results with boundary tests, holdouts, and competing-rule adjudication.
6. Record what was measured, what passed, and what remains unknown.

The project deliberately distinguishes **implemented capability**, **measured model-internal evidence**, and **unproven real-world claims**.

## Try the demo

Open the [live application](https://levitatingsnake.github.io/Digital-alchemy/).

A useful first pass:

1. Use the guided session console to set up a substrate and choose an explicit model goal.
2. Enter an intention and build a test brief. The sentence is stored as context; it is **not** interpreted by an NLP or LLM system. You choose the model interpretation.
3. Explore the primary route and alternative endpoints. Compare operation sequences and model-score changes.
4. Inspect the research tools, including the Discovery Cycle and Rule Adjudicator.
5. Export the current research report or experiment data to inspect the evidence outside the app.

The interface stores working research state in the current browser. Local browser data is not automatically synchronised to another device.

## Current measured result

The deterministic benchmark uses 400 fixed starting cases across five goal profiles and compares search strategies using the same symbolic objective.

| Search strategy | Mean score | Mean gain vs no-op | Cases improved |
|---|---:|---:|---:|
| Greedy / depth one | 72.995 | +4.218 | 371 / 400 |
| Bounded search, depth two | 76.270 | +7.492 | 390 / 400 |
| Bounded search, depth three | 78.933 | +10.155 | 394 / 400 |
| Deduplicated search, depth three | 78.933 | +10.155 | 394 / 400 |

The depth-three search evaluated 33,600 candidate transitions in the benchmark. Deduplication reduced attempted transitions by 18.61% while returning the same best score for all 400 cases. Transition counts are a proxy for work, not a wall-clock performance measurement.

These results support a narrow claim: **deeper search improves the current model's own objective on this fixed benchmark, and state deduplication preserved the measured result**. They do not establish that the objective is a good proxy for real-world outcomes or that the approach generalises to other domains.

The overnight workflow also checks route replay integrity, repeatability, boundary behaviour, workspace preservation, and three deliberately introduced model faults. A separate constrained-selection benchmark now tests a different toy optimisation problem: a greedy value-to-cost heuristic is compared against exact enumeration of every valid subset. This provides an independently measurable comparison on another problem formulation, not proof that the symbolic model generalises. See the [versioned constrained-selection report](reports/transfer-task-2026-10-21.md); the latest run also publishes generated JSON and Markdown artifacts.

## Research and engineering features

- **Bounded route search:** compares operation sequences under an explicit objective.
- **Alternative endpoint comparison:** surfaces distinct candidate states and their score deltas.
- **Deterministic holdout trials:** compares saved candidate rules on generated samples.
- **Independent refinement validation:** candidate variants are tuned on one sample set and judged on a separate validation set; the original saved rule is preserved.
- **Competing-rule adjudication:** ranks candidate rules on discovery and holdout states, reporting disagreement rather than hiding it.
- **Ten-stage Discovery Cycle:** runs a chain of analysis and evidence-building stages, records stage failures, and audits freshness and workspace preservation.
- **Research export:** builds a Markdown snapshot from evidence saved in the current browser without inventing missing results.
- **Outcome threshold review:** the browser-local experiment ledger can store an explicit numeric success threshold and whether higher or lower is better, flag misses for human review, and preserve the rule beside the observed result. A flag triggers reconsideration; it does not prove causation or automatically change the engine's recommendation.
- **Human decision review:** after recording an outcome, the ledger can preserve an explicit next step (continue cautiously, adjust and retest, stop, or gather more evidence) and the reason for it. The readout counts unresolved reviews and shows the chosen next step beside the observation.
- **Condition-aware comparison:** experiment records can capture the circumstances of each test. The readout compares observed averages, ranges and consistently recorded target outcomes for the same decision, metric and unit across distinct condition labels. Conditions are user-entered; small samples and confounding factors remain, so this is a descriptive signal rather than a causal claim.
- **Next-experiment recommender:** the console uses transparent rules to identify an evidence gap and suggest a smallest useful follow-up test, what to keep consistent, and what observation would change the next step. It prioritises under-sampled conditions or asks for a comparable baseline when records are sparse. This is decision support based on user-entered records, not an AI claim, statistical significance test, or causal conclusion.
- **Repeated-test consistency review:** the browser-local experiment ledger groups observations only when decision, metric and unit match. It reports whether repeated tests agree or conflict on an identical numeric success rule, and warns when thresholds differ or are missing. Different units are never combined. This is descriptive review of recorded observations, not causal inference, statistical proof, or automatic model training.
- **Rule-based follow-up prompts:** the ledger suggests a cautious next step from the recorded verdict and threshold: investigate unexpected harm, adjust after a miss, repeat a met target under comparable conditions, gather evidence for inconclusive results, or set a target if none was recorded. These prompts are transparent rules, not machine learning or autonomous decisions.
- **Automated tests and benchmark:** static/dynamic smoke checks, real-stage integration, adversarial boundaries, targeted mutation checks, deterministic benchmark, and route replay assertions.

## Run the checks locally

Requirements: Node.js 24 recommended. The project currently uses a single HTML application and Node's built-in test tooling; no package installation is required for these checks.

From the repository root:

```bash
node tests/smoke-check.mjs
node tests/real-stage-integration.mjs
node tests/adversarial-boundaries.mjs
node tests/mutation-check.mjs
node tests/overnight-benchmark.mjs
```

The overnight benchmark writes `reports/overnight-latest.json` and `reports/overnight-latest.md` when run locally. GitHub Actions also publishes a concise job summary and uploads those generated reports as artifacts.

## Repository map

- `index.html`: application UI, symbolic model, search, research tools, local persistence, and exports.
- `tests/smoke-check.mjs`: script parsing, interface wiring, and isolated model checks.
- `tests/real-stage-integration.mjs`: runs the actual ten-stage Discovery Cycle in a lightweight DOM shim.
- `tests/adversarial-boundaries.mjs`: checks edge and mixed states across goals and operations.
- `tests/mutation-check.mjs`: verifies selected invariants catch three intentionally introduced faults.
- `tests/overnight-benchmark.mjs`: fixed-case baseline comparison, search-depth analysis, determinism, deduplication equivalence, and route replay.
- `tests/transfer-task-benchmark.mjs`: separate constrained-selection problem comparing a greedy heuristic with exact enumeration.
- `.github/workflows/overnight-lab.yml`: scheduled and on-demand verification workflow.
- `WORKBOOK.md`: detailed project history, design decisions, acceptance gates, and limitations.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the system flow and component boundaries.

## Limitations and next steps

The current system has important limits:

- It uses a hand-defined symbolic state and objective. It does not model real chemistry or physical processes.
- Plain-language intention is contextual text, not semantic understanding.
- Holdout tests are independent samples within the same model, not independent real-world validation.
- The benchmark uses a fixed synthetic suite; performance on other tasks is unknown.
- Browser-local saved evidence can be missing or cleared, and is not cloud-synchronised. Target-based review flags depend on the threshold and direction entered by the user; they are prompts for review, not autonomous retraining or verified causal conclusions.
- Mutation checks cover three targeted faults, not the entire application.
- The application is a static prototype, not a production service with accounts, server storage, or multi-user collaboration.

Next portfolio milestones: a concise screen-recorded demo, a polished technical case study, stronger evaluation against a genuinely different objective or external task, and continued documentation of failures as well as improvements.

## Project approach

Digital Alchemy is built iteratively with AI assistance and human direction. The goal is not to imply that the system autonomously invented scientific laws. The goal is to demonstrate engineering judgement: explicit assumptions, reproducible experiments, tests that can fail, measured comparisons, and honest reporting.
