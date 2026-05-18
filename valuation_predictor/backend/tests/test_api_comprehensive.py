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


# AC-01: API Gateway (REQ-16)
@pytest.mark.anyio
async def test_asynchronous_request_gateway(valid_payload):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)

    assert response.status_code == 200
    data = response.json()
    assert "valuation" in data
    assert "subPillars" in data
    assert "profileAnalysis" in data
    assert "aiRecommendation" in data


# AC-02: Pydantic Rejection (REQ-17)
@pytest.mark.anyio
async def test_empty_payload_returns_422():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json={})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_empty_step1_returns_422():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json={"step1BasicInfo": {}})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_negative_revenue_returns_422(valid_payload):
    valid_payload["step2TractionPerformance"]["monthlyRevenueUSD"] = -100
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_invalid_business_model_returns_422(valid_payload):
    valid_payload["step1BasicInfo"]["businessModel"] = "B2B2C"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_invalid_startup_stage_returns_422(valid_payload):
    valid_payload["step1BasicInfo"]["startupStage"] = "Pre-IPO"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_retention_over_100_returns_422(valid_payload):
    valid_payload["step2TractionPerformance"]["retentionRatePct"] = 150
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_zero_founders_returns_422(valid_payload):
    valid_payload["step4Team"]["numberOfFounders"] = 0
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_missing_step_returns_422(valid_payload):
    del valid_payload["step3MarketIndustry"]
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_empty_company_name_returns_422(valid_payload):
    valid_payload["step1BasicInfo"]["companyName"] = ""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_invalid_country_code_returns_422(valid_payload):
    valid_payload["step1BasicInfo"]["countryCode"] = "A"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_invalid_growth_rate_returns_422(valid_payload):
    valid_payload["step3MarketIndustry"]["industryGrowthRate"] = "Extreme"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)
    assert response.status_code == 422


# AC-01 + NFR-05: Response Shape Validation
@pytest.mark.anyio
async def test_response_contains_all_required_keys(valid_payload):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)

    data = response.json()
    assert "valuation" in data
    assert "low" in data["valuation"]
    assert "base" in data["valuation"]
    assert "high" in data["valuation"]
    assert "confidencePct" in data["valuation"]
    assert "subPillars" in data
    assert "tractionScore" in data["subPillars"]
    assert "marketScore" in data["subPillars"]
    assert "teamScore" in data["subPillars"]
    assert "financialScore" in data["subPillars"]
    assert "riskScore" in data["subPillars"]
    assert "profileAnalysis" in data
    assert "strengths" in data["profileAnalysis"]
    assert "weaknesses" in data["profileAnalysis"]
    assert "aiRecommendation" in data


@pytest.mark.anyio
async def test_response_values_are_numeric(valid_payload):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate", json=valid_payload)

    data = response.json()
    assert isinstance(data["valuation"]["low"], (int, float))
    assert isinstance(data["valuation"]["base"], (int, float))
    assert isinstance(data["valuation"]["high"], (int, float))
    assert isinstance(data["valuation"]["confidencePct"], int)
    assert isinstance(data["aiRecommendation"], str)


# AC-01: Ollama Circuit Breaker Tests
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


@pytest.mark.anyio
async def test_ollama_malformed_response_fallback(valid_payload):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("src.main.httpx.AsyncClient") as mock_client_cls:
            mock_client_instance = mock_client_cls.return_value.__aenter__.return_value
            mock_ollama_response = MagicMock()
            mock_ollama_response.status_code = 200
            mock_ollama_response.json.return_value = {"invalid": "structure"}
            mock_client_instance.post.return_value = mock_ollama_response
            response = await client.post("/api/v1/calculate", json=valid_payload)

    assert response.status_code == 200
    data = response.json()
    assert "Fundraising Readiness" in data["aiRecommendation"]
