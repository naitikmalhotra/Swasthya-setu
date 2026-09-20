"""
ai_service.py — Swasthya Setu AI Healthcare Assistant
Uses Google Gemini API for symptom assessment and conversational triage.
GEMINI_API_KEY must be set in backend/.env file.
"""
import os
import json
import re
from typing import Optional

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
DEMO_MODE = not bool(GEMINI_API_KEY)

# ── Gemini client (lazy-initialised) ─────────────────────────────────────────
_client = None

def _get_client():
    global _client
    if _client is None and not DEMO_MODE:
        from google import genai
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

# ── System prompts ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT_EN = """You are Setu, a compassionate AI healthcare triage assistant for rural patients in India, part of the Swasthya Setu platform.

Your role:
- Help patients describe their symptoms clearly
- Ask 1-2 clarifying follow-up questions if needed
- Never diagnose — only help classify urgency and recommend appropriate care level
- Always be empathetic, use simple language suitable for low-literacy users
- Always end with a clear disclaimer

Urgency levels:
- Low: Minor symptoms, can wait for routine OPD visit
- Moderate: Should visit PHC/CHC within 24 hours
- High: Needs urgent medical attention today
- Emergency: Life-threatening — call 108 immediately

Keep responses concise (2-4 sentences max per message for voice readability).
"""

SYSTEM_PROMPT_HI = """आप सेतु हैं, एक सहानुभूतिपूर्ण AI स्वास्थ्य सहायक, जो ग्रामीण भारत के मरीज़ों की मदद करते हैं। आप Swasthya Setu प्लेटफ़ॉर्म का हिस्सा हैं।

आपकी भूमिका:
- मरीज़ को उनके लक्षण स्पष्ट रूप से बताने में मदद करें
- ज़रूरत पड़ने पर 1-2 स्पष्टीकरण वाले प्रश्न पूछें
- कभी निदान न करें — केवल गंभीरता का वर्गीकरण करें और उचित देखभाल की सिफारिश करें
- हमेशा सहानुभूतिपूर्ण रहें, सरल भाषा का उपयोग करें
- हमेशा अस्वीकरण के साथ समाप्त करें

प्रतिक्रियाएं संक्षिप्त रखें (आवाज़ के लिए अधिकतम 2-4 वाक्य)।
"""

ASSESSMENT_PROMPT_TEMPLATE = """
A rural patient in India describes their symptoms: "{symptoms}"

Based on this, provide a structured health assessment in JSON format only (no markdown, no extra text):

{{
  "symptoms": ["list", "of", "identified", "symptoms"],
  "possible_conditions": ["condition 1", "condition 2"],
  "urgency": "Low|Moderate|High|Emergency",
  "recommended_specialty": "General Physician|Gynecologist|Pediatrician|Orthopedic|Cardiologist|Neurologist|ENT|Ophthalmologist|Dermatologist",
  "recommended_centre_type": "Sub-Centre|PHC|CHC|Sub-District Hospital|District Hospital",
  "explanation": "Brief 2-3 sentence explanation in simple language",
  "next_steps": "What the patient should do right now",
  "disclaimer": "This is an AI-assisted triage tool, not a medical diagnosis. Please consult a qualified doctor for proper diagnosis and treatment."
}}

Rules:
- urgency=Emergency ONLY for: chest pain with breathing difficulty, stroke symptoms, severe bleeding, unconsciousness, severe burns, snake/dog bite with symptoms
- urgency=High for: high fever >103°F, severe abdominal pain, difficulty breathing, persistent vomiting
- urgency=Moderate for: moderate fever, persistent cough, minor injuries
- urgency=Low for: cold, minor headache, mild digestive issues
- recommended_centre_type should match urgency (Emergency→District Hospital, Low→Sub-Centre/PHC)
"""

# ── Demo mode fallback ─────────────────────────────────────────────────────────

DEMO_ASSESSMENT = {
    "symptoms": ["headache", "mild fever", "fatigue"],
    "possible_conditions": ["Viral fever", "Dehydration", "Common cold"],
    "urgency": "Moderate",
    "recommended_specialty": "General Physician",
    "recommended_centre_type": "PHC",
    "explanation": "Your symptoms suggest a viral infection. Stay hydrated and rest. Visit your nearest PHC if symptoms persist beyond 2 days or fever rises above 103°F.",
    "next_steps": "Visit your nearest Primary Health Centre today. Drink plenty of fluids. Avoid self-medication.",
    "disclaimer": "⚠️ This is an AI-assisted triage tool and NOT a medical diagnosis. Please consult a qualified doctor for proper diagnosis and treatment."
}

DEMO_CHAT_RESPONSE = "I understand your concern. Based on what you've described, I recommend visiting your nearest PHC for a proper check-up. Could you tell me how long you've been experiencing these symptoms? ⚠️ Remember: I am an AI assistant, not a doctor."


# ── Public API ─────────────────────────────────────────────────────────────────

def assess_symptoms(symptoms_text: str, language: str = "en") -> dict:
    """
    Takes a free-text symptom description and returns a structured JSON assessment.
    Falls back to demo data if GEMINI_API_KEY is not set.
    """
    if DEMO_MODE:
        print("[AI Service] Running in DEMO mode — GEMINI_API_KEY not set.")
        result = dict(DEMO_ASSESSMENT)
        result["_demo"] = True
        return result

    try:
        client = _get_client()
        lang_instruction = "Respond in Hindi (Devanagari script)." if language == "hi" else "Respond in English."
        prompt = ASSESSMENT_PROMPT_TEMPLATE.format(symptoms=symptoms_text) + f"\n\n{lang_instruction}"

        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt,
        )
        raw = response.text.strip()

        # Strip markdown code fences if present
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)

        result = json.loads(raw)
        result["_demo"] = False
        return result

    except json.JSONDecodeError:
        # If model didn't return valid JSON, return structured error
        return {**DEMO_ASSESSMENT, "_demo": False, "_error": "Could not parse AI response. Showing generic assessment."}
    except Exception as e:
        print(f"[AI Service] Gemini API error: {e}")
        return {**DEMO_ASSESSMENT, "_demo": True, "_error": str(e)}


def chat_with_assistant(messages: list[dict], language: str = "en") -> str:
    """
    Multi-turn conversation. messages = [{"role": "user"|"model", "content": "..."}]
    Returns the assistant's reply as a string.
    """
    if DEMO_MODE:
        print("[AI Service] Running in DEMO mode — GEMINI_API_KEY not set.")
        return DEMO_CHAT_RESPONSE

    try:
        client = _get_client()
        from google.genai import types as genai_types

        system_prompt = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN

        # Build contents list for the Gemini SDK
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(genai_types.Content(
                role=role,
                parts=[genai_types.Part(text=msg["content"])]
            ))

        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=300,
                temperature=0.7,
            )
        )
        return response.text.strip()

    except Exception as e:
        print(f"[AI Service] Chat error: {e}")
        return f"I'm having trouble connecting right now. Please try again in a moment. If this is an emergency, call 108 immediately."


def is_demo_mode() -> bool:
    return DEMO_MODE
