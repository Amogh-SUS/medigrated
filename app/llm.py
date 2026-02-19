from groq import Groq
from app.config import GROQ_API_KEY
from app.database import (
    SessionLocal,
    Conversation,
    ConversationSummary,
    save_summary,
)
from app.rag import MedicalRAG
import json

client = Groq(api_key=GROQ_API_KEY)


# ---------------------------
# Conversation Summarization
# ---------------------------

def summarize_conversation(messages):
    """
    Summarize only user messages to avoid token explosion.
    """

    cleaned_messages = [
        msg.message for msg in messages if msg.role == "user"
    ]

    cleaned_messages = cleaned_messages[-20:]  # Hard cap

    combined_text = "\n".join(cleaned_messages)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": """
Summarize patient medical history focusing only on:
- Symptoms
- Duration
- Severity
- Previous medical advice

Keep under 250 words.
                    """
                },
                {
                    "role": "user",
                    "content": combined_text
                }
            ],
            temperature=0.2,
            max_tokens=250,
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Summarization failed:", e)
        return ""


def get_summary(session_id: str) -> str:
    db = SessionLocal()
    summary_entry = (
        db.query(ConversationSummary)
        .filter_by(session_id=session_id)
        .first()
    )
    db.close()

    return summary_entry.summary[:1000] if summary_entry else ""


# ---------------------------
# Main Medical Response
# ---------------------------

def get_medical_response(
    user_message: str,
    session_id: str,
    rag: MedicalRAG,
    model: str = "llama-3.3-70b-versatile"
) -> dict:

    db = SessionLocal()

    previous_messages = (
        db.query(Conversation)
        .filter(Conversation.session_id == session_id)
        .order_by(Conversation.timestamp)
        .all()
    )

    # ---------------------------
    # Smart Conversation Memory
    # ---------------------------

    if len(previous_messages) > 12:
        summary_text = summarize_conversation(previous_messages[:-6])
        if summary_text:
            save_summary(session_id, summary_text)

        recent_messages = previous_messages[-6:]
    else:
        recent_messages = previous_messages

    chat_history = [
        {"role": msg.role, "content": msg.message}
        for msg in recent_messages
    ]

    summary = get_summary(session_id)

    # ---------------------------
    # RAG Retrieval
    # ---------------------------

    retrieved_docs = rag.retrieve(user_message, top_k=3)

    formatted_context = ""
    for i, doc in enumerate(retrieved_docs):
        formatted_context += f"\n[Medical Evidence {i+1}]\n{doc}\n"

    print("Retrieved Context:\n", formatted_context)

    # ---------------------------
    # System Prompt
    # ---------------------------

    system_prompt = f"""
You are an advanced medical knowledge assistant.

PATIENT HISTORY SUMMARY:
{summary}

--------------------------
RETRIEVED MEDICAL EVIDENCE
--------------------------
{formatted_context}
--------------------------

Guidelines:
- If symptoms are unclear, ask clarifying questions.
- Do NOT repeat previously answered questions.
- Write like an experienced clinician.
- Avoid repetitive phrasing.
- Use natural paragraph spacing.
- Be calm, precise, and reassuring.
- Prioritize retrieved medical evidence.
For each possible condition:
- The "reason" field must explain:
  • Which symptoms support it
  • Why it is likely
  • Why more serious conditions are less likely (if relevant)
- Use many full sentences.
- Avoid vague phrases like "reported symptoms".


Return ONLY valid JSON in this structure.

If the user is:
- Just greeting
- Saying they are fine
- Saying random words (e.g. "wow")
- Or no active symptoms

Then:
- severity_level = "low"
- possible_conditions = []
- recommended_specialists = []
- follow_up_questions = []
- Give short normal conversational reassurance.
- Do NOT invent medical conditions.


Return ONLY valid JSON in this structure:

{{
  "severity_level": "low | moderate | high | emergency",
  "possible_conditions": [
    {{
      "name": "condition name",
      "likelihood": "low | medium | high",
      "reason": "why this condition fits",
      "recommended_action": "what to do",
      "possible_medications": ["generic names only"]
    }}
  ],
  "precautions": [],
  "next_steps": [],
  "recommended_specialists": [],
  "red_flags": [],
  "follow_up_questions": [],
  "disclaimer": "Educational only. Not medical advice."
}}

Rules:
- Rank most likely condition first.
- Set severity_level = "emergency" if urgent.
- Ensure JSON is syntactically valid.
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})

    # ---------------------------
    # Call Main Model
    # ---------------------------

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=1200,  # Reduced slightly for safety
        )

        content = response.choices[0].message.content

    except Exception as e:
        print("LLM Error:", e)
        db.close()
        return {"error": "Model request failed."}

    # ---------------------------
    # Parse JSON Safely
    # ---------------------------

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        parsed = {
            "error": "Model returned invalid JSON",
            "raw_response": content
        }

    # ---------------------------
    # Store Conversation Safely
    # ---------------------------

    db.add(Conversation(
        session_id=session_id,
        role="user",
        message=user_message
    ))

    db.add(Conversation(
    session_id=session_id,
    role="assistant",
    message=json.dumps(parsed)
        ))


    db.commit()
    db.close()

    return parsed
