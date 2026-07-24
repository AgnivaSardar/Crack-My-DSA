from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from pathlib import Path
import sys
import json

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from configs import config
from embeddings.embed_data import EmbeddingManager
from vectorstore.chroma_manager import ChromaManager
from rag.retriever import LeetCodeRetriever
from rag.generator import LeetCodeGenerator
from run import run_ingestion

app = FastAPI(
    title="CodePrep AI API",
    description="Backend API for LeetCode Company Interview Assistant RAG application",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for RAG components
embedding_manager = None
chroma_manager = None
retriever = None
generator = None

@app.on_event("startup")
def startup_event():
    global embedding_manager, chroma_manager, retriever, generator
    try:
        print("Starting up API servers and initializing RAG components...")
        embedding_manager = EmbeddingManager()
        chroma_manager = ChromaManager()
        retriever = LeetCodeRetriever(embedding_manager, chroma_manager)
        generator = LeetCodeGenerator()
        print("All RAG components initialized successfully.")
    except Exception as e:
        print(f"Error initializing RAG components on startup: {e}")
        print("Startup warning: Some endpoints will fail if configuration/API keys are missing.")

# Pydantic schemas
class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class QueryRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessage]] = None
    limit: Optional[int] = None

class QueryResponse(BaseModel):
    answer: str
    retrieved_questions: List[Dict[str, Any]]

class IngestStatus(BaseModel):
    status: str
    message: str

@app.post("/query", response_model=QueryResponse)
@app.post("/api/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    """Submits a query to the RAG pipeline and returns the generated answer and references."""
    if not retriever or not generator:
        raise HTTPException(
            status_code=503, 
            detail="RAG pipeline is not fully initialized. Check database and API keys."
        )
        
    try:
        # Retrieve relevant questions
        retrieved_questions = retriever.retrieve(request.query, limit=request.limit)
        
        # Format history
        history_dicts = []
        if request.history:
            history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
            
        # Generate LLM answer
        answer = generator.generate_response(
            query=request.query, 
            retrieved_questions=retrieved_questions, 
            chat_history=history_dicts
        )
        
        return QueryResponse(
            answer=answer,
            retrieved_questions=retrieved_questions
        )
    except Exception as e:
        print(f"Error during query processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
@app.get("/api/stats")
async def get_db_stats():
    """Returns database statistics including total questions ingested."""
    if not chroma_manager:
        raise HTTPException(status_code=503, detail="Chroma DB is not connected.")
    return chroma_manager.get_stats()

@app.get("/metadata")
@app.get("/api/metadata")
async def get_filter_metadata():
    """Returns lists of all unique companies and topics available in the cleaned dataset."""
    cleaned_file = config.PROCESSED_DATA_DIR / "cleaned_problems.json"
    
    if not cleaned_file.exists():
        return {
            "companies": ["Google", "Amazon", "Meta", "Microsoft", "Netflix", "Apple"],
            "topics": ["Array", "String", "Hash Table", "Dynamic Programming", "Graph", "Tree", "Binary Search"]
        }
        
    try:
        with open(cleaned_file, "r", encoding="utf-8") as f:
            problems = json.load(f)
            
        companies = sorted(list(set(p["company"] for p in problems if p.get("company"))))
        
        # Flatten all topics lists and get unique ones
        all_topics = []
        for p in problems:
            all_topics.extend(p.get("topics", []))
        topics = sorted(list(set(all_topics)))
        
        return {
            "companies": companies,
            "topics": topics
        }
    except Exception as e:
        print(f"Error building filter metadata: {e}")
        raise HTTPException(status_code=500, detail="Failed to load metadata file.")

@app.post("/ingest", response_model=IngestStatus)
@app.post("/api/ingest", response_model=IngestStatus)
async def trigger_ingest(background_tasks: BackgroundTasks):
    """Triggers background data ingestion (clean, embed, and store in database)."""
    try:
        background_tasks.add_task(run_ingestion)
        return IngestStatus(
            status="accepted",
            message="Data ingestion and embedding generation has been triggered in the background."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UserRequest(BaseModel):
    email: str
    password: Optional[str] = None
    name: Optional[str] = None

class SaveSessionRequest(BaseModel):
    session_id: str
    user_email: Optional[str]
    title: str
    messages: List[Dict[str, Any]]
    last_references: List[Dict[str, Any]]

@app.post("/users")
@app.post("/api/users")
async def get_or_create_user(request: UserRequest):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        user = db.get_or_create_user(email=request.email, name=request.name, password=request.password)
        if isinstance(user, dict) and "error" in user:
            raise HTTPException(status_code=400, detail=user["error"])
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{email}/sessions")
@app.get("/api/users/{email}/sessions")
async def get_user_sessions(email: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        sessions = db.get_user_sessions(email)
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sessions")
@app.post("/api/sessions")
async def save_session(request: SaveSessionRequest):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        db.save_session(
            session_id=request.session_id,
            user_email=request.user_email,
            title=request.title,
            messages=request.messages,
            last_references=request.last_references
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/sessions/{session_id}")
@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        db.delete_session(session_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
