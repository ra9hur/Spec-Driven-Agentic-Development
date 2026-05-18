import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

from src.schemas import ValuationRequest, ValuationResponse
from src.engine import calculate_valuation

logger = logging.getLogger("preseediq.ollama")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[Ollama] %(message)s"))
    logger.addHandler(handler)

app = FastAPI(title="PreSeedIQ Core Valuation Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


@app.post("/api/v1/calculate", response_model=ValuationResponse)
async def calculate(payload: ValuationRequest):
    try:
        result = calculate_valuation(payload)

        ai_recommendation = (
            "Fundraising Readiness: Your current stage and metrics suggest a pre-seed "
            "or seed round focus. Strengthen your narrative around customer validation "
            "and market opportunity before approaching investors.\n\n"
            "Valuation Expectations: Based on your inputs, the calculated range reflects "
            "a typical early-stage bracket. Use the BASE figure as your anchor and the "
            "HIGH/LOW bounds for negotiation flexibility.\n\n"
            "Recommended Actions: Prioritize extending runway, diversifying your founding "
            "team's skill set, and securing early revenue commitments to improve your "
            "valuation profile in the next 6–12 months.\n\n"
            "Critical Concerns/Opportunities: Key risk factors identified include your "
            "current cash position and market dynamics. Address these proactively in "
            "investor discussions to build credibility."
        )

        prompt_payload = {
            "model": OLLAMA_MODEL,
            "messages": [{
                "role": "user",
                "content": (
                    f"Analyze company '{payload.step1BasicInfo.companyName}' "
                    f"at stage '{payload.step1BasicInfo.startupStage}'. "
                    f"Low Valuation: ${result['valuation']['low']}, "
                    f"Base: ${result['valuation']['base']}, "
                    f"High: ${result['valuation']['high']}. "
                    f"Strengths: {result['profileAnalysis']['strengths']}. "
                    f"Weaknesses: {result['profileAnalysis']['weaknesses']}. "
                    f"Generate an operational four-part text summary mapping to "
                    f"fundraising metrics, milestone valuations, actionable "
                    f"target rules, and sector concerns."
                )
            }]
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/v1/chat/completions",
                    json=prompt_payload,
                    timeout=30.0
                )
                if response.status_code == 200:
                    res_json = response.json()
                    ai_recommendation = res_json["choices"][0]["message"]["content"]
                    logger.info(
                        "Connected to %s — received %d characters of recommendation text.",
                        OLLAMA_MODEL,
                        len(ai_recommendation)
                    )
                else:
                    logger.warning(
                        "Ollama returned HTTP %d — using fallback recommendation.",
                        response.status_code
                    )
        except httpx.TimeoutException:
            logger.warning(
                "Request timed out after 30.0s — using fallback recommendation."
            )
        except httpx.RequestError as e:
            logger.warning(
                "Connection error (%s) — using fallback recommendation.",
                str(e)
            )
        except KeyError:
            logger.warning(
                "Malformed Ollama response — using fallback recommendation."
            )

        return ValuationResponse(
            valuation=result["valuation"],
            subPillars=result["subPillars"],
            profileAnalysis=result["profileAnalysis"],
            aiRecommendation=ai_recommendation
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Engine Error: {str(e)}")
