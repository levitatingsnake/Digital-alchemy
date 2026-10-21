# First Discovery Experiment: Constraint-Reversal Discovery

Status: **protocol proposed, not run**. No superiority claims permitted.

## Hypothesis
A system that deliberately searches for **constraint reversals** (conditions under which a seemingly impossible objective becomes feasible) and constructs falsifiable tests will generate more useful, non-obvious, grounded solution hypotheses than a strong one-shot LLM prompt or a fixed template engine, on a narrow class of operational-design problems.

This is a candidate research direction, not a claimed new algorithm. Novelty requires prior-art review.

## Why this first
Unlike the existing four-value symbolic state, constraint reversals are inspectable in real scenarios: a binding bottleneck can be removed, transferred, relaxed, decomposed, traded or transformed into a resource. Candidate moves can be falsified with data. This creates a possible discovery mechanism beyond decorating advice.

## Proposed pipeline (not yet implemented)
1. Represent the user's objective, actors, resources, constraints, assumptions and evidence, retaining provenance and uncertainty.
2. Separate hard physical/legal constraints from policy, habit, resource and inferred constraints.
3. Identify binding constraints and generate alternative world models by reversing one assumption at a time.
4. Search for mechanisms that could make a reversal real; include cross-domain analogies, but require a causal explanation.
5. Attempt to falsify each mechanism, list dependencies and failure conditions.
6. Propose the cheapest discriminating experiment and measurable success threshold.
7. Update a hypothesis ledger based on outcomes, including failed and abandoned ideas.

## Evaluation protocol
- 10 **held-out** fictional but realistic operations/design scenarios, authored independently of candidate generation and sealed before testing.
- Three systems: current Forge, strong baseline ChatGPT prompt with equal problem information, and prototype constraint-reversal pipeline.
- Blind reviewers score each result on 1-5 scales for grounded originality, feasibility, causal clarity, actionable experiment, and constraint adherence.
- Penalise fabricated evidence and impossible or unsafe suggestions; record abstention and cost.
- Pre-register decision gate **before seeing outputs**: prototype must improve mean reviewer-rated actionable novelty by at least 1 point over both comparators, with no worse constraint adherence or unsupported-claim rate, on >= 7 of 10 cases. This is an exploratory threshold, not a statistically conclusive proof.
- Reviewers should include at least two people with domain experience; disagreement is recorded, not averaged away silently.
- Require a separate second batch before any external claim of superiority.

## Controls
No confidential Corrections data; no real medical decisions; no claims of autonomous invention; no paid APIs without approval; do not trigger unnecessary CI runs. Preserve existing deployment and keep experimental code on a separate branch.

## Immediate build gate
Implement a minimal structured problem/constraint schema and a transparent single-reversal evaluator; use unit tests and manual examples first. **Do not build a new UI until this mechanism has demonstrated value.**
