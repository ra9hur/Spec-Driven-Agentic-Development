from src.schemas import ValuationRequest


def calculate_valuation(payload: ValuationRequest) -> dict:
    stage = payload.step1BasicInfo.startupStage

    if stage == "Idea":
        v_base = 1500000.0
    elif stage == "MVP/Prototype Built":
        v_base = 2500000.0
    else:
        v_base = 4000000.0

    s_team = 1.0
    if payload.step4Team.founderBackground == "Mixed":
        s_team = 1.2
    if payload.step4Team.priorExitsOrRelevantExperience:
        s_team += 0.3
    s_team = min(s_team, 1.5)

    s_traction = 0.5
    if stage == "Early Traction" and payload.step2TractionPerformance.monthlyRevenueUSD > 0:
        s_traction = 1.3
    elif stage == "MVP/Prototype Built":
        s_traction = 1.0

    if payload.step2TractionPerformance.retentionRatePct > 80.0:
        s_traction += 0.15
    s_traction = min(s_traction, 1.5)

    market_intensity = payload.step3MarketIndustry.competitiveIntensity
    if market_intensity == "Low":
        s_market = 1.2
    elif market_intensity == "Medium":
        s_market = 1.0
    else:
        s_market = 0.6

    runway = payload.step5FinancialRisk.runwayMonths
    if runway >= 12:
        s_risk = 1.2
    elif 4 <= runway <= 11:
        s_risk = 1.0
    else:
        s_risk = 0.5

    if payload.step4Team.numberOfFounders == 1:
        s_risk = min(s_risk, 0.5)

    monetization = payload.step5FinancialRisk.monetizationClarity
    if monetization == "Clear/Validated":
        s_financial = 1.2
    elif monetization == "Hypothetical":
        s_financial = 1.0
    else:
        s_financial = 0.5

    total_multiplier = (
        (s_team * 0.30) +
        (s_traction * 0.30) +
        (s_market * 0.20) +
        (s_risk * 0.20)
    )

    v_final = v_base * total_multiplier
    v_final = max(500000.0, min(v_final, 6500000.0))

    v_low = round(v_final * 0.80, 2)
    v_base_out = round(v_final, 2)
    v_high = round(v_final * 1.20, 2)

    strengths = []
    weaknesses = []

    if s_team >= 1.2:
        strengths.append("Strong balanced founding structure or exit track record verified.")
    if s_traction >= 1.15:
        strengths.append(
            f"Highly optimized user retention of {payload.step2TractionPerformance.retentionRatePct}% offsets raw scale limits."
        )
    if s_market >= 1.2:
        strengths.append("Favorable competitive landscape context identified.")

    if runway <= 3:
        weaknesses.append("Severe financial positioning vulnerability tracked with near-term runway limits.")
    if payload.step4Team.numberOfFounders == 1:
        weaknesses.append("Solo-founder reliance profiles carry execution dependencies.")
    if s_financial <= 0.6:
        weaknesses.append("Unclear validation metrics across immediate monetization channels.")

    confidence = 70
    if payload.step2TractionPerformance.monthlyRevenueUSD > 0:
        confidence += 5
    if payload.step2TractionPerformance.retentionRatePct > 0:
        confidence += 5
    if payload.step3MarketIndustry.estimatedMarketSizeTAM > 0:
        confidence += 5
    confidence = min(confidence, 95)

    return {
        "valuation": {
            "low": v_low,
            "base": v_base_out,
            "high": v_high,
            "confidencePct": confidence
        },
        "subPillars": {
            "tractionScore": round(s_traction, 2),
            "marketScore": round(s_market, 2),
            "teamScore": round(s_team, 2),
            "financialScore": round(s_financial, 2),
            "riskScore": round(s_risk, 2)
        },
        "profileAnalysis": {
            "strengths": strengths,
            "weaknesses": weaknesses
        }
    }
