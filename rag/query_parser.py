from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import sys
import re
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from llm.gemini_client import GeminiClient

class QueryParameters(BaseModel):
    company: Optional[str] = Field(
        default=None, 
        description="The company name if mentioned or implied by conversation history (e.g., 'Google', 'Amazon', 'Meta', 'Microsoft', 'Uber', 'Apple', 'Goldman Sachs'). Match exact capitalization. Set to null if not mentioned or active."
    )
    difficulty: Optional[str] = Field(
        default=None, 
        description="The difficulty rating if mentioned or implied. Must be exactly 'Easy', 'Medium', or 'Hard' (or comma-separated if multiple). Set to null if not specified."
    )
    topic: Optional[str] = Field(
        default=None, 
        description="The specific algorithm/data structure topic if mentioned (e.g., 'Dynamic Programming', 'Graph', 'Binary Search', 'Array', 'Hash Table', 'Tree', 'Stack', 'Two Pointers'). DO NOT set to 'Database' for phrases like 'in database' or 'in the database' (those refer to storage, not problem topic). Set to null if not specified."
    )
    semantic_query: str = Field(
        description="The core semantic intent of the query, stripped of company names, difficulty levels, and dataset location phrases."
    )
    limit: int = Field(
        default=10, 
        description="The number of questions requested (e.g. 'Top 20' -> 20). If 'all', 'retrieve all', 'show all', default to 250."
    )
    sort_by: Optional[str] = Field(
        default=None,
        description="The property to sort results by. Must be 'frequency' if the user asks for 'top', 'popular', 'most frequent'. Must be 'acceptance_rate' if user asks for 'easiest', 'acceptance rate'. Set to null if no preference."
    )
    timeframe: Optional[str] = Field(
        default=None,
        description="The timeframe requested if mentioned. Must be '30 days', '3 months', '6 months', or null."
    )
    is_count_query: bool = Field(
        default=False,
        description="Set to true if the user asks 'how many', 'total count', 'count of questions', 'how many problems exist', etc."
    )
    wants_all: bool = Field(
        default=False,
        description="Set to true if the user explicitly asks for 'all', 'retrieve all', 'show all', 'all questions', 'everything', 'all in database'."
    )
    wants_one_by_one: bool = Field(
        default=False,
        description="Set to true if the user explicitly asks to 'explain one by one', 'explain each', 'step by step explanation for each', 'one by one', 'explain one after another'."
    )

class QueryParser:
    def __init__(self):
        self.llm_client = GeminiClient()
        self.system_instruction = (
            "You are an expert search engine query parser for a coding interview database.\n"
            "Your task is to analyze user queries and extract filters for company, difficulty, topic, "
            "limit, sort_by, timeframe, is_count_query, wants_all, and wants_one_by_one, and extract the remaining semantic query.\n\n"
            "CRITICAL DIRECTIVES:\n"
            "1. Location phrases like 'in database', 'in the database', 'in your database', 'in main database', 'in dataset', 'in total' refer to system storage location. DO NOT parse them as topic='Database'. Set topic='Database' ONLY if the user specifically asks about SQL/Database topic problems (e.g. 'SQL database questions', 'database design problems').\n"
            "2. If conversation history is provided, check if the current query is a short follow-up (e.g. 'topics', 'how many', 'show all', 'hard ones', 'where do they ask from'). Inherit active context (such as company name like 'Goldman Sachs') from previous conversation turns.\n"
            "3. If the user asks 'how many', 'total count', 'how many questions', set is_count_query = true.\n"
            "4. If the user asks for 'all', 'retrieve all', 'show all', 'all questions', 'all of them', set wants_all = true and limit = 250.\n"
            "5. If the user asks to 'explain one by one', 'explain each', 'one by one', set wants_one_by_one = true.\n"
            "Be precise. Set unused filters to null."
        )

    def fallback_parse_query(self, query: str, history: Optional[List[Dict[str, str]]] = None) -> QueryParameters:
        """Lightweight offline regex parser to extract filters without calling LLM."""
        q_lower = query.lower()
        
        # Clean dataset/storage location phrases so "in database" does NOT trigger topic="Database"
        clean_q = re.sub(r'\b(in|from|the|ur|your|main)\s+(database|dataset|db|system|collection)\b', '', q_lower).strip()

        company = None
        difficulty = None
        topic = None
        timeframe = None

        # Recognized company names for fallback parsing
        companies = [
            "Goldman Sachs", "Google", "Amazon", "Meta", "Microsoft", "Uber", 
            "Apple", "Netflix", "Bloomberg", "TikTok", "Oracle", "Salesforce", 
            "Zoho", "Adobe", "LinkedIn", "Twitter", "Walmart"
        ]
        for comp_name in companies:
            if comp_name.lower() in clean_q:
                company = comp_name
                break

        # If company missing in current query, inherit company from recent history
        if not company and history:
            for msg in reversed(history[-6:]):
                content_lower = msg.get("content", "").lower()
                for comp_name in companies:
                    if comp_name.lower() in content_lower:
                        company = comp_name
                        break
                if company:
                    break

        found_diffs = []
        if "easy" in clean_q: found_diffs.append("Easy")
        if "medium" in clean_q: found_diffs.append("Medium")
        if "hard" in clean_q: found_diffs.append("Hard")
        difficulty = ",".join(found_diffs) if 0 < len(found_diffs) < 3 else None

        topics_map = {
            "backtracking": "Backtracking",
            "graph": "Graph",
            "dynamic programming": "Dynamic Programming",
            "dp": "Dynamic Programming",
            "array": "Array",
            "string": "String",
            "tree": "Tree",
            "binary tree": "Tree",
            "hash table": "Hash Table",
            "hashmap": "Hash Table",
            "binary search": "Binary Search",
            "sliding window": "Sliding Window",
            "two pointers": "Two Pointers",
            "stack": "Stack",
            "recursion": "Recursion",
            "linked list": "Linked List",
            "bit manipulation": "Bit Manipulation",
            "trie": "Trie",
            "matrix": "Matrix",
            "heap": "Heap (Priority Queue)",
            "priority queue": "Heap (Priority Queue)",
            "greedy": "Greedy"
        }
        found_topics = []
        for k, v in topics_map.items():
            if k in clean_q:
                if v not in found_topics:
                    found_topics.append(v)
        
        # If user mentions a single topic, set topic filter. If multiple topics mentioned, keep topic = None to search across all of them
        if len(found_topics) == 1:
            topic = found_topics[0]
        else:
            topic = None

        wants_all = any(w in clean_q for w in ["retrieve all", "show all", "all questions", "all of them", "everything", "all in database", "all problems", "get all", "all"])
        is_count_query = any(w in clean_q for w in ["how many", "total count", "count of", "number of questions", "how many questions", "how many problems"])
        wants_one_by_one = any(w in clean_q for w in ["one by one", "explain each", "explain one by one", "step by step", "each question", "each problem"])

        if "30 days" in clean_q or "last month" in clean_q:
            timeframe = "30 days"
        elif "3 months" in clean_q or "last 3 months" in clean_q:
            timeframe = "3 months"
        elif "6 months" in clean_q or "last 6 months" in clean_q:
            timeframe = "6 months"
        elif ("recent" in clean_q or "recently" in clean_q) and not wants_all:
            timeframe = "3 months"
        else:
            timeframe = None

        limit = 250 if wants_all else 10
        limit_match = re.search(r'\b(top|get|show)\s+(\d+)\b', clean_q)
        if limit_match and not wants_all:
            limit = int(limit_match.group(2))

        sort_by = None
        if any(w in clean_q for w in ["top", "popular", "most frequent", "frequent", "frequency"]):
            sort_by = "frequency"
        elif any(w in clean_q for w in ["acceptance", "easiest"]):
            sort_by = "acceptance_rate"

        return QueryParameters(
            company=company,
            difficulty=difficulty,
            topic=topic,
            semantic_query=query,
            limit=limit,
            sort_by=sort_by,
            timeframe=timeframe,
            is_count_query=is_count_query,
            wants_all=wants_all,
            wants_one_by_one=wants_one_by_one
        )

    def parse_query(self, user_query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> QueryParameters:
        """Parses a user query in context of chat history and returns structured query parameters."""
        prompt = ""
        if chat_history:
            prompt += "Recent Conversation History:\n"
            for msg in chat_history[-6:]:
                role = "Candidate" if msg.get("role") == "user" else "Coach"
                prompt += f"{role}: {msg.get('content', '')}\n"
            prompt += "\n"

        prompt += f"Current User Search Query: '{user_query}'"
        
        try:
            parsed_params = self.llm_client.generate_structured(
                prompt=prompt,
                response_schema=QueryParameters,
                system_instruction=self.system_instruction
            )
            return parsed_params
        except Exception as e:
            print(f"Error parsing query via LLM: {e}. Falling back to regex parser.")
            return self.fallback_parse_query(user_query, chat_history)

if __name__ == "__main__":
    parser = QueryParser()
    res = parser.parse_query("how many questions do u have for goldman sachs in database")
    print(f"Parsed parameters: {res}")

