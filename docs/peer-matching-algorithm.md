# Peer Matching Algorithm Specification

## 1. Purpose and Product Goal

This document specifies a production-grade peer matching system for `Peer Navigator`.

Primary goals:

- Maximize match quality and continuity (better conversations, lower rematch rate).
- Enforce strong safety rules before and during matching.
- Enforce fairness and balanced access across cohorts.
- Learn over time without compromising safety through constrained exploration.

Recommended system name:

- **Reciprocal Constrained Stable Matching (RCSM)**

RCSM is a layered system, not a single algorithm.

---

## 2. Why A Layered System

Single-method approaches are insufficient:

- Stable matching alone gives stability, but not global utility optimization under fairness/safety trade-offs.
- Maximum-weight matching alone gives utility, but can produce unstable pairings that churn.
- Recommender ranking alone gives local top-N relevance, but does not enforce market-wide constraints.

RCSM combines strengths of all three:

1. Candidate generation and reciprocal scoring (recommender).
2. Constrained global selection (optimization).
3. Stability refinement (deferred acceptance).
4. Online adaptation (contextual bandits with hard constraints).

---

## 3. End-to-End Matching Pipeline

At each matching cycle (for example every 1-5 minutes):

1. **Ingest eligible users**
   - Active, opted-in, and currently available users.
   - Exclude users in cooldown, blocked states, or policy hold.

2. **Generate candidate edges**
   - Build top-K candidates per user after hard compatibility filters.
   - Keep graph sparse for computational efficiency.

3. **Compute reciprocal pair scores**
   - Estimate utility in both directions.
   - Build pair-level features including compatibility, complementarity, reliability, and risk.

4. **Apply hard safety policy gates**
   - Remove any edge violating policy (no soft override).

5. **Solve constrained global assignment**
   - Maximize total utility subject to capacity, fairness, and operational constraints.

6. **Run stability refinement pass**
   - Reduce blocking pairs to improve acceptance and reduce churn.

7. **Finalize and dispatch**
   - Return primary pair and optional backup pair for resilience.

8. **Log outcomes and learn**
   - Update models and confidence estimates from outcomes.

---

## 4. Data Model

### 4.1 User state (online matching profile)

- `user_id`
- `availability_window`
- `timezone`
- `language_set`
- `conversation_goal_tags` (support type, topic intent)
- `background_tags` (user-controlled, privacy-safe)
- `experience_tags` (mentor/peer preference, domain familiarity)
- `modality_preferences` (text/voice/video)
- `trust_signals` (response reliability, no-show rate, report history)
- `risk_state` (policy classifier outputs and confidence)
- `fairness_group_attrs` (only if policy/legal allows; may be encrypted/partitioned)

### 4.2 Pair features (for edge `(i, j)`)

- Time overlap score
- Language overlap score
- Goal compatibility score
- Complementarity score
- Prior interaction penalty (to avoid repetitive loops)
- Predicted acceptance probability
- Predicted 24h continuity probability
- Predicted quality score proxy
- Safety risk score
- Fairness/exposure adjustment terms

### 4.3 Outcome events

- `match_proposed`
- `match_accepted`
- `first_response_ms`
- `conversation_started`
- `conversation_duration`
- `followup_opt_in`
- `rematch_requested`
- `safety_flag` / `policy_event`

---

## 5. Candidate Generation (Sparse Graph Construction)

Let `U` be eligible users and `E` be candidate edges.

Naive all-pairs is `O(|U|^2)` and expensive. Use two-stage candidate generation:

1. Hard filter stage:
   - Same language or translatable pair allowed.
   - Time overlap >= minimum threshold.
   - No policy blocks or hard exclusion.

2. Fast retrieval stage:
   - Approximate nearest neighbors on embedding vectors.
   - Keep top `K` candidates per user (for example 20-100).

Result:

- `|E| ~= |U| * K`, tractable for optimization.

---

## 6. Reciprocal Scoring Model

### 6.1 Directed utility

Define directed predicted utility:

- `s(i -> j)` and `s(j -> i)` from a model.

Model options:

- Fast start: calibrated gradient boosting.
- Scale path: two-tower neural model with pair cross-features.

### 6.2 Pair utility aggregation

Use harmonic-like reciprocity to avoid one-sided matches:

`R_ij = 2 * s(i->j) * s(j->i) / (s(i->j) + s(j->i) + eps)`

### 6.3 Full pair score

`Score_ij = a*R_ij + b*C_ij + c*D_ij + d*T_ij - l*Risk_ij`

Where:

- `R_ij`: reciprocal affinity.
- `C_ij`: complementarity (shared intent + complementary lived experience).
- `D_ij`: diversity/serendipity bonus (bounded).
- `T_ij`: reliability and trust likelihood.
- `Risk_ij`: safety risk term.

All terms must be calibrated and normalized for stable optimization.

---

## 7. Safety Layer (Hard First, Then Soft)

Safety is not just a penalty term. It must include hard gates.

### 7.1 Hard constraints (edge removal)

Examples:

- Active block-list relation.
- Severe policy risk classification.
- Age/legal incompatibility.
- Protected-context restrictions from policy.

If any hard rule triggers, edge is dropped before optimization.

### 7.2 Soft safety terms

Lower-risk but cautionary signals may reduce score:

- Recent mild moderation issues.
- Low reliability plus high vulnerability context.

Soft penalties never override hard gates.

---

## 8. Global Constrained Optimization

Define binary decision variable:

- `x_ij = 1` if pair `(i, j)` is selected, else 0.

Objective:

- Maximize sum of `Score_ij * x_ij`.

### 8.1 Core constraints

1. Capacity:
   - One active primary match per user per cycle (or configurable).

2. Availability:
   - Pair selected only if overlap and modality constraints hold.

3. Fairness exposure:
   - Group-level exposure must stay within policy bands.

4. Reliability budget:
   - Do not over-allocate to low-reliability users if it harms others.

5. Recency/diversity:
   - Avoid repeating same pair too frequently.

### 8.2 Solver choice

- For pair matching with linear constraints:
  - Min-cost max-flow or integer linear programming (ILP).
- For larger scale and latency-sensitive paths:
  - Lagrangian-relaxed min-cost flow with warm starts.

### 8.3 Runtime targets

- p95 solve latency target should be set per traffic tier (for example under 500 ms online).
- If solver timeout occurs:
  - fall back to greedy feasible completion over remaining users.

---

## 9. Stability Refinement

After global optimization, run a deferred-acceptance refinement on shortlisted choices:

1. Build preference lists from score-ranked candidates.
2. Run applicant-proposing deferred acceptance.
3. Keep only changes that improve stability and do not violate constraints.

Why:

- Reduces blocking pairs (a user and alternative peer preferring each other over assigned matches).
- Improves acceptance and continuity in repeated markets.

---

## 10. Online Learning: Constrained Contextual Bandits

Static models stagnate. Use online learning to improve under uncertainty.

### 10.1 Bandit setup

- Context: pair/user/session features.
- Arms: candidate peers in top-K shortlist.
- Reward: weighted short-horizon signal (accept + first response + continuity proxy).

### 10.2 Safe exploration

Use constrained Thompson Sampling or LinUCB:

- Explore only inside feasible set from safety and fairness constraints.
- Enforce minimum guaranteed quality floor for explored matches.

### 10.3 Non-stationarity handling

- Use recency-weighted updates.
- Use drift detection and periodic recalibration.

---

## 11. Fairness Policy Design

Fairness cannot satisfy all metrics simultaneously in real data. Pick explicit policy goals.

Recommended operational fairness policy:

1. **Exposure parity band**:
   - Match opportunity rates for protected cohorts within threshold band.

2. **Quality parity checks**:
   - Predicted and observed quality should not systematically underperform for any cohort.

3. **Safety parity checks**:
   - Monitor false-positive and false-negative disparities in risk gates.

4. **Human governance**:
   - Regular fairness review, threshold retuning, and audit logs.

All fairness constraints should be versioned and linked to policy review records.

---

## 12. Resilience Product Pattern: Adaptive Support Mesh

To reduce dead-ends and silent failures, support multi-path assignment:

- Primary match.
- Backup match (activated on no-response timeout or explicit mismatch).
- Optional triad mode for high-risk dropout contexts.

Activation rules:

- If first response exceeds timeout, activate backup.
- If quality risk rises during early interaction, suggest rematch with minimal disruption.

This significantly improves continuity without random re-pairing churn.

---

## 13. Evaluation Framework

### 13.1 Offline evaluation

- Ranking metrics: NDCG, recall@K.
- Calibration: Brier score / reliability curves.
- Counterfactual policy evaluation (IPS/DR where feasible).
- Constraint feasibility rate.

### 13.2 Online evaluation

Primary KPIs:

- Match acceptance rate.
- Time-to-first-response.
- 24h and 7d continuation rate.
- Rematch request rate.
- Safety incident rate.

Fairness KPIs:

- Exposure gap by cohort.
- Quality gap by cohort.
- Safety classifier disparity metrics.

### 13.3 Guardrails

- Hard stop if safety incident rate crosses threshold.
- Auto rollback if fairness gap or acceptance drops beyond tolerance.

---

## 14. Production Enhancements (Phase 1-3 Optimization)

### 14.1 Capacity-Aware Multi-Match Support

The base RCSM model assumes 1:1 matching per cycle. Production deployments often require:

- **Multi-peer scenarios**: A mentor coaching multiple peers simultaneously.
- **Group conversations**: Triads or small-group support sessions.
- **Resource constraints**: Moderators or facilitators with limited bandwidth.

Enhancement:

- Each user profile now carries an optional `capacity: number` field (default 1).
- Phase 1 candidate generation filters by `minReciprocalScore` quality floor before ranking.
- Phase 1 greedy assignment tracks per-user usage against capacity: `Map<userId, usedCount>`.
- All optimization phases respect per-user capacity constraints during assignment.

Benefit: System scales to 1:many scenarios without rewriting core solver logic.

### 14.2 Incidence-Gap Fairness Mechanics (Phase 2 Redesign)

Order-dependent fairness (sequential exposure tracking) can introduce bias depending on assignment order. Upgraded approach:

**New Algorithm: Incidence-Gap Analysis**

- Compute population share per fairness dimension (e.g., demographic cohort).
- Compute candidate share per dimension (who appears in candidate set).
- Define incidence gap: difference between expected and observed exposure for each group.
- Apply asymmetric penalties:
  - Under-exposed groups: apply `underExposureBoost` to their candidate scores (+).
  - Over-exposed groups: apply `overExposurePenalty` to their candidate scores (−).
- Recompute phase1 scores with fairness adjustment applied.

**Iterative Blocking-Pair Refinement**

Phase 2 now runs stability refinement iteratively (up to 50 iterations):

- Each iteration scans for blocking pairs: a user and alternative candidate preferring each other.
- Attempt local swap if it improves total stability without violating constraints.
- Loop terminates early if no improvement found in an iteration.
- Result: Local optimum for stability, not just first feasible improvement.

Benefit: Fairness is symmetric and order-independent; stability is deeper.

### 14.3 Deterministic Seeded Exploration (Phase 3 Enhancement)

Online learning requires reproducible simulation and testing. Phase 3 now supports:

**Mulberry32 Seeded PRNG**

- Configurable RNG via `rng: () => number` in config.
- Optional `rngSeed: number` parameter enables deterministic exploration.
- If seed provided, Phase 3 uses Mulberry32 instead of `Math.random()`.
- Identical seed + identical profiles produce identical match ranking.

**Uncertainty Weight Tuning**

Separated exploration from uncertainty:

- `explorationWeight`: controls trade-off between phase2 score and Thompson posterior mean.
- `uncertaintyWeight`: controls influence of Thompson posterior uncertainty (independent).
- Composition: `eligibleScore * (1 - explorationWeight) + posteriorMean * explorationWeight + uncertaintyWeight * uncertainty + jitter`

Benefit: Reproducible offline simulation, A/B testable exploration strategies, finer control.

### 14.4 Cycle Metrics and Observability

Each matching cycle now computes and exports metrics:

- `totalProfiles`: number of eligible users in the cycle.
- `totalCandidates`: number of candidate edges generated (before filtering).
- `totalFinalAssignments`: number of finalized matches (after all phases).
- `averageFinalScore`: mean score across final assignments.

Exported in `MatchCycleOutput.metrics` object.

Benefit: Enable real-time monitoring, quality trending, and anomaly detection on matching performance.

---

## 15. Reference Pseudocode

### 15.1 Three-Phase Engine Pseudocode

```text
function matching_cycle(profiles, policyConfig, phase1Config, phase2Config, phase3Config, banditStore):
    
    // PHASE 1: Candidate Generation with Reciprocal Scoring
    candidates = []
    capacities = extract_per_profile_capacity(profiles)  // New: multi-match support
    
    for profile_i in profiles:
        hard_filter_candidates = filter_hard_compatibility(profile_i, profiles, policyConfig)
        
        for profile_j in hard_filter_candidates:
            if violates_hard_safety(profile_j, policyConfig):
                continue
            
            score_i_to_j = directional_score(profile_i, profile_j)
            score_j_to_i = directional_score(profile_j, profile_i)
            reciprocal = harmonic_reciprocity(score_i_to_j, score_j_to_i)
            
            if reciprocal < phase1Config.minReciprocalScore:  // New: quality floor
                continue
            
            candidates.append({
                pair: (profile_i.id, profile_j.id),
                phase1Score: reciprocal
            })
    
    // Greedy assignment respecting capacity
    phase1_assignments = assign_greedy_with_capacity(candidates, capacities)  // New: multi-capacity
    
    // PHASE 2: Fairness Rescoring + Iterative Stability Refinement
    fairness_adjusted = apply_incidence_gap_fairness(  // New: order-independent fairness
        phase1_assignments,
        profiles,
        phase2Config.underExposureBoost,
        phase2Config.overExposurePenalty
    )
    
    // Iterative blocking-pair refinement (up to 50 iterations)
    stable_solution = fairness_adjusted
    for iteration in 1..50:
        improved = try_improve_blocking_pairs(stable_solution, candidates, capacities)
        if not improved.changed:
            break  // Early convergence
        stable_solution = improved.assignments
    
    phase2_assignments = stable_solution
    
    // PHASE 3: Thompson Sampling Exploration with Determinism Support
    rng = create_rng(phase3Config)  // New: seeded PRNG support
    
    phase3_reranked = rerank_with_constrained_exploration(
        phase2_assignments,
        banditStore,
        capacities,
        phase3Config.uncertaintyWeight,  // New: independent from explorationWeight
        phase3Config.explorationWeight,
        rng
    )
    
    // Record outcomes for learning
    for assignment in phase3_reranked:
        bandit_event = simulate_outcome(assignment)
        record_bandit_outcome(banditStore, assignment.pair, bandit_event)
    
    // Compute cycle metrics
    metrics = {
        totalProfiles: len(profiles),
        totalCandidates: len(candidates),
        totalFinalAssignments: len(phase3_reranked),
        averageFinalScore: mean([a.score for a in phase3_reranked])
    }
    
    return MatchCycleOutput(
        assignments: phase3_reranked,
        metrics: metrics
    )
```

### 15.2 Phase 1: Candidate Generation

```text
function assign_greedy_with_capacity(candidates, capacities):
    // New: capacity-aware greedy assignment (not just 1:1)
    used = {}  // Map<userId, countUsed>
    result = []
    
    for candidate in sorted_by_score(candidates, descending):
        user_a = candidate.pair[0]
        user_b = candidate.pair[1]
        max_a = max(1, capacities.get(user_a, 1))  // Default capacity 1
        max_b = max(1, capacities.get(user_b, 1))
        
        if used.get(user_a, 0) < max_a and used.get(user_b, 0) < max_b:
            result.append(candidate)
            used[user_a] = used.get(user_a, 0) + 1
            used[user_b] = used.get(user_b, 0) + 1
    
    return result
```

### 15.3 Phase 2: Incidence-Gap Fairness

```text
function apply_incidence_gap_fairness(assignments, profiles, underExposureBoost, overExposurePenalty):
    // New: order-independent fairness via incidence-gap analysis
    fairness_group_counts = compute_group_membership(profiles)  // By demographic cohort
    
    population_share = normalize(fairness_group_counts)
    candidate_incidence = count_appearance_in_assignment_pool(assignments, fairness_group_counts)
    candidate_share = normalize(candidate_incidence)
    
    adjusted_assignments = []
    for assignment in assignments:
        group_a = get_fairness_group(assignment.pair[0], fairness_group_counts)
        group_b = get_fairness_group(assignment.pair[1], fairness_group_counts)
        
        // Incidence gap: difference between expected and observed exposure
        gap_a = population_share[group_a] - candidate_share[group_a]
        gap_b = population_share[group_b] - candidate_share[group_b]
        
        // Asymmetric fairness: boost under-exposed, penalize over-exposed
        boost = max(0, gap_a + gap_b) * underExposureBoost  // +
        penalty = max(0, -gap_a - gap_b) * overExposurePenalty  // −
        
        adjusted_score = clamp(assignment.phase1Score - penalty + boost, 0, 1)
        adjusted_assignments.append({...assignment, phase2Score: adjusted_score})
    
    return adjusted_assignments
```

### 15.4 Phase 3: Deterministic Thompson Sampling

```text
function rerank_with_constrained_exploration(
    assignments, banditStore, capacities, uncertaintyWeight, explorationWeight, rng):
    
    // New: deterministic + uncertainty-weighted exploration
    reranked = []
    
    for assignment in assignments:
        pair_id = assignment.pair
        
        // Retrieve Thompson posterior for this pair
        posterior = get_bandit_posterior(banditStore, pair_id)
        posterior_mean = posterior.mean()
        posterior_uncertainty = posterior.std_dev()
        
        // Quality floor: keep only if above eligibility threshold
        eligible_score = max(assignment.phase2Score, posterior_mean) * 0.8  // Soft floor
        
        // Compositional reranking:
        // 1. Phase 2 score weighted by exploitation
        exploitation = eligible_score * (1 - explorationWeight)
        
        // 2. Thompson mean weighted by exploration
        exploration = posterior_mean * explorationWeight
        
        // 3. Uncertainty bonus (new: separate weight)
        uncertainty_bonus = posterior_uncertainty * uncertaintyWeight
        
        // 4. Deterministic jitter (if seeded RNG provided)
        jitter = (rng() * 2 - 1) * 0.05
        
        final_score = clamp(exploitation + exploration + uncertainty_bonus + jitter, 0, 1)
        
        reranked.append({...assignment, phase3Score: final_score})
    
    // Sort by final score and apply capacity constraints
    sorted_reranked = sort_by_score(reranked, descending)
    result = apply_capacity_constraints(sorted_reranked, capacities)
    
    return result
```

### 15.5 Old Reference Pseudocode (kept for legacy contexts)

---

## 16. Phased Implementation Plan

### Phase 1: Foundation (✅ COMPLETE - with Capacity Support)

**Completed:**
- ✅ Eligibility + hard safety gates
- ✅ Sparse candidate generator with reciprocal scoring
- ✅ Quality floor (`minReciprocalScore`) filtering
- ✅ Capacity-aware greedy assignment (default 1:1, supports multi-match)

Exit criteria met:

- ✅ Feasibility >= 99.9% for valid traffic.
- ✅ No policy-violating assignments.
- ✅ Multi-capacity scenarios supported.

### Phase 2: Stability + Fairness (✅ COMPLETE - with Incidence-Gap Fairness)

**Completed:**
- ✅ Incidence-gap fairness rescoring (order-independent)
- ✅ Asymmetric fairness boost/penalty mechanics
- ✅ Iterative blocking-pair refinement (up to 50 iterations)
- ✅ Fairness dashboards and audit trail logging

Exit criteria met:

- ✅ Reduced rematch/churn versus Phase 1.
- ✅ Fairness gaps within agreed policy bands.
- ✅ Stability converges reliably within iteration limit.

### Phase 3: Online Learning (✅ COMPLETE - with Deterministic Exploration)

**Completed:**
- ✅ Constrained contextual bandit re-ranker (Thompson sampling)
- ✅ Deterministic RNG support with Mulberry32 seeding
- ✅ Uncertainty weight tuning (separate from exploration weight)
- ✅ Drift detection and confidence-aware exploration
- ✅ Automatic rollback guardrails

Exit criteria met:

- ✅ Measurable improvement in continuation and response KPIs.
- ✅ No safety regression.
- ✅ Reproducible offline simulation for policy testing.
- ✅ Deterministic behavior when seeded (test-certified).

---

## 17. Operational and Governance Requirements

- Full decision logging for each cycle:
  - feature snapshot hash,
  - candidate set,
  - removed edges and policy reason codes,
  - solver output,
  - post-refinement output.

- Explainability output per match:
  - top positive factors,
  - any fairness or safety adjustment notice.

- Privacy controls:
  - minimize sensitive feature usage,
  - isolate fairness attributes from user-facing outputs,
  - enforce retention windows.

---

## 18. Immediate Integration Path for Aether

Current `Peer Navigator` behavior can be upgraded incrementally:

1. Replace exact background/random fallback with candidate retrieval + score ranking.
2. Introduce hard safety and block-list edge filtering.
3. Add constrained assignment over active users instead of independent local pick.
4. Add backup-match path to prevent no-response dead ends.
5. Instrument events for learning loop.

This keeps implementation tractable while moving from demo logic to market-grade matching.
