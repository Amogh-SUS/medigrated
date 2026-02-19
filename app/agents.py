from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
import asyncio
import json

from pymupdf import message
from app.llm import get_medical_response
from app.mcp_client import MCPClient
import os


# -------------------------
# State Definition
# -------------------------

class MedicalState(TypedDict):
    session_id: str
    message: str
    city: Optional[str]
    rag: object
    llm_output: dict
    hospital_info: Optional[dict]
    final_output: dict


# -------------------------
# Node 1: Medical Reasoning
# -------------------------

def medical_reasoning_node(state: MedicalState):
    result = get_medical_response(state["message"], state["session_id"],rag=state["rag"])
    state["llm_output"] = result
    return state


# -------------------------
# Node 2: Router
# -------------------------

def router_node(state: MedicalState):

    message = state["message"].lower()
    severity = state["llm_output"].get("severity_level")

    facility_keywords = [
        "hospital",
        "clinic",
        "medical facility",
        "where should i go",
        "which hospital",
        "recommend hospital",
        "which doctor",
        "who should i consult",
        "which clinic",
        "where can i go",
        "nearby hospital",
        "doctor"
    ]

    asking_for_facility = any(keyword in message for keyword in facility_keywords)

    # 🔥 PRIORITY 1: Explicit hospital intent
    if asking_for_facility:
        if not state.get("city"):
            return "clarification_node"
        return "hospital_node"

    # 🔥 PRIORITY 2: Emergency cases
    if severity in ["high", "emergency"]:
        if not state.get("city"):
            return "clarification_node"
        return "hospital_node"

    return "final_node"




# -------------------------
# Node 3: Clarification Node
# -------------------------
def clarification_node(state: MedicalState):

    state["final_output"] = (
    "To recommend nearby hospitals or specialists, I need to know your city. "
    "Please tell me which city you are currently in."
    )


    return state

# -------------------------
# Node 4: Hospital Tool Node
# -------------------------

async def hospital_node(state: MedicalState):

    server_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "mcp_server", "server.py")
    )

    mcp = MCPClient(server_path)
    try:
        await mcp.connect()

        specialist_list = state["llm_output"].get("recommended_specialists", [])
        specialist_type = specialist_list[0] if specialist_list else None

        tool_result = await mcp.call_tool(
            "recommend_hospital_tool",
            {
                "city": state["city"],
                "severity_level": state["llm_output"].get("severity_level"),
                "specialist_type": specialist_type
            }
        )


    finally:
        await mcp.close()

    if tool_result and tool_result.content:
        raw_text = tool_result.content[0].text.strip()

        if raw_text:
            try:
                hospital_data = json.loads(raw_text)
                state["hospital_info"] = hospital_data
            except json.JSONDecodeError:
                state["hospital_info"] = {"error": "Invalid hospital data"}
        else:
            state["hospital_info"] = {"error": "Empty hospital response"}
    else:
        state["hospital_info"] = {"error": "No hospital data returned"}


    return state


# -------------------------
# Node 5: Final Node
# -------------------------

def final_node(state: MedicalState):

    data = state["llm_output"]

    if "error" in data:
        state["final_output"] = "I'm sorry, something went wrong while processing your request."
        return state

    severity = data.get("severity_level", "low")
    conditions = data.get("possible_conditions", [])
    precautions = data.get("precautions", [])
    next_steps = data.get("next_steps", [])
    red_flags = data.get("red_flags", [])
    followups = data.get("follow_up_questions", [])

    message_parts = []

    # 🔴 Emergency tone
    if severity in ["emergency", "high"]:
        message_parts.append("⚠️ Your symptoms may require urgent medical attention.\n")

    # 🟢 Conditions
    if conditions:
        top_condition = conditions[0]
        message_parts.append(f"Based on your symptoms, one possible condition is **{top_condition['name']}**.\n")
        message_parts.append(f"{top_condition['reason']}\n")

    # 💊 What to do
    if next_steps:
        message_parts.append("\nWhat you should do:")
        for step in next_steps:
            message_parts.append(f"• {step}")

    # 🛑 Red flags
    if red_flags and severity in ["moderate", "high", "emergency"]:
        message_parts.append("\nSeek immediate care if you notice:")
        for flag in red_flags:
            message_parts.append(f"• {flag}")

    # 💊 Medications
    medications = top_condition.get("possible_medications", [])
    if medications:
        message_parts.append("\nMedications that may be considered (if appropriate):")
        for med in medications:
            message_parts.append(f"• {med}")

    # 🧾 Precautions
    if precautions:
        message_parts.append("\nGeneral precautions:")
        for p in precautions:
            message_parts.append(f"• {p}")


    # 🏥 Hospital (only if high severity)
    if severity in ["high", "emergency"] and state.get("hospital_info"):
        hospital = state["hospital_info"]
        message_parts.append("\nNearest recommended hospital:")
        message_parts.append(f"{hospital.get('name')}")
        message_parts.append(f"{hospital.get('address')}")
        message_parts.append(f"Contact: {hospital.get('contact')}")

    # ❓ Follow up (only if low/moderate)
    if severity in ["low", "moderate"] and followups:
        message_parts.append("\nTo better understand your condition:")
        for q in followups[:2]:
            message_parts.append(f"• {q}")


    message_parts.append("\n\nThis information is educational and not a substitute for professional medical advice.")

    final_message = "\n".join(message_parts)

    state["final_output"] = final_message
    return state


# -------------------------
# Build Graph
# -------------------------

builder = StateGraph(MedicalState)

builder.add_node("medical_node", medical_reasoning_node)
builder.add_node("clarification_node", clarification_node)
builder.add_node("hospital_node", hospital_node)
builder.add_node("final_node", final_node)

builder.set_entry_point("medical_node")

builder.add_conditional_edges(
    "medical_node",
    router_node,
    {
        "hospital_node": "hospital_node",
        "clarification_node": "clarification_node",
        "final_node": "final_node"
    }
)

builder.add_edge("hospital_node", "final_node")
builder.add_edge("clarification_node", END)
builder.add_edge("final_node", END)

medical_graph = builder.compile()