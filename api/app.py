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
    print("Starting up API servers and initializing RAG components...")
    
    try:
        embedding_manager = EmbeddingManager()
    except Exception as e:
        print(f"[Startup Error] EmbeddingManager: {e}")
        embedding_manager = None

    try:
        chroma_manager = ChromaManager()
    except Exception as e:
        print(f"[Startup Error] ChromaManager: {e}")
        chroma_manager = None

    try:
        retriever = LeetCodeRetriever(embedding_manager, chroma_manager)
    except Exception as e:
        print(f"[Startup Error] LeetCodeRetriever: {e}")
        retriever = None

    try:
        generator = LeetCodeGenerator()
    except Exception as e:
        print(f"[Startup Error] LeetCodeGenerator: {e}")
        generator = None

    print("RAG startup initialization completed.")

@app.get("/")
async def root_health_check():
    return {"status": "online", "app": "Crack My DSA API", "database": "Supabase PostgreSQL"}

# Pydantic schemas
class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class QueryRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessage]] = None
    limit: Optional[int] = None
    user_email: Optional[str] = None

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
    global embedding_manager, chroma_manager, retriever, generator
    
    # Lazy fallback initialization if any component is missing
    if not retriever:
        try:
            if not embedding_manager:
                embedding_manager = EmbeddingManager()
            if not chroma_manager:
                chroma_manager = ChromaManager()
            retriever = LeetCodeRetriever(embedding_manager, chroma_manager)
        except Exception as e:
            print(f"[Query Error] Lazy retriever init fallback: {e}")
            retriever = LeetCodeRetriever(None, None)
            
    if not generator:
        try:
            generator = LeetCodeGenerator()
        except Exception as e:
            print(f"[Query Error] Lazy generator init fallback: {e}")
            generator = LeetCodeGenerator()
        
    try:
        # Get user's solved titles if email is passed
        user_solved_titles = []
        if request.user_email:
            try:
                from vectorstore.chat_db import ChatDatabaseManager
                db = ChatDatabaseManager()
                solved_list = db.get_user_solved_problems(request.user_email)
                user_solved_titles = [p.get("problem_title") or p.get("title") for p in solved_list if (p.get("problem_title") or p.get("title"))]
            except Exception as e:
                print(f"[Query Solved Fetch Error] {e}")

        # Check if user query asks to remove/exclude solved questions or if solved titles exist
        query_lower = request.query.lower()
        is_exclude_explicit = any(k in query_lower for k in ["already done", "unsolved", "todo", "not done", "not solved", "exclude", "remove"])

        # Fetch candidate pool (oversampled if filtering solved) so retrieved_questions contains full target_limit UNSOLVED problems
        target_limit = request.limit or 10
        fetch_limit = target_limit * 5 if (is_exclude_explicit or user_solved_titles) else target_limit
        candidates = retriever.retrieve(request.query, limit=fetch_limit)
        
        if (is_exclude_explicit or user_solved_titles) and user_solved_titles:
            solved_set = set(t.strip().lower() for t in user_solved_titles)
            retrieved_questions = [q for q in candidates if (q.get("title") or q.get("problem_title") or "").strip().lower() not in solved_set][:target_limit]
        else:
            retrieved_questions = candidates[:target_limit]

        # Format history
        history_dicts = []
        if request.history:
            history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
            
        # Generate LLM answer
        answer = generator.generate_response(
            query=request.query, 
            retrieved_questions=retrieved_questions, 
            chat_history=history_dicts,
            solved_titles=user_solved_titles if (is_exclude_explicit or user_solved_titles) else None
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

class SolvedProblemRequest(BaseModel):
    problem: Dict[str, Any]
    is_solved: bool

class LeetCodeSyncRequest(BaseModel):
    username: str

@app.get("/users/{email}/solved")
@app.get("/api/users/{email}/solved")
async def get_user_solved_problems(email: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        # Automatically sync LeetCode solved problems using candidate handles from email
        db.sync_leetcode_solved_by_email(email)
        return db.get_user_solved_problems(email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{email}/auto-sync")
@app.post("/api/users/{email}/auto-sync")
async def auto_sync_user_leetcode_by_email(email: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        count = db.sync_leetcode_solved_by_email(email)
        solved = db.get_user_solved_problems(email)
        return {"status": "success", "synced_count": count, "solved_problems": solved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{email}/solved")
@app.post("/api/users/{email}/solved")
async def toggle_user_solved_problem(email: str, request: SolvedProblemRequest):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        status = db.toggle_problem_solved(email, request.problem, request.is_solved)
        return {"status": "success", "is_solved": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{email}/sync-leetcode")
@app.post("/api/users/{email}/sync-leetcode")
async def sync_user_leetcode(email: str, request: LeetCodeSyncRequest):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        result = db.sync_leetcode_solved(email, request.username)
        solved = db.get_user_solved_problems(email)
        return {
            "status": "success",
            "synced_count": result.get("synced_count", 0),
            "stats": result.get("stats"),
            "solved_problems": solved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

