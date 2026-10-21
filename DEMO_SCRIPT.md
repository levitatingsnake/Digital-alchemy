# Digital Alchemy: 2-minute portfolio demo

**Purpose:** show an AI-engineering reviewer a working search-and-evidence prototype, its tests, and the limits of its claims.

**Live demo:** https://levitatingsnake.github.io/Digital-alchemy/  
**Repository:** https://github.com/levitatingsnake/Digital-alchemy  
**Optional applied-decision demo:** https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html

## Before you show it

- Open the live site and make sure the latest dashboard has deployed.
- In **Mission**, choose a goal, build a test brief, then use **Find route** and **Explore futures**. Use a simple goal such as Balanced or Stable.
- In **Evidence**, tap **Run proof demo**. Wait for the real result.
- If you plan to show rule research, go to **Engine**, preserve at least two candidate rules, then run the Discovery Cycle and inspect its actual report.
- In **Memory**, confirm the Obsidian vault name and export or send a test log.
- Do not clear browser data just before the demo. The app's saved state is local to that browser.

## Run of show

### 0:00–0:15 | The question

**On screen:** Show the XenoLab landing screen and the four workspace tabs.

**Say:**
“Digital Alchemy explores a simple engineering question: can a system make its decisions easier to inspect by exposing its objective, comparing possible routes, testing hypotheses, and keeping evidence?”

### 0:15–0:40 | Mission: make a goal explicit

**On screen:** Open **Mission**. Enter a short intention, explicitly choose the model goal, build the test brief, then find a route.

**Say:**
“The text is context, not a claim of natural-language understanding. I choose the actual model objective explicitly. The engine then searches sequences of defined symbolic operations and shows its route and score.”

### 0:40–0:58 | Compare alternatives

**On screen:** Tap **Explore futures** and inspect the alternatives and their endpoints.

**Say:**
“Rather than presenting one answer as magic, it lets me compare alternatives against the same declared objective. These are internal alignment scores, not probabilities of success in the real world.”

### 0:58–1:20 | Evidence: challenge the implementation

**On screen:** Open **Evidence**, run the proof demo, and show the actual pass/fail summary. If time allows, inspect Prometheus or reproducibility results.

**Say:**
“The evidence layer checks implementation properties such as bounded outputs and repeatability. Adversarial tests and holdout experiments can reveal weaknesses in the model. Passing these checks is not proof that the model describes external reality.”

**Important:** show the verdict the app actually produces. Do not manufacture a preferred result. If a test fails or a report is inconclusive, explain it plainly.

### 1:20–1:40 | Engine: show the research loop

**On screen:** Open **Engine**. Show rule discovery or refinement, and the Discovery Cycle only if enough saved candidates are available.

**Say:**
“The research tools make it possible to generate candidate rules, test them on separate synthetic samples, compare competing explanations, and record counterexamples. The next step is to challenge the same architecture on a genuinely different task.”

### 1:40–1:52 | Reproducible engineering

**On screen:** Open the repository's [README](README.md), [Architecture](ARCHITECTURE.md), and the latest successful [overnight lab workflow](https://github.com/levitatingsnake/Digital-alchemy/actions/workflows/overnight-lab.yml).

**Say:**
“The benchmark compares bounded search against simpler baselines over 400 deterministic cases. The measured improvement is specific to this model and test suite. The repository includes the implementation, tests, and reports so a reviewer can challenge the result.”

### 1:52–2:00 | Close honestly

**On screen:** Return to the live app.

**Say:**
“This is a reproducible, inspectable symbolic prototype, not a validated scientific discovery engine. I'm interested in feedback on the evaluation design and what task would be the strongest next test.”

## Optional extension: Decision Lab (30–45 seconds)

If the audience wants a more familiar business example, open the [Decision Lab](https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html). Load the construction scenario, run it with the NZ$30,000 budget, then change the objective to risk reduction or lower the budget and rerun.

**Say:**
“This is a separate constrained-choice prototype built alongside the symbolic engine. It exhaustively compares combinations of illustrative initiatives against budget and item-count constraints, then shows the scoring and trade-offs. The costs and scores are demonstration inputs, not a real contractor estimate or a validated recommendation.”

**Show:** selected initiatives, remaining budget, rejected alternatives and the run trace. Invite the reviewer to change a constraint and observe how the result changes.

## Capture checklist

- [ ] Close unrelated tabs, notifications, and personal information.
- [ ] Verify the live site reflects the current dashboard before recording.
- [ ] Test the key buttons once on the device you will use.
- [ ] Show actual outputs, test results, and workflow status.
- [ ] Do not describe the intention field as semantic AI understanding.
- [ ] Do not describe symbolic scores as real-world probabilities or scientific proof.
- [ ] If recording a screen demo, keep the cursor deliberate and avoid editing in results that the app did not produce.
