# Portfolio pitch: Digital Alchemy

A practical talk track for showing Digital Alchemy to an AI, product, or engineering person. Keep the live app open and let the evidence do the work. The wider portfolio is being developed under the working brand **Lumora Strategy**; this is a proposed brand name, not a statement of legal incorporation.

## The 20-second introduction

“I’m developing an applied-AI portfolio under the working name Lumora Strategy. Digital Alchemy is one of my flagship experiments: a browser-based engine where you choose an explicit goal, it searches candidate routes, compares alternatives, and runs repeatable checks. I’m exploring how to make these systems more testable and transparent, rather than just producing a convincing answer.”

## The two-minute walkthrough

1. **Mission:** choose a clear model goal and explain that the user selects the model interpretation. The intention text is contextual input, not an LLM understanding claim.
2. **Route search:** run a route and show the chosen path alongside alternatives. Explain that the score belongs to this symbolic objective.
3. **Engine:** show the discovery/refinement tools and explain that candidate rules are hypotheses tested inside a bounded model.
4. **Evidence:** run the proof demo. Point to the actual test outputs, then show the benchmark report or workflow in GitHub.
5. **Memory:** show how an experiment can be sent to Obsidian or exported as Markdown, so results can be inspected outside the app.
6. **Limit:** say what the system has not established. Invite a technical challenge.

## The strongest measured result, stated accurately

The current benchmark covers 400 deterministic starting cases and 33,600 candidate transition evaluations. Within the app's own symbolic objective:

- Depth-three search mean score: 78.933.
- No-op baseline mean score: 68.778.
- Mean gain over no-op: +10.155.
- Depth-three search beat greedy search in 379 of 400 cases.
- Deduplication reduced transition attempts by 18.61%, with matching best scores in all 400 cases.

These are model-internal results, not real-world success probabilities, physical chemistry, causal discovery, or evidence of general intelligence. Describe them as benchmark results from this implementation, not independent validation.

I have also added a separate constrained-selection benchmark: a greedy value-to-cost heuristic is compared with an exact solver that enumerates every subset of a small item set under a budget. This tests evaluation discipline on a different toy problem, but it does not mean the Digital Alchemy engine has generalised or that either task is validated for real-world decisions. The first measured run scored 130.220 for greedy selection versus 132.010 for the exact optimum on 100 generated cases, with a mean relative gap of 1.396% and no budget violations. See the [versioned report](reports/transfer-task-2026-10-21.md) and [successful workflow](https://github.com/levitatingsnake/Digital-alchemy/actions/runs/39549026880).


## Optional applied-decision demo

The companion [Decision Lab](https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html) now has five fixed scenario libraries: small-business operations, construction, business finance, investment-process review and real estate. It supports improvement discovery without a required budget, or constrained optimisation when one is supplied. Use the finance or property sample for a familiar business-facing walkthrough, while clearly stating that its assumptions are synthetic and it does not use live market data or provide professional advice.

## If someone asks “What is actually AI about it?”

Be precise: the project is an AI-engineering portfolio experiment about search, evaluation, competing candidate rules, evidence capture, and reproducibility. The current browser engine is a deterministic symbolic model; the intention field is not interpreted by an LLM. The point is to demonstrate how to build and scrutinise an intelligent-system prototype, not to claim that this version is a trained model.

## Good questions to ask a technical reviewer

- “What would you change first to make the evaluation harder to game?”
- “What genuinely different task would be a meaningful generalisation test?”
- “Which part would you want to inspect first: search, validation, reproducibility, or the UI?”
- “What kind of applied AI team would value someone who can prototype, test, and explain systems like this?”

## Close

“I’ve built the prototype end to end with AI assistance and human direction. I’m looking for a creative applied-AI environment where I can keep building, testing, and improving things. If you were reviewing this for that kind of role, what would you want to see next?”

## Before showing it

- Open the live site and verify the current version loads.
- Run the proof demo once and show its real output.
- Have the GitHub repository and case study ready.
- Avoid personal notifications and unrelated tabs when recording.
- If a test fails, show the failure honestly and describe how you would investigate it.

Links: [Live app](https://levitatingsnake.github.io/Digital-alchemy/) · [Repository](https://github.com/levitatingsnake/Digital-alchemy) · [Technical case study](CASE_STUDY.md) · [Demo script](DEMO_SCRIPT.md)
