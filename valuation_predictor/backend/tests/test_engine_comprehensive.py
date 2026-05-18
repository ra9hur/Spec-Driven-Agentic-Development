import pytest
import time
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


# AC-03: Base Valuation Branch Allocation (REQ-18)
class TestBaseValuationBranchAllocation:
    def test_idea_stage_produces_1_5m_base(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Idea"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 85},
            step3MarketIndustry={"competitiveIntensity": "Low"},
            step4Team={"founderBackground": "Mixed", "priorExitsOrRelevantExperience": True},
            step5FinancialRisk={"runwayMonths": 12}
        ))
        assert result["valuation"]["base"] >= 1500000.0

    def test_mvp_stage_produces_2_5m_base(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "MVP/Prototype Built"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 85},
            step3MarketIndustry={"competitiveIntensity": "Low"},
            step4Team={"founderBackground": "Mixed", "priorExitsOrRelevantExperience": True},
            step5FinancialRisk={"runwayMonths": 12}
        ))
        assert result["valuation"]["base"] >= 2500000.0

    def test_early_traction_stage_produces_4m_base(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 85},
            step3MarketIndustry={"competitiveIntensity": "Low"},
            step4Team={"founderBackground": "Mixed", "priorExitsOrRelevantExperience": True},
            step5FinancialRisk={"runwayMonths": 12}
        ))
        assert result["valuation"]["base"] >= 4000000.0


# AC-04: Team Modifier Logic (REQ-19)
class TestPillarModifierTeamLogic:
    def test_mixed_background_produces_1_2(self):
        result = calculate_valuation(make_payload(
            step4Team={"founderBackground": "Mixed", "priorExitsOrRelevantExperience": False}
        ))
        assert result["subPillars"]["teamScore"] == 1.2

    def test_technical_only_produces_1_0(self):
        result = calculate_valuation(make_payload(
            step4Team={"founderBackground": "Technical Only", "priorExitsOrRelevantExperience": False}
        ))
        assert result["subPillars"]["teamScore"] == 1.0

    def test_business_only_produces_1_0(self):
        result = calculate_valuation(make_payload(
            step4Team={"founderBackground": "Business Only", "priorExitsOrRelevantExperience": False}
        ))
        assert result["subPillars"]["teamScore"] == 1.0

    def test_prior_exits_adds_0_3(self):
        result = calculate_valuation(make_payload(
            step4Team={"founderBackground": "Technical Only", "priorExitsOrRelevantExperience": True}
        ))
        assert result["subPillars"]["teamScore"] == 1.3

    def test_mixed_with_prior_exits_caps_at_1_5(self):
        result = calculate_valuation(make_payload(
            step4Team={"founderBackground": "Mixed", "priorExitsOrRelevantExperience": True}
        ))
        assert result["subPillars"]["teamScore"] == 1.5

    def test_team_strength_in_profile_analysis(self):
        result = calculate_valuation(make_payload(
            step4Team={"founderBackground": "Mixed", "priorExitsOrRelevantExperience": True}
        ))
        assert any("Strong balanced founding" in s for s in result["profileAnalysis"]["strengths"])


# AC-05: Traction Modifier Logic (REQ-20)
class TestPillarModifierTractionLogic:
    def test_early_traction_with_revenue_produces_1_3(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 0}
        ))
        assert result["subPillars"]["tractionScore"] == 1.3

    def test_early_traction_without_revenue_produces_0_5(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 0, "retentionRatePct": 0}
        ))
        assert result["subPillars"]["tractionScore"] == 0.5

    def test_mvp_stage_produces_1_0(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "MVP/Prototype Built"},
            step2TractionPerformance={"monthlyRevenueUSD": 0, "retentionRatePct": 0}
        ))
        assert result["subPillars"]["tractionScore"] == 1.0

    def test_idea_stage_produces_0_5(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Idea"},
            step2TractionPerformance={"monthlyRevenueUSD": 0, "retentionRatePct": 0}
        ))
        assert result["subPillars"]["tractionScore"] == 0.5

    def test_retention_above_80_adds_0_15(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 81}
        ))
        assert result["subPillars"]["tractionScore"] == 1.45

    def test_retention_at_80_does_not_add_bonus(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 80}
        ))
        assert result["subPillars"]["tractionScore"] == 1.3

    def test_retention_bonus_caps_at_1_5(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 95}
        ))
        assert result["subPillars"]["tractionScore"] == 1.45

    def test_retention_strength_in_profile_analysis(self):
        result = calculate_valuation(make_payload(
            step1BasicInfo={"startupStage": "Early Traction"},
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 85}
        ))
        assert any("retention" in s.lower() for s in result["profileAnalysis"]["strengths"])


# AC-06: Risk & Solo Penalty (REQ-21)
class TestPillarModifierRiskSoloPenalties:
    def test_runway_12_plus_produces_1_2(self):
        result = calculate_valuation(make_payload(step5FinancialRisk={"runwayMonths": 12}))
        assert result["subPillars"]["riskScore"] == 1.2

    def test_runway_4_to_11_produces_1_0(self):
        result = calculate_valuation(make_payload(step5FinancialRisk={"runwayMonths": 6}))
        assert result["subPillars"]["riskScore"] == 1.0

    def test_runway_3_or_less_produces_0_5(self):
        result = calculate_valuation(make_payload(step5FinancialRisk={"runwayMonths": 3}))
        assert result["subPillars"]["riskScore"] == 0.5

    def test_runway_0_produces_0_5(self):
        result = calculate_valuation(make_payload(step5FinancialRisk={"runwayMonths": 0}))
        assert result["subPillars"]["riskScore"] == 0.5

    def test_solo_founder_caps_risk_at_0_5(self):
        result = calculate_valuation(make_payload(
            step4Team={"numberOfFounders": 1},
            step5FinancialRisk={"runwayMonths": 24}
        ))
        assert result["subPillars"]["riskScore"] == 0.5

    def test_multi_founder_does_not_penalize(self):
        result = calculate_valuation(make_payload(
            step4Team={"numberOfFounders": 3},
            step5FinancialRisk={"runwayMonths": 24}
        ))
        assert result["subPillars"]["riskScore"] == 1.2

    def test_solo_founder_weakness_in_profile(self):
        result = calculate_valuation(make_payload(step4Team={"numberOfFounders": 1}))
        assert any("Solo-founder" in w for w in result["profileAnalysis"]["weaknesses"])

    def test_short_runway_weakness_in_profile(self):
        result = calculate_valuation(make_payload(step5FinancialRisk={"runwayMonths": 2}))
        assert any("runway" in w.lower() for w in result["profileAnalysis"]["weaknesses"])


# AC-07: Bounds Guardrails (REQ-22)
class TestMathematicalBoundsGuardrails:
    def test_worst_case_respects_floor(self):
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
        assert result["valuation"]["base"] >= 500000.0

    def test_best_case_respects_ceiling(self):
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


# AC-08: Range Division (REQ-23)
class TestOutputTargetRangeDivision:
    def test_low_equals_base_times_0_80(self):
        result = calculate_valuation(make_payload())
        expected = round(result["valuation"]["base"] * 0.80, 2)
        assert result["valuation"]["low"] == expected

    def test_high_equals_base_times_1_20(self):
        result = calculate_valuation(make_payload())
        expected = round(result["valuation"]["base"] * 1.20, 2)
        assert result["valuation"]["high"] == expected

    def test_range_division_holds_across_stages(self):
        for stage in ["Idea", "MVP/Prototype Built", "Early Traction"]:
            result = calculate_valuation(make_payload(step1BasicInfo={"startupStage": stage}))
            base = result["valuation"]["base"]
            assert result["valuation"]["low"] == round(base * 0.80, 2)
            assert result["valuation"]["high"] == round(base * 1.20, 2)


# AC-09: Deterministic Confidence Computation (REQ-24)
class TestDeterministicConfidenceComputation:
    def test_empty_data_returns_70(self):
        result = calculate_valuation(make_payload())
        assert result["valuation"]["confidencePct"] == 70

    def test_monthly_revenue_adds_5(self):
        result = calculate_valuation(make_payload(
            step2TractionPerformance={"monthlyRevenueUSD": 1000}
        ))
        assert result["valuation"]["confidencePct"] == 75

    def test_retention_adds_5(self):
        result = calculate_valuation(make_payload(
            step2TractionPerformance={"retentionRatePct": 50}
        ))
        assert result["valuation"]["confidencePct"] == 75

    def test_tam_adds_5(self):
        result = calculate_valuation(make_payload(
            step3MarketIndustry={"estimatedMarketSizeTAM": 1000000}
        ))
        assert result["valuation"]["confidencePct"] == 75

    def test_all_three_fields_add_15(self):
        result = calculate_valuation(make_payload(
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 50},
            step3MarketIndustry={"estimatedMarketSizeTAM": 1000000}
        ))
        assert result["valuation"]["confidencePct"] == 85

    def test_confidence_caps_at_95(self):
        result = calculate_valuation(make_payload(
            step2TractionPerformance={"monthlyRevenueUSD": 1000, "retentionRatePct": 50},
            step3MarketIndustry={"estimatedMarketSizeTAM": 1000000}
        ))
        assert result["valuation"]["confidencePct"] <= 95

    def test_confidence_never_exceeds_95(self):
        result = calculate_valuation(make_payload(
            step2TractionPerformance={"monthlyRevenueUSD": 100000, "retentionRatePct": 95},
            step3MarketIndustry={"estimatedMarketSizeTAM": 1000000000}
        ))
        assert result["valuation"]["confidencePct"] <= 95


# AC-10: Backend Performance (NFR-05)
class TestBackendPerformance:
    def test_engine_completes_under_50ms(self):
        payload = make_payload()
        start = time.perf_counter()
        for _ in range(100):
            calculate_valuation(payload)
        elapsed_ms = (time.perf_counter() - start) * 10
        assert elapsed_ms < 50.0

    def test_engine_completes_under_50ms_with_complex_input(self):
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
        start = time.perf_counter()
        for _ in range(100):
            calculate_valuation(payload)
        elapsed_ms = (time.perf_counter() - start) * 10
        assert elapsed_ms < 50.0


# AC-11: Modularity (NFR-06)
class TestModularity:
    def test_engine_has_no_fastapi_imports(self):
        import src.engine as engine_module
        source = open(engine_module.__file__).read()
        assert "FastAPI" not in source
        assert "fastapi" not in source

    def test_schemas_has_no_engine_imports(self):
        import src.schemas as schemas_module
        source = open(schemas_module.__file__).read()
        assert "engine" not in source
        assert "calculate_valuation" not in source

    def test_engine_imports_only_schemas(self):
        import src.engine as engine_module
        source = open(engine_module.__file__).read()
        assert "from src.schemas" in source or "import schemas" in source

    def test_main_imports_both_schemas_and_engine(self):
        import src.main as main_module
        source = open(main_module.__file__).read()
        assert "schemas" in source
        assert "engine" in source

    def test_engine_has_no_io_operations(self):
        import src.engine as engine_module
        source = open(engine_module.__file__).read()
        assert "open(" not in source
        assert "import os" not in source
        assert "import sys" not in source
