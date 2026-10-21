/**
 * Decision Challenger v0.1: deterministic, evidence-first review.
 * No AI claims, no external services, no personal data.
 * Returns prompts for human investigation, never a verdict.
 */
export function challengeDecision(input) {
  if (!input || typeof input !== "object") throw new TypeError("Decision input must be an object");
  const decision = String(input.decision || "").trim();
  if (!decision) throw new Error("A proposed decision is required");
  const evidence = Array.isArray(input.evidence) ? input.evidence.filter(x => x && String(x.claim || "").trim()) : [];
  const assumptions = Array.isArray(input.assumptions) ? input.assumptions.filter(Boolean).map(String) : [];
  const alternatives = Array.isArray(input.alternatives) ? input.alternatives.filter(Boolean).map(String) : [];
  const constraints = Array.isArray(input.constraints) ? input.constraints.filter(Boolean).map(String) : [];
  const findings = [];
  function add(code, severity, question, reason) { findings.push({code, severity, question, reason, status:"requires-human-review"}); }
  if (!evidence.length) add("NO_EVIDENCE","high","What specific evidence supports this choice?","No supporting evidence was supplied.");
  if (!String(input.objective || "").trim()) add("NO_OBJECTIVE","medium","What measurable outcome is this decision intended to achieve?","No objective was supplied.");
  if (!alternatives.length) add("NO_ALTERNATIVES","medium","What other approaches could achieve the same objective?","No alternatives were supplied.");
  if (!constraints.length) add("NO_CONSTRAINTS","medium","What budget, timing or operational constraints apply?","No constraints were supplied.");
  for (const [index,item] of evidence.entries()) {
    if (!String(item.source || "").trim()) add("UNSOURCED_EVIDENCE","high",`What source verifies evidence item ${index+1}?`,"An evidence claim has no cited source.");
    if (item.status === "unverified") add("UNVERIFIED_EVIDENCE","high",`How will evidence item ${index+1} be independently checked?`,"Evidence was explicitly marked unverified.");
  }
  if (assumptions.length) add("ASSUMPTIONS_TO_TEST","medium","Which assumptions would reverse the decision if false?",`${assumptions.length} explicit assumption(s) need testing.`);
  return {
    version:"0.1.0", decision, objective:String(input.objective || ""),
    evidenceCount:evidence.length, assumptions, alternatives, constraints,
    findings, nextExperiment: findings.length ? "Validate the highest-severity unanswered question using an independent source or low-cost test." : "Request an independent domain review before acting.",
    limitations:["This is a deterministic checklist, not a legal or technical assessment.","It does not verify source truth, causal relationships, or decision correctness.","Findings are questions, not proof of defects."]
  };
}
