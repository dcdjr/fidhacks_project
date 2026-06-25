from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# TODO: Replace this temporary constant with an environment variable before deployment.
GEMINI_API_KEY = ""
GEMINI_MODEL = "gemini-2.5-flash"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1)


class AnalyzeResponse(BaseModel):
    micro_win_title: str = Field(description="A short, encouraging title for the achievement.")
    short_summary: str = Field(description="A concise one- or two-sentence summary of the achievement.")
    skills_learned: list[str] = Field(description="Two to four specific skills demonstrated or learned.")
    next_step: str = Field(description="One small, practical next step for continued growth.")


def analyze_micro_win(text: str) -> AnalyzeResponse:
    """Ask Gemini to turn a student's micro-win into structured analysis."""
    if GEMINI_API_KEY == "PASTE_YOUR_GEMINI_API_KEY_HERE":
        raise RuntimeError("Add your Gemini API key to GEMINI_API_KEY in backend/main.py.")

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"""
You are a supportive college learning coach.
Analyze the student's micro-win without inventing details.
Keep the title brief, the summary concise, the skills specific, and the next step achievable.

Student's micro-win:
{text.strip()}
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
            response_schema=AnalyzeResponse,
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    return AnalyzeResponse.model_validate_json(response.text)


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        return analyze_micro_win(request.text)
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Gemini analysis failed: {error}") from error
