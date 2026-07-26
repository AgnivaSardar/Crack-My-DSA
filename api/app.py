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

        # Check if user query EXPLICITLY asks to remove/exclude solved questions
        query_lower = request.query.lower()
        is_exclude_explicit = any(k in query_lower for k in [
            "already done", "unsolved", "todo", "not done", "not solved", 
            "exclude", "remove", "don't include", "dont include", "fresh", "new question"
        ])

        target_limit = request.limit or 10

        if is_exclude_explicit and user_solved_titles:
            # ONLY when user explicitly asks to exclude/remove solved questions:
            # Oversample candidate pool so retrieved_questions contains full target_limit UNSOLVED problems
            candidates = retriever.retrieve(request.query, limit=target_limit * 5)
            solved_set = set(t.strip().lower() for t in user_solved_titles)
            retrieved_questions = [q for q in candidates if (q.get("title") or q.get("problem_title") or "").strip().lower() not in solved_set][:target_limit]
        else:
            # Default behavior (normal queries): return top retrieved questions (both solved and unsolved)
            retrieved_questions = retriever.retrieve(request.query, limit=target_limit)

        # Format history
        history_dicts = []
        if request.history:
            history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
            
        # Generate LLM answer
        answer = generator.generate_response(
            query=request.query, 
            retrieved_questions=retrieved_questions, 
            chat_history=history_dicts,
            solved_titles=user_solved_titles if is_exclude_explicit else None
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

@app.get("/users/{email}/profile")
@app.get("/api/users/{email}/profile")
async def get_user_profile(email: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        username = db.get_leetcode_username(email)
        return {"email": email, "leetcode_username": username}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{email}/solved")
@app.get("/api/users/{email}/solved")
async def get_user_solved_problems(email: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        username = db.get_leetcode_username(email)
        if username:
            db.sync_leetcode_solved(email, username)
        return db.get_user_solved_problems(email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{email}/auto-sync")
@app.post("/api/users/{email}/auto-sync")
async def auto_sync_user_leetcode_by_email(email: str):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        username = db.get_leetcode_username(email)
        if not username:
            db.sync_leetcode_solved_by_email(email)
            username = db.get_leetcode_username(email)

        if username:
            result = db.sync_leetcode_solved(email, username)
            solved = db.get_user_solved_problems(email)
            return {"status": "success", "username": username, "synced_count": result.get("synced_count", 0), "stats": result.get("stats"), "solved_problems": solved}
        else:
            solved = db.get_user_solved_problems(email)
            return {"status": "no_username", "username": None, "synced_count": 0, "solved_problems": solved}
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
            "username": request.username,
            "synced_count": result.get("synced_count", 0),
            "stats": result.get("stats"),
            "solved_problems": solved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DSAProgressRequest(BaseModel):
    user_email: Optional[str] = None
    problem_id: str
    is_completed: bool

class DSADoubtRequest(BaseModel):
    user_email: str
    problem_id: str
    problem_title: str
    code_context: Optional[str] = None
    doubt_text: str

@app.get("/dsa/topics")
@app.get("/api/dsa/topics")
async def get_dsa_topics(user_email: Optional[str] = None):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        return db.get_dsa_topics(user_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dsa/topics/{topic_id}")
@app.get("/api/dsa/topics/{topic_id}")
async def get_dsa_topic_problems(topic_id: int, user_email: Optional[str] = None):
    try:
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        return db.get_dsa_topic_problems(topic_id, user_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dsa/progress")
@app.post("/api/dsa/progress")
async def toggle_dsa_progress(request: DSAProgressRequest):
    try:
        if not request.user_email:
            return {"status": "guest", "is_completed": request.is_completed}
        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        status = db.toggle_dsa_progress(request.user_email, request.problem_id, request.is_completed)
        return {"status": "success", "is_completed": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dsa/doubt")
@app.post("/api/dsa/doubt")
async def ask_dsa_doubt(request: DSADoubtRequest):
    try:
        global generator
        if not generator:
            try:
                generator = LeetCodeGenerator()
            except Exception:
                generator = None

        prompt = (
            f"You are an expert DSA teacher. A student has a private doubt on the problem '{request.problem_title}'.\n"
            f"Problem Code / Context:\n{request.code_context or 'N/A'}\n\n"
            f"Student's Doubt: {request.doubt_text}\n\n"
            f"Provide a clear, encouraging, step-by-step private explanation directly answering the student's doubt."
        )
        
        if generator:
            ai_answer = generator.generate_response(query=prompt, retrieved_questions=[])
        else:
            ai_answer = f"Great question regarding '{request.problem_title}'! Let's break down your doubt: {request.doubt_text}.\n\nWhen tackling this problem, keep in mind how the data structure handles operations in time and space complexity."

        from vectorstore.chat_db import ChatDatabaseManager
        db = ChatDatabaseManager()
        saved_doubt = db.save_dsa_doubt(
            user_email=request.user_email,
            problem_id=request.problem_id,
            doubt_text=request.doubt_text,
            ai_response=ai_answer
        )
        return {"status": "success", "doubt": saved_doubt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DSARunCodeRequest(BaseModel):
    language: str # 'cpp', 'java', 'c', 'python'
    code: str
    stdin: Optional[str] = ""
    problem_id: Optional[str] = None
    problem_title: Optional[str] = None

class DSASubmitCodeRequest(BaseModel):
    language: str
    code: str
    problem_id: str
    problem_title: str
    user_email: Optional[str] = None

@app.post("/dsa/run_code")
@app.post("/api/dsa/run_code")
async def run_dsa_code(request: DSARunCodeRequest):
    try:
        from api.code_runner import execute_user_code, get_problem_test_cases
        exec_res = execute_user_code(request.language, request.code, request.stdin or "", request.problem_title or "")
        
        # Run public sample test cases if problem_title supplied
        test_suite = get_problem_test_cases(request.problem_title or "")
        public_results = []
        
        for case in test_suite.get("public", []):
            c_res = execute_user_code(request.language, request.code, case["input"], request.problem_title or "")
            actual_out = (c_res.get("stdout") or "").strip()
            expected_out = case["expected"].strip()
            passed = (c_res.get("status") == "Success") and (actual_out == expected_out or expected_out in actual_out)
            
            public_results.append({
                "id": case["id"],
                "description": case["description"],
                "input": case["input"],
                "expected": case["expected"],
                "actual": actual_out if c_res.get("status") == "Success" else (c_res.get("stderr") or c_res.get("status")),
                "passed": passed
            })
            
        # Format rich stdout output showing all public test cases + custom input
        stdout_sections = []
        
        if request.stdin and request.stdin.strip():
            custom_out = (exec_res.get("stdout") or "").strip()
            stdout_sections.append(f"=== Custom Stdin Input ===\nInput:\n{request.stdin.strip()}\nOutput:\n{custom_out}\n")
            
        if public_results:
            stdout_sections.append("=== Public Sample Test Cases Output ===")
            for res in public_results:
                status_str = "PASSED" if res["passed"] else "FAILED"
                stdout_sections.append(
                    f"[Public Test Case #{res['id']}] - {res['description']}\n"
                    f"Input:           {res['input']}\n"
                    f"Expected Output: {res['expected']}\n"
                    f"Your Output:     {res['actual']}\n"
                    f"Status:          {status_str}\n"
                )
                
        rich_stdout = "\n".join(stdout_sections) if stdout_sections else (exec_res.get("stdout") or "").strip()

        return {
            "status": exec_res["status"],
            "stdout": rich_stdout,
            "stderr": exec_res["stderr"],
            "execution_time_ms": exec_res["execution_time_ms"],
            "public_test_results": public_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/dsa/submit_code")
@app.post("/api/dsa/submit_code")
async def submit_dsa_code(request: DSASubmitCodeRequest):
    try:
        from api.code_runner import execute_user_code, get_problem_test_cases
        test_suite = get_problem_test_cases(request.problem_title)
        all_cases = test_suite.get("public", []) + test_suite.get("private", [])
        
        results = []
        all_passed = True
        overall_status = "Accepted"
        total_time_ms = 0
        
        for case in all_cases:
            c_res = execute_user_code(request.language, request.code, case["input"])
            total_time_ms += c_res.get("execution_time_ms", 0)
            
            if c_res.get("status") == "Compilation Error":
                return {
                    "status": "Compilation Error",
                    "passed_count": 0,
                    "total_count": len(all_cases),
                    "stderr": c_res.get("stderr"),
                    "execution_time_ms": 0,
                    "test_results": []
                }
                
            actual_out = (c_res.get("stdout") or "").strip()
            expected_out = case["expected"].strip()
            passed = (c_res.get("status") == "Success") and (actual_out == expected_out or expected_out in actual_out)
            
            if not passed:
                all_passed = False
                if c_res.get("status") != "Success":
                    overall_status = c_res.get("status")
                elif overall_status == "Accepted":
                    overall_status = "Wrong Answer"
                    
            results.append({
                "id": case["id"],
                "is_private": case["is_private"],
                "description": case.get("description", f"Test Case {case['id']}"),
                "input": "Hidden" if case["is_private"] else case["input"],
                "expected": "Hidden" if case["is_private"] else case["expected"],
                "actual": "Hidden" if case["is_private"] else actual_out,
                "passed": passed
            })
            
        passed_count = sum(1 for r in results if r["passed"])
        
        # Mark problem completed if all passed
        if all_passed and request.user_email and request.user_email != "guest@local":
            try:
                from vectorstore.chat_db import ChatDatabaseManager
                db = ChatDatabaseManager()
                db.toggle_dsa_progress(request.user_email, request.problem_id, True)
            except Exception as ex:
                print(f"[Submit Progress Sync Error] {ex}")

        return {
            "status": "Accepted" if all_passed else overall_status,
            "passed_count": passed_count,
            "total_count": len(all_cases),
            "execution_time_ms": total_time_ms,
            "test_results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


