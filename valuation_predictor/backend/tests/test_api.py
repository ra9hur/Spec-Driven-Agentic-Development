import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
from src.main import app


@pytest.fixture
def valid_payload():
    return {
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


@pytest.mark.anyio
async def test_calculate_endpoint_returns_200(valid_payload):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)

    assert response.status_code == 200
    data = response.json()
    assert "valuation" in data
    assert "subPillars" in data
    assert "profileAnalysis" in data
    assert "aiRecommendation" in data


@pytest.mark.anyio
async def test_calculate_endpoint_returns_422_on_invalid():
    payload = {"step1BasicInfo": {}}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_ollama_api_transmission(valid_payload):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("src.main.httpx.AsyncClient") as mock_client_cls:
            mock_client_instance = mock_client_cls.return_value.__aenter__.return_value
            mock_ollama_response = MagicMock()
            mock_ollama_response.status_code = 200
            mock_ollama_response.json.return_value = {
                "choices": [{"message": {"content": "Test AI recommendation text"}}]
            }
            mock_client_instance.post.return_value = mock_ollama_response
            response = await client.post("/api/v1/calculate", json=valid_payload)

    assert response.status_code == 200
    data = response.json()
    assert data["aiRecommendation"] == "Test AI recommendation text"


@pytest.mark.anyio
async def test_ai_fault_tolerant_circuit_breaker(valid_payload):
    from httpx import TimeoutException
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("src.main.httpx.AsyncClient") as mock_client_cls:
            mock_client_instance = mock_client_cls.return_value.__aenter__.return_value
            mock_client_instance.post.side_effect = TimeoutException("Simulated timeout")
            response = await client.post("/api/v1/calculate", json=valid_payload)

    assert response.status_code == 200
    data = response.json()
    assert data["aiRecommendation"].startswith("Fundraising Readiness")


@pytest.mark.anyio
async def test_network_timeout_fallback_execution(valid_payload):
    from httpx import RequestError
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("src.main.httpx.AsyncClient") as mock_client_cls:
            mock_client_instance = mock_client_cls.return_value.__aenter__.return_value
            mock_client_instance.post.side_effect = RequestError("Connection refused")
            response = await client.post("/api/v1/calculate", json=valid_payload)

    assert response.status_code == 200
    data = response.json()
    assert "Fundraising Readiness" in data["aiRecommendation"]
    assert "Valuation Expectations" in data["aiRecommendation"]
    assert "Recommended Actions" in data["aiRecommendation"]
    assert "Critical Concerns" in data["aiRecommendation"]
