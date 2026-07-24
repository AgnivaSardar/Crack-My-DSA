from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os

app = FastAPI(
    title="CodePrep AI Embedding Service",
    description="Microservice for generating text embeddings locally",
    version="1.0.0"
)

model = None

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]

@app.on_event("startup")
def startup():
    global model
    try:
        from sentence_transformers import SentenceTransformer
        print("[EmbeddingService] Loading SentenceTransformer 'all-MiniLM-L6-v2'...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[EmbeddingService] Model loaded successfully.")
    except Exception as e:
        print(f"[EmbeddingService] Fatal error loading model: {e}")

@app.post("/embed", response_model=EmbedResponse)
def get_embeddings(request: EmbedRequest):
    if not model:
        raise HTTPException(
            status_code=503, 
            detail="Embedding model is not loaded yet."
        )
    if not request.texts:
        return EmbedResponse(embeddings=[])
        
    try:
        # Generate embeddings
        embeddings = model.encode(
            request.texts, 
            batch_size=64, 
            show_progress_bar=False
        )
        return EmbedResponse(embeddings=embeddings.tolist())
    except Exception as e:
        print(f"[EmbeddingService] Error encoding texts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
