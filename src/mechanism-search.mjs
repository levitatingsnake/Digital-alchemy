/**
 * Experimental mechanism search: typed, explainable candidate generation.
 * Hypotheses are not verified solutions. Library is explicit and extensible.
 */
export const MECHANISMS = Object.freeze([
 {id:"decouple",operations:["substitute","sequence"],constraintKinds:["soft","assumed"],requires:["dependency"],principle:"Separate tasks whose timing or location has been treated as inseparable.",test:"Compare end-to-end lead time and failure rate with separated stages.",failure:"Coordination costs exceed the benefit."},
 {id:"pool",operations:["transfer","substitute"],constraintKinds:["soft","assumed"],requires:["capacity"],principle:"Share variable capacity across independent demand peaks.",test:"Measure peak utilisation, waiting time and service failures.",failure:"Demand peaks coincide or access creates a new bottleneck."},
 {id:"precommit",operations:["sequence","relax"],constraintKinds:["soft","assumed"],requires:["uncertainty"],principle:"Replace a large irreversible commitment with staged commitments tied to observed evidence.",test:"Compare cost of a staged pilot with cost of reversal after full commitment.",failure:"Staging costs or delays outweigh information value."},
 {id:"standardise-interface",operations:["substitute","sequence"],constraintKinds:["soft","assumed"],requires:["variation"],principle:"Standardise handoffs while leaving task-specific execution flexible.",test:"Compare rework and handoff error rates before and after an interface specification.",failure:"Variation is essential to safe or effective delivery."}
]);
const known=new Set(["dependency","capacity","uncertainty","variation"]);
export function proposeMechanisms(problem, reversal, {maxCandidates=4}={}) {
 if(!problem || !reversal || !Array.isArray(problem.constraints)) throw new Error("Problem and reversal required");
 if(!Number.isInteger(maxCandidates)||maxCandidates<1||maxCandidates>20) throw new Error("Invalid candidate limit");
 const target=problem.constraints.find(x=>x.id===reversal.constraint?.id);
 if(!target || target.statement!==reversal.constraint.statement) throw new Error("Reversal does not match problem");
 const signals=new Set(Array.isArray(problem.signals)?problem.signals:[]);
 const invalid=[...signals].filter(x=>!known.has(x));
 if(invalid.length) throw new Error("Unknown signals: "+invalid.join(", "));
 const candidates=MECHANISMS.filter(m=>m.operations.includes(reversal.operation)&&m.constraintKinds.includes(target.kind))
  .map(m=>({m,matched:m.requires.filter(s=>signals.has(s))}))
  .filter(x=>x.matched.length===x.m.requires.length)
  .sort((a,b)=>b.matched.length-a.matched.length||a.m.id.localeCompare(b.m.id))
  .slice(0,maxCandidates)
  .map(({m,matched})=>({
   mechanismId:m.id, principle:m.principle, matchedSignals:matched,
   causalHypothesis:`If "${target.statement}" can be changed by ${reversal.operation}, then ${m.principle.toLowerCase()}`,
   falsificationTest:m.test, failureMode:m.failure,
   evidenceStatus:"unverified",feasibility:"unknown",novelty:"unknown",
   dependencies:["Confirm the constraint is actually binding.","Obtain domain evidence for mechanism applicability."]
  }));
 return {objective:problem.objective,constraintId:target.id,operation:reversal.operation,
  candidates,abstained:candidates.length===0,
  abstentionReason:candidates.length?"":"No applicable mechanism with all required signals; do not fabricate a suggestion.",
  limitations:["Library-based mechanism retrieval is not open-ended discovery.","Signal tags must be supplied and independently checked.","Causal claims and proposed tests require domain validation."]};
}
