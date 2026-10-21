# Digital Alchemy: 2-minute demo script

**Purpose:** a concise portfolio walkthrough for an AI engineering reviewer. Show the system working, show its evidence, and state the boundary honestly.

**Format:** screen recording, 16:9, 1080p if available. Keep the cursor deliberate. No background music is required. Do not edit in results that were not produced by the live app.

## Run of show

### 0:00–0:12 | The question

**On screen:** Open the live app and show the title and guided session console.

**Narration:**
“Digital Alchemy is an experimental search-and-evidence engine. The idea is simple: don't just show an answer. Show the goal, candidate routes, the tests, and what the evidence actually supports.”

### 0:12–0:30 | Set a goal

**On screen:** Move through the guided console. Enter a short intention, explicitly choose a goal profile, and build a test brief.

**Narration:**
“The intention is context, not magic. I choose the model interpretation explicitly, so the system doesn't pretend a language model understood something it never parsed.”

### 0:30–0:52 | Compare routes

**On screen:** Show the primary route, then the alternative endpoint comparison. Point out route operations, score delta, and final state.

**Narration:**
“The engine searches bounded sequences of symbolic operations. It can compare distinct endpoints and show how each scores against the chosen objective. These percentages are internal model scores, not real-world success probabilities.”

### 0:52–1:15 | Inspect the research loop

**On screen:** Navigate to the Discovery Cycle and Rule Adjudicator. Run the workflow only if the current browser state and saved candidate rules make the run meaningful. If it needs saved candidate rules, prepare them before recording.

**Narration:**
“The research layer compares candidate rules, checks holdout behaviour, records disagreements, and audits whether evidence is fresh. A rule that wins on discovery can still lose on holdout, and the system is allowed to say so.”

**Recording note:** don't manufacture a preferred verdict. Show the actual result from the current run. If the panel reports insufficient candidates or inconclusive evidence, explain that honestly.

### 1:15–1:38 | Show reproducible evidence

**On screen:** Show the Research report export control, then open the repository's README benchmark table or the latest successful GitHub Actions run.

**Narration:**
“The benchmark uses 400 deterministic cases. Depth-three search reached a mean score of 78.933 versus 68.778 for doing nothing, and beat greedy search in 379 cases. That's a measured improvement inside this symbolic model, not proof of external effectiveness.”

### 1:38–1:52 | Show engineering discipline

**On screen:** Open the Actions run and show the passing smoke, integration, boundary, mutation, and benchmark steps. Briefly show the architecture diagram.

**Narration:**
“The project also checks route replay, repeatability, boundary conditions, and whether selected invariants catch deliberately injected faults. That makes the claims easier to audit.”

### 1:52–2:00 | Close with the limitation

**On screen:** Return to the app or README.

**Narration:**
“The next challenge is to test this architecture on a genuinely different task with an external baseline. Until then, the honest result is a reproducible, inspectable prototype, not a scientific discovery engine.”

## Capture checklist

- [ ] Close unrelated tabs, notifications, and personal information.
- [ ] Test the route and buttons once before recording.
- [ ] Ensure the app has enough saved candidate rules for any research panel you plan to demonstrate.
- [ ] Use a fresh, understandable example and keep the goal choice visible.
- [ ] Show actual outputs and actual Actions results.
- [ ] Do not describe the intention field as semantic AI understanding.
- [ ] Do not call symbolic scores probabilities or claims of real-world success.
- [ ] Include captions or a transcript when publishing.
