import json
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "drugs.json")

with open(DATA_PATH, "r") as f:
    DRUG_DATABASE = json.load(f)


def get_drug_information(drug_name: str):
    return DRUG_DATABASE.get(drug_name, {"error": "Drug not found"})