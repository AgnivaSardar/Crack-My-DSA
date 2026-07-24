from pydantic import BaseModel, Field
from typing import Optional, List
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from llm.gemini_client import GeminiClient

class QueryParameters(BaseModel):
    company: Optional[str] = Field(
        default=None, 
        description="The company name if mentioned (e.g., 'Google', 'Amazon', 'Meta', 'Microsoft', 'Uber', 'Apple', 'Netflix'). Match the capitalization of the company name. Set to null if not mentioned."
    )
    difficulty: Optional[str] = Field(
        default=None, 
        description="The difficulty rating if mentioned. Must be exactly 'Easy', 'Medium', or 'Hard'. Set to null if not mentioned."
    )
    topic: Optional[str] = Field(
        default=None, 
        description="The specific data structures or algorithm topic if mentioned (e.g., 'Dynamic Programming', 'Graph', 'Binary Search', 'Sliding Window', 'Array', 'Hash Table', 'Tree', 'Stack', 'Recursion', 'Two Pointers'). Set to null if not mentioned."
    )
    semantic_query: str = Field(
        description="The core semantic intent of the query, stripped of company names and difficulty levels, used to find matches in the vector database (e.g., 'graph path finding', 'lru cache structure', 'longest repeating character')."
    )
    limit: int = Field(
        default=10, 
        description="The number of questions requested (e.g. 'Top 20' -> 20, '5 questions' -> 5). Defaults to 10."
    )
    sort_by: Optional[str] = Field(
        default=None,
        description="The property to sort results by. Must be 'frequency' if the user asks for 'top', 'popular', 'most frequent', or 'frequent' questions. Must be 'acceptance_rate' if the user asks for 'highest acceptance', 'acceptance rate', 'easiest to pass', etc. Set to null if no sorting preference is specified."
    )
    timeframe: Optional[str] = Field(
        default=None,
        description="The timeframe of the questions requested if mentioned. Must be '30 days', '3 months', '6 months', or null. If 'recent' or 'recently' is mentioned, default to '3 months'. If 'last month' or 'last 30 days' is mentioned, set to '30 days'."
    )

class QueryParser:
    def __init__(self):
        self.llm_client = GeminiClient()
        self.system_instruction = (
            "You are an expert search engine query parser for a coding interview database. "
            "Your task is to analyze user queries and extract filters for company, difficulty, topic, "
            "limit, sort_by, and timeframe, and extract the remaining semantic query for vector similarity search. "
            "Be precise. If a filter is not mentioned in the query, set it to null."
        )

    def parse_query(self, user_query: str) -> QueryParameters:
        """Parses a user query and returns structured query parameters."""
        prompt = f"Analyze the following user search query and extract structured parameters: '{user_query}'"
        
        try:
            parsed_params = self.llm_client.generate_structured(
                prompt=prompt,
                response_schema=QueryParameters,
                system_instruction=self.system_instruction
            )
            return parsed_params
        except Exception as e:
            print(f"Error parsing query: {e}. Falling back to default parameters.")
            # Fallback
            return QueryParameters(semantic_query=user_query, limit=10, sort_by=None)

if __name__ == "__main__":
    parser = QueryParser()
    res = parser.parse_query("Show me Google Hard Graph questions asked in the last year")
    print(f"Parsed parameters: {res}")
