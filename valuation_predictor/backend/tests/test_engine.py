import pytest
from src.schemas import ValuationRequest, Step1BasicInfo, Step2TractionPerformance, \
    Step3MarketIndustry, Step4Team, Step5FinancialRisk
from src.engine import calculate_valuation


def deep_merge(base, overrides):
    merged = {}
    for key, val in base.items():
        if key in overrides and isinstance(val, dict):
            merged[key] = {**val, **overrides[key]}
        elif key in overrides:
            merged[key] = overrides[key]
        else:
            merged[key] = val
    for key in overrides:
        if key not in merged:
            merged[key] = overrides[key]
    return merged

def make_payload(**overrides):
    defaults = {
        "step1BasicInfo": {
            "companyName": "TestCo",
            "countryCode": "US",
            "industry": "Tech",
            "businessModel": "B2B",
            "startupStage": "Idea"
        },
        "step2TractionPerformance": {
            "monthlyRevenueUSD": 0,
            "revenueGrowthRatePct": 0,
            "numberOfUsersOrCustomers": 0,
            "growthType": "",
            "growthRatePct": 0,
            "retentionRatePct": 0
        },
        "step3MarketIndustry": {
            "estimatedMarketSizeTAM": 0,
            "industryGrowthRate": "Moderate",
            "competitiveIntensity": "Medium"
        },
        "step4Team": {
            "numberOfFounders": 2,
            "founderBackground": "Mixed",
            "priorExitsOrRelevantExperience": False
        },
        "step5FinancialRisk": {
            "burnRateUSDPerMonth": 0,
            "runwayMonths": 12,
            "monetizationClarity": "Hypothetical",
            "regulatoryOrExecutionRisk": "Low"
        }
    }
    data = deep_merge(defaults, overrides)
    return ValuationRequest(
        step1BasicInfo=Step1BasicInfo(**data["step1BasicInfo"]),
        step2TractionPerformance=Step2TractionPerformance(**data["step2TractionPerformance"]),
        step3MarketIndustry=Step3MarketIndustry(**data["step3MarketIndustry"]),
        step4Team=Step4Team(**data["step4Team"]),
        step5FinancialRisk=Step5FinancialRisk(**data["step5FinancialRisk"]),
    )


class TestBaseValuation:
    def test_idea_stage_base(self):
        result = calculate_valuation(make_payload(step1BasicInfo={"startupStage": "Idea"}))
        assert result["valuation"]["base"] >= 500000

    def test_mvp_stage_base(self):
        result = calculate_valuation(make_payload(step1BasicInfo={"startupStage": "MVP/Prototype Built"}))
        assert result["valuation"]["base"] >= 500000

    def test_early_traction_stage_base(self):
        result = calculate_valuation(make_payload(step1BasicInfo={"startupStage": "Early Traction"}))
        assert result["valuation"]["base"] >= 500000


class TestBoundaries:
    def test_floor_clamp(self):
        payload = make_payload(
            step1BasicInfo={"startupStage": "Idea"},
            step2TractionPerformance={
                "monthlyRevenueUSD": 0, "revenueGrowthRatePct": 0,
                "numberOfUsersOrCustomers": 0, "growthType": "",
                "growthRatePct": 0, "retentionRatePct": 0
            },
            step3MarketIndustry={
                "estimatedMarketSizeTAM": 0, "industryGrowthRate": "Low",
                "competitiveIntensity": "High"
            },
            step4Team={
                "numberOfFounders": 1, "founderBackground": "Technical Only",
                "priorExitsOrRelevantExperience": False
            },
            step5FinancialRisk={
                "burnRateUSDPerMonth": 0, "runwayMonths": 1,
                "monetizationClarity": "Unclear", "regulatoryOrExecutionRisk": "High"
            }
        )
        result = calculate_valuation(payload)
        assert result["valuation"]["base"] > 500000.0
        assert 1000000.0 <= result["valuation"]["base"] <= 1010000.0

    def test_ceiling_clamp(self):
        payload = make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={
                "monthlyRevenueUSD": 100000, "revenueGrowthRatePct": 50,
                "numberOfUsersOrCustomers": 10000, "growthType": "MoM",
                "growthRatePct": 20, "retentionRatePct": 95
            },
            step3MarketIndustry={
                "estimatedMarketSizeTAM": 1000000000, "industryGrowthRate": "High",
                "competitiveIntensity": "Low"
            },
            step4Team={
                "numberOfFounders": 3, "founderBackground": "Mixed",
                "priorExitsOrRelevantExperience": True
            },
            step5FinancialRisk={
                "burnRateUSDPerMonth": 50000, "runwayMonths": 24,
                "monetizationClarity": "Clear/Validated",
                "regulatoryOrExecutionRisk": "Low"
            }
        )
        result = calculate_valuation(payload)
        assert result["valuation"]["base"] <= 6500000.0


class TestConfidence:
    def test_base_confidence(self):
        result = calculate_valuation(make_payload())
        assert result["valuation"]["confidencePct"] == 70

    def test_max_confidence(self):
        payload = make_payload(
            step2TractionPerformance={
                "monthlyRevenueUSD": 50000, "revenueGrowthRatePct": 10,
                "numberOfUsersOrCustomers": 500, "growthType": "MoM",
                "growthRatePct": 5, "retentionRatePct": 90
            },
            step3MarketIndustry={
                "estimatedMarketSizeTAM": 10000000, "industryGrowthRate": "High",
                "competitiveIntensity": "Low"
            }
        )
        result = calculate_valuation(payload)
        assert result["valuation"]["confidencePct"] == 85
