import json
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "hospitals.json")

with open(DATA_PATH, "r") as f:
    HOSPITALS = json.load(f)


def recommend_hospital(city: str, severity_level: str = None, specialist_type: str = None):
    city_key = city.strip().lower()

    # Normalize city keys
    normalized_data = {k.lower(): v for k, v in HOSPITALS.items()}

    city_data = normalized_data.get(city_key)

    if not city_data:
        return {"error": "City not found"}

    # Emergency logic
    if severity_level and severity_level.lower() == "emergency":
        for hospital in city_data:
            if hospital.get("emergency_available"):
                return hospital

    # Specialist logic
    if specialist_type:
        specialist_type = specialist_type.strip().capitalize()
        for hospital in city_data:
            if specialist_type in hospital.get("specialties", []):
                return hospital

    return city_data[0]
