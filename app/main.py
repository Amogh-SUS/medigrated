from fastapi import FastAPI
from pydantic import BaseModel
from app.llm import get_medical_response
from app.database import get_user_city, init_db, save_user_city
from app.agents import medical_graph
from typing import Optional
import asyncio
from app.rag import MedicalRAG
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request


templates = Jinja2Templates(directory="templates")


app = FastAPI(title="Medical AI Chatbot")

init_db()

class ChatRequest(BaseModel):
    session_id: str
    message: str
    city: Optional[str] = None

KNOWN_CITIES = ["Hyderabad", "Bangalore", "Mumbai", "Delhi"]

def detect_city_from_message(message: str):
    for city in KNOWN_CITIES:
        if city.lower() in message.lower():
            return city
    return None


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat", response_class=PlainTextResponse)
async def chat_endpoint(request: ChatRequest):

    message = request.message
    city = request.city

    if not city:
        detected_city = detect_city_from_message(message)
        if detected_city:
            city = detected_city

    # If user sent city → save it
    if city:
        save_user_city(request.session_id, city)

    # If no city → try loading from DB
    if not city:
        city = get_user_city(request.session_id)

    

    state = {
        "session_id": request.session_id,
        "message": request.message,
        "city": city,
        "rag": rag,
        "llm_output": {},
        "hospital_info": None,
        "final_output": {}
    }

    result = await medical_graph.ainvoke(state)

    final = result["final_output"]

    if isinstance(final, dict):
        final = str(final)

    return final


rag = None

@app.on_event("startup")
async def startup_event():
    global rag
    rag = MedicalRAG()
    rag.initialize()