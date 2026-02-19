from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import faiss
import os
import numpy as np
import pickle

load_dotenv()

DATA_PATH = "data/disease_guidelines"
INDEX_PATH = "data/faiss_index"
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/all-MiniLM-L6-v2"
)

class MedicalRAG:

    def __init__(self):
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        self.index = None
        self.documents = []

    def load_documents(self):
        all_docs = []

        for file in os.listdir(DATA_PATH):
            if file.endswith(".pdf"):
                loader = PyMuPDFLoader(os.path.join(DATA_PATH, file))
                docs = loader.load()
                all_docs.extend(docs)

        return all_docs

    def split_documents(self, documents):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=250,
            chunk_overlap=50
        )
        return splitter.split_documents(documents)

    def create_index(self):

        documents = self.load_documents()
        split_docs = self.split_documents(documents)

        texts = [doc.page_content for doc in split_docs]
        embeddings = self.embedding_model.encode(texts, normalize_embeddings=True)

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(np.array(embeddings))

        self.documents = texts

        # Save index
        faiss.write_index(self.index, f"{INDEX_PATH}.index")

        with open(f"{INDEX_PATH}_docs.pkl", "wb") as f:
            pickle.dump(self.documents, f)

    def load_index(self):
        if os.path.exists(f"{INDEX_PATH}.index"):
            self.index = faiss.read_index(f"{INDEX_PATH}.index")

            if self.index.d != self.embedding_dim:
                # Index built with a different model; rebuild to avoid dimension mismatch.
                self.index = None
                self.documents = []
                return

            with open(f"{INDEX_PATH}_docs.pkl", "rb") as f:
                self.documents = pickle.load(f)

    def retrieve(self, query, top_k=1):
        query_embedding = self.embedding_model.encode([query], normalize_embeddings=True)
        distances, indices = self.index.search(np.array(query_embedding), top_k)

        results = [self.documents[i] for i in indices[0]]
        return results
    
    def initialize(self):
        if os.path.exists(f"{INDEX_PATH}.index"):
            self.load_index()
        if self.index is None:
            self.create_index()