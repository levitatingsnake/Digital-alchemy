/**
 * Constraint-Reversal Lab v0: transparent experiment, not an invention oracle.
 * No model calls, external evidence or real-world feasibility verification.
 */
export const REVERSAL_OPERATIONS = Object.freeze(["relax","remove","substitute","sequence","transfer"]);
export function inspectConstraint(problem, constraintId, operation) {
  if (!problem || typeof problem !== "object" || !String(problem.objective||"").trim()) throw new Error("A stated objective is required");
  if (!Array.isArray(problem.constraints)) throw new Error("constraints must be an array");
  if (!REVERSAL_OPERATIONS.includes(operation)) throw new Error("Unknown reversal operation");
  const constraint=problem.constraints.find(c=>c.id===constraintId);
  if (!constraint) throw new Error("Constraint not found");
  if (!["hard","soft","assumed"].includes(constraint.kind)) throw new Error("Constraint kind must be hard, soft or assumed");
  if (!String(constraint.statement||"").trim()) throw new Error("Constraint statement is required");
  const isHard=constraint.kind==="hard";
  const operations={
    relax:"Reduce the binding threshold while preserving the underlying requirement.",
    remove:"Consider a counterfactual where the constraint no longer applies.",
    substitute:"Replace the constrained resource or process with a functionally equivalent alternative.",
    sequence:"Reorder work to defer or bypass the bottleneck without ignoring it.",
    transfer:"Move the burden to another actor or stage, accounting for shifted risk."
  };
  const warnings=[];
  if(isHard) warnings.push("Hard constraint: this is a thought experiment only; do not violate physical, legal or safety requirements.");
  if(!constraint.evidence?.length) warnings.push("Constraint classification has no attached evidence.");
  const premise=`If we could ${operation} the constraint "${constraint.statement}", what mechanism would make that possible without undermining the objective?`;
  return {
    schemaVersion:1,
    objective:String(problem.objective),
    constraint:{id:constraint.id,statement:constraint.statement,kind:constraint.kind,evidence:constraint.evidence||[]},
    operation,mechanismPrompt:operations[operation],counterfactual:premise,
    falsificationQuestions:[
      "What observation would show this reversal cannot work?",
      "Which other constraint becomes binding if this one changes?",
      "What is the smallest safe test that distinguishes the proposal from the status quo?"
    ],
    experiment:{hypothesis:null,measurement:null,successThreshold:null,owner:null,status:"not-designed"},
    warnings,
    evidenceStatus:"unverified",
    limitations:["This generator proposes a structured question, not a solution.","No novelty, feasibility or external evidence has been established."]
  };
}
export function enumerateReversals(problem) {
  if (!Array.isArray(problem?.constraints)) throw new Error("constraints must be an array");
  return problem.constraints.flatMap(c=>REVERSAL_OPERATIONS.map(op=>inspectConstraint(problem,c.id,op)));
}
