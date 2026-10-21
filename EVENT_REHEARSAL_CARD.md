# Digital Alchemy: event rehearsal card

A phone-friendly guide for showing the project to an AI, product, or engineering person. Digital Alchemy is a flagship portfolio experiment being developed under the working brand **Lumora Strategy**, which is a proposed name and not yet a legally registered company.

## Open these first

1. [Live app](https://levitatingsnake.github.io/Digital-alchemy/)
2. [Decision Lab: business and construction choices](https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html)
3. [GitHub repository](https://github.com/levitatingsnake/Digital-alchemy)
4. [Technical case study](CASE_STUDY.md)
5. [Latest automated test run](https://github.com/levitatingsnake/Digital-alchemy/actions/workflows/overnight-lab.yml)
6. [Versioned benchmark report](reports/overnight-2026-10-21.md)

## The 20-second opener

> “I’m building an applied-AI portfolio under the working name Lumora Strategy. Digital Alchemy is one experiment in making goal-directed systems inspectable: you choose an explicit goal, it searches possible operation sequences, compares alternatives, and records evidence. I’ve built a working interface and a test pipeline that challenges the implementation. I’m interested in taking this approach into more useful applied-AI tasks.”

## The two-minute live demo

**0:00 to 0:15 | Mission**  
Show the XenoLab dashboard and its four tabs. Say: “This is a working research workbench, not just a mock-up.”

**0:15 to 0:40 | Search**  
Choose a simple goal, run Find route, and inspect the selected sequence. Be clear that the intention text is context; the explicit goal selector drives the symbolic model.

**0:40 to 0:55 | Alternatives**  
Tap Explore futures. Compare candidate endpoints and their scores. Explain that scores measure alignment with this model's own objective.

**0:55 to 1:15 | Evidence**  
Open Evidence and run the proof demo. Show the result actually produced. Mention that the automated suite also tests boundaries, repeatability, integration behaviour and selected injected faults.

**1:15 to 1:35 | Memory**  
Open Memory. Show that an experiment can be sent to Obsidian or exported as Markdown. This uses an Obsidian URL handoff/export, not silent background syncing.

**1:35 to 1:50 | Engineering evidence**  
Show the successful GitHub Actions run and the versioned benchmark report. Headline result: depth-three search scored 78.933 on average versus 68.778 for the no-op baseline across 400 fixed synthetic cases. Deduplication reduced transition attempts by 18.61% with the same best scores.

**1:50 to 2:00 | Close**  
Say: “Those results are internal to this symbolic model, so I’m not claiming real-world discovery. The next challenge is testing the approach on a genuinely different task. I’d love your view on what would make that evaluation convincing.”

## If the live demo goes wrong

- **Site will not load:** open the repository and show the code, test files, case study and successful workflow. Do not pretend a screenshot is a live run.
- **A button fails:** say, “That’s a real defect. I’d capture the steps, reproduce it, and add a regression test.” Move on rather than improvising a result.
- **Proof run fails:** show the actual failure, note the message, and use the previously successful CI run only to explain what that separate run verified. Do not imply the current run passed.
- **Obsidian does not open:** explain that the bridge hands off through an Obsidian URL and can export Markdown. Do not claim automatic cloud sync.
- **You have only 30 seconds:** use the opener, show one real route, then ask the other person what task they would use to challenge it.

## Accurate claims to keep handy

- **It is:** a browser-based, deterministic symbolic search and experiment prototype with a distinctive UI, research tools, evidence export and automated tests.
- **It is not:** an LLM-powered natural-language reasoner, a chemistry simulator, a validated scientific discovery system, or proof of general intelligence.
- **The symbolic benchmark shows:** how search strategies compare under the current model's scoring function on a fixed synthetic suite.
- **A separate benchmark shows:** how a greedy heuristic compares with an exact optimum on 100 small constrained-selection cases. Mean relative gap: 1.396%, with zero budget violations. [Read the report](reports/transfer-task-2026-10-21.md).
- **Neither benchmark shows:** real-world accuracy or generalisation to unrelated real-world tasks. Transition counts are not wall-clock speed measurements.
- **Your role:** you conceived and directed the project, made product decisions, tested the live app and used AI assistance in building it. Be transparent about the collaboration.

## Optional applied-decision demo

Open the [Decision Lab](https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html), run the construction scenario, then change the budget or objective. Explain that it is a separate bounded-choice model using illustrative inputs, not an LLM understanding arbitrary questions or a validated construction adviser. Its purpose is to demonstrate constraints, transparent scoring and explainable trade-offs.

## Three good questions for a technical person

1. “What would be the most convincing genuinely different task to test this on?”
2. “Which part would you inspect first: search, evaluation, integration tests, or the evidence trail?”
3. “What kind of applied-AI team might value someone who prototypes, tests and explains systems like this?”

## Final check before the conversation

- [ ] Open the live app on the device you will use.
- [ ] Run the proof demo once.
- [ ] Make sure the GitHub repository and report links open.
- [ ] Close personal notifications and unrelated tabs.
- [ ] Keep this page available as your fallback.
