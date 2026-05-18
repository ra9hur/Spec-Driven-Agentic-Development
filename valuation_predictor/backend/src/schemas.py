from pydantic import BaseModel, Field
from typing import Literal

class Step1BasicInfo(BaseModel):
    companyName: str = Field(..., min_length=1)
    countryCode: str = Field(..., min_length=2, max_length=3)
    industry: str
    businessModel: Literal["B2B", "B2C"]
    startupStage: Literal["Idea", "MVP/Prototype Built", "Early Traction"]

class Step2TractionPerformance(BaseModel):
    monthlyRevenueUSD: float = Field(..., ge=0)
    revenueGrowthRatePct: float = Field(..., ge=0)
    numberOfUsersOrCustomers: int = Field(..., ge=0)
    growthType: str
    growthRatePct: float = Field(..., ge=0)
    retentionRatePct: float = Field(..., ge=0, le=100)

class Step3MarketIndustry(BaseModel):
    estimatedMarketSizeTAM: float = Field(..., ge=0)
    industryGrowthRate: Literal["Low", "Moderate", "High"]
    competitiveIntensity: Literal["Low", "Medium", "High"]

class Step4Team(BaseModel):
    numberOfFounders: int = Field(..., ge=1)
    founderBackground: Literal["Technical Only", "Business Only", "Mixed"]
    priorExitsOrRelevantExperience: bool

class Step5FinancialRisk(BaseModel):
    burnRateUSDPerMonth: float = Field(..., ge=0)
    runwayMonths: int = Field(..., ge=0)
    monetizationClarity: Literal["Clear/Validated", "Hypothetical", "Unclear"]
    regulatoryOrExecutionRisk: Literal["Low", "Medium", "High"]

class ValuationRequest(BaseModel):
    step1BasicInfo: Step1BasicInfo
    step2TractionPerformance: Step2TractionPerformance
    step3MarketIndustry: Step3MarketIndustry
    step4Team: Step4Team
    step5FinancialRisk: Step5FinancialRisk

class ValuationRange(BaseModel):
    low: float
    base: float
    high: float
    confidencePct: int = Field(..., ge=0, le=100)

class SubPillars(BaseModel):
    tractionScore: float
    marketScore: float
    teamScore: float
    financialScore: float
    riskScore: float

class ProfileAnalysis(BaseModel):
    strengths: list[str]
    weaknesses: list[str]

class ValuationResponse(BaseModel):
    valuation: ValuationRange
    subPillars: SubPillars
    profileAnalysis: ProfileAnalysis
    aiRecommendation: str
