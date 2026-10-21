# Decision Lab: multi-domain business decision exploration

**Status:** working prototype, October 2026  
**Brand:** developed under the proposed Lumora Strategy working name  
**Interface:** [Decision Lab](https://levitatingsnake.github.io/Digital-alchemy/decision-lab.html)

## What it demonstrates

The Decision Lab is a small, inspectable interface for turning a prompt into a bounded decision-support exercise across small-business operations, construction, business finance, investment-process review and real-estate decisions. A visitor can choose improvement discovery, problem-solving exploration or constrained optimisation, then select a scenario family, objective and initiative limit. Budget is optional: when enabled, it becomes a hard constraint; otherwise the model compares initiatives without a spending cap. The visitor can inspect the selected actions and evidence behind the choice.

It is deliberately built alongside, rather than presented as the same thing as, Digital Alchemy's original symbolic state-transition engine. It is a practical demonstration of explainable constrained optimisation, not an LLM that understands arbitrary natural-language requests.

## How it works

1. The visitor enters a prompt and selects a scenario family. Simple keyword hints can suggest the domain and read a budget written in NZD; they are not full natural-language understanding.
2. The interface loads one of five fixed illustrative candidate libraries: small-business operations, construction operations, business finance, investment-process review or real-estate decisions. Each library contains 14 candidate initiatives.
3. Each candidate has an illustrative cost, impact score, risk factor, implementation-speed score and category.
4. The visitor chooses a mode and scoring objective: improvement discovery, problem-solving exploration or constrained optimisation, with balanced improvement, maximum impact, risk reduction or implementation speed.
5. The solver enumerates every subset of the 14 candidates (2^14 = 16,384 combinations), rejecting combinations that exceed the optional budget cap or maximum initiative count.
6. The highest-scoring feasible portfolio is returned, with selected actions, cost, remaining budget, rejected alternatives and a run trace.

The risk objective rewards lower risk-factor values; it does not reward taking more risk. A small category-diversity bonus encourages the selected portfolio to cover more than one operational area.

## Evidence and checks

The dedicated smoke test checks that the inline JavaScript parses, the Run button is wired, a budget-free default scenario completes, the run trace and limitation notice appear, a budget-constrained portfolio stays inside its budget, all five domain models execute, and the improvement, finance, investment, property, construction, resilience and budget sample buttons work.

Reproduce locally with:

```sh
node tests/decision-lab-smoke.mjs
```

The repository's GitHub Actions workflow runs this check alongside the existing Digital Alchemy test suite.

## New improvements: robust search and evidence pathways

The portfolio search now evaluates every feasible subset against two deterministic scoring scenarios:

- **Baseline:** the existing initiative scores under the selected objective.
- **Illustrative downside:** impact is reduced to 72% of its baseline, risk factor increases by six points (capped at 35), and delivery speed is reduced to 85%.

The ranking combines 65% baseline score with 35% downside score. Balanced and speed objectives now reward lower risk rather than accidentally rewarding higher risk. The run output records baseline, stress and combined robust scores so reviewers can inspect the effect. These scenario weights are design assumptions, not statistically estimated probabilities or forecasts.

The output also presents a domain-specific evidence source list. For finance, investment and property this includes relevant New Zealand official or industry sources such as the Reserve Bank of New Zealand, Financial Markets Authority, REINZ, Inland Revenue and Tenancy Services. Links are **reference pathways only**: the prototype does not fetch, parse or verify their contents automatically. Users must check publication dates, geography, definitions and relevance, then replace synthetic inputs with verified evidence.

The smoke test checks that downside scoring and external evidence pathways appear in the output across all five domains. Existing budget and deterministic-selection constraints remain in place.

## Limitations

- Costs and scores are illustrative inputs, not estimates validated against a real business, contractor, job site, investment portfolio, property or dataset.
- Finance, investment and property scenarios use synthetic assumptions and no live market data. Investment outputs focus on decision process, fees, concentration and risk checks, not specific assets or buy/sell calls.
- The interface uses a fixed scenario catalogue and simple keyword hints. It does not reliably interpret arbitrary questions.
- The scores are a transparent model objective, not probabilities, forecasts or proof of savings.
- The optimiser finds the best portfolio according to the specified toy objective, not a universally best real-world decision.
- It does not call an LLM, browse live prices, inspect project documents or provide legal, safety, engineering, financial, investment, property or construction advice.
- The result must be checked by people with relevant domain knowledge before any real decision is made.

## Next evaluation gates

1. Ask domain practitioners to review the candidate library and scoring assumptions.
2. Replace illustrative costs with a small, permissioned reference dataset and record the provenance of each value.
3. Compare recommendations against a human-reviewed baseline on held-out scenarios.
4. Record disagreement, missing constraints and cases where the tool should abstain.
5. Only then consider connecting a natural-language layer, keeping extraction separate from optimisation and showing the user the structured assumptions before running.

The important engineering principle is separation of concerns: prompt interpretation, objective definition, constraint checking, optimisation and evidence reporting should be independently inspectable.
