# build_index.py

from app.rag import MedicalRAG

rag = MedicalRAG()
rag.create_index()

print("Index created successfully.")